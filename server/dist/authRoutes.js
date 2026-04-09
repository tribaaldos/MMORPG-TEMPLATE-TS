"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("./db");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production';
// POST /auth/register
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        res.status(400).json({ error: 'Email, password y nombre son obligatorios' });
        return;
    }
    const existing = await db_1.prisma.user.findUnique({ where: { email } });
    if (existing) {
        res.status(409).json({ error: 'El email ya está registrado' });
        return;
    }
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await db_1.prisma.user.create({
        data: { email, password: hashed, name },
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});
// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email y password son obligatorios' });
        return;
    }
    const user = await db_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(401).json({ error: 'Credenciales incorrectas' });
        return;
    }
    const valid = await bcryptjs_1.default.compare(password, user.password);
    if (!valid) {
        res.status(401).json({ error: 'Credenciales incorrectas' });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
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
    });
});
// GET /auth/me — devuelve los datos actuales del jugador
router.get('/me', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) {
        res.status(401).json({ error: 'Token requerido' });
        return;
    }
    const token = auth.replace('Bearer ', '');
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch {
        res.status(401).json({ error: 'Token inválido' });
        return;
    }
    const user = await db_1.prisma.user.findUnique({
        where: { id: payload.userId },
        include: { inventoryItems: true },
    });
    if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
    }
    const SLOTS = ['helmet', 'chest', 'legs', 'boots', 'gloves', 'weapon', 'shield', 'shoulders', 'ring', 'trinket'];
    const equipment = Object.fromEntries(SLOTS.map(s => [s, null]));
    const inventory = Array(20).fill(null);
    for (const item of user.inventoryItems) {
        if (item.equipSlot) {
            equipment[item.equipSlot] = item.itemKey;
        }
        else if (item.slotIndex >= 0 && item.slotIndex < 20) {
            inventory[item.slotIndex] = item.itemKey;
        }
    }
    res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        posX: user.posX,
        posY: user.posY,
        posZ: user.posZ,
        world: user.world,
        equipment,
        inventory,
        gold: user.gold ?? 9999999,
        level: user.level ?? 1,
        exp: user.exp ?? 0,
        statPoints: user.statPoints ?? 0,
        strength: user.strength ?? 10,
        agility: user.agility ?? 10,
        intelligence: user.intelligence ?? 10,
        critRate: user.critRate ?? 15,
    });
});
// PUT /auth/gold — guarda el oro del jugador
router.put('/gold', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) {
        res.status(401).json({ error: 'Token requerido' });
        return;
    }
    const token = auth.replace('Bearer ', '');
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch {
        res.status(401).json({ error: 'Token inválido' });
        return;
    }
    const { gold } = req.body;
    if (typeof gold !== 'number') {
        res.status(400).json({ error: 'gold requerido' });
        return;
    }
    await db_1.prisma.user.update({
        where: { id: payload.userId },
        data: { gold },
    });
    res.json({ ok: true });
});
// PUT /auth/position  — guarda la última posición del jugador
router.put('/position', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) {
        res.status(401).json({ error: 'Token requerido' });
        return;
    }
    const token = auth.replace('Bearer ', '');
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch {
        res.status(401).json({ error: 'Token inválido' });
        return;
    }
    const { posX, posY, posZ, world } = req.body;
    await db_1.prisma.user.update({
        where: { id: payload.userId },
        data: { posX, posY, posZ, world },
    });
    res.json({ ok: true });
});
// PUT /auth/inventory — guarda equipo e inventario de forma atómica
router.put('/inventory', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) {
        res.status(401).json({ error: 'Token requerido' });
        return;
    }
    const token = auth.replace('Bearer ', '');
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch {
        res.status(401).json({ error: 'Token inválido' });
        return;
    }
    const { equipment, inventory } = req.body;
    const userId = payload.userId;
    const records = [];
    for (const [slot, key] of Object.entries(equipment)) {
        if (key)
            records.push({ userId, itemKey: key, quantity: 1, slotIndex: -1, equipSlot: slot });
    }
    ;
    inventory.forEach((key, index) => {
        if (key)
            records.push({ userId, itemKey: key, quantity: 1, slotIndex: index, equipSlot: null });
    });
    await db_1.prisma.$transaction([
        db_1.prisma.inventoryItem.deleteMany({ where: { userId } }),
        db_1.prisma.inventoryItem.createMany({ data: records }),
    ]);
    res.json({ ok: true });
});
// PUT /auth/experience — guarda nivel y experiencia
router.put('/experience', async (req, res) => {
    const auth = req.headers.authorization;
    if (!auth) {
        res.status(401).json({ error: 'Token requerido' });
        return;
    }
    const token = auth.replace('Bearer ', '');
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch {
        res.status(401).json({ error: 'Token inválido' });
        return;
    }
    const { level, exp, statPoints, strength, agility, intelligence, critRate } = req.body;
    if (typeof level !== 'number' || typeof exp !== 'number') {
        res.status(400).json({ error: 'level y exp requeridos' });
        return;
    }
    await db_1.prisma.user.update({
        where: { id: payload.userId },
        data: {
            level,
            exp,
            ...(typeof statPoints === 'number' && { statPoints }),
            ...(typeof strength === 'number' && { strength }),
            ...(typeof agility === 'number' && { agility }),
            ...(typeof intelligence === 'number' && { intelligence }),
            ...(typeof critRate === 'number' && { critRate }),
        },
    });
    res.json({ ok: true });
});
// POST /auth/position-beacon — para sendBeacon al cerrar pestaña (token en query)
router.post('/position-beacon', async (req, res) => {
    const token = req.query.token;
    if (!token) {
        res.sendStatus(204);
        return;
    }
    let payload;
    try {
        payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch {
        res.sendStatus(204);
        return;
    }
    const { posX, posY, posZ, world } = req.body;
    await db_1.prisma.user.update({
        where: { id: payload.userId },
        data: { posX, posY, posZ, world },
    }).catch(() => { });
    res.sendStatus(204);
});
exports.default = router;
