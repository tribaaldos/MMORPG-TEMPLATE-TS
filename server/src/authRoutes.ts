import 'dotenv/config'
import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production'

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
        res.status(400).json({ error: 'Email, password y nombre son obligatorios' })
        return
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        res.status(409).json({ error: 'El email ya está registrado' })
        return
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
        data: { email, password: hashed, name },
    })

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
})

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
        res.status(400).json({ error: 'Email y password son obligatorios' })
        return
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        res.status(401).json({ error: 'Credenciales incorrectas' })
        return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
        res.status(401).json({ error: 'Credenciales incorrectas' })
        return
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            posX: user.posX,
            posY: user.posY,
            posZ: user.posZ,
            world: user.world,
        },
    })
})

// GET /auth/me — devuelve los datos actuales del jugador
router.get('/me', async (req: Request, res: Response) => {
    const auth = req.headers.authorization
    if (!auth) { res.status(401).json({ error: 'Token requerido' }); return }

    const token = auth.replace('Bearer ', '')
    let payload: { userId: string }
    try {
        payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch {
        res.status(401).json({ error: 'Token inválido' }); return
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return }

    res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        posX: user.posX,
        posY: user.posY,
        posZ: user.posZ,
        world: user.world,
    })
})

// PUT /auth/position  — guarda la última posición del jugador
router.put('/position', async (req: Request, res: Response) => {
    const auth = req.headers.authorization
    if (!auth) {
        res.status(401).json({ error: 'Token requerido' })
        return
    }

    const token = auth.replace('Bearer ', '')
    let payload: { userId: string }
    try {
        payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch {
        res.status(401).json({ error: 'Token inválido' })
        return
    }

    const { posX, posY, posZ, world } = req.body
    await prisma.user.update({
        where: { id: payload.userId },
        data: { posX, posY, posZ, world },
    })

    res.json({ ok: true })
})

// POST /auth/position-beacon — para sendBeacon al cerrar pestaña (token en query)
router.post('/position-beacon', async (req: Request, res: Response) => {
    const token = req.query.token as string
    if (!token) { res.sendStatus(204); return }

    let payload: { userId: string }
    try {
        payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    } catch {
        res.sendStatus(204); return
    }

    const { posX, posY, posZ, world } = req.body
    await prisma.user.update({
        where: { id: payload.userId },
        data: { posX, posY, posZ, world },
    }).catch(() => { })

    res.sendStatus(204)
})

export default router
