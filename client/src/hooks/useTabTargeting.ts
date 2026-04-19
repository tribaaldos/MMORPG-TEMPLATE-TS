import { useEffect } from 'react'
import * as THREE from 'three'
import { useMonsterStore, getMonsterRefs } from '../worlds/dungeons/monsters/useMonsterStore'
import { useTargetStore } from '../store/useTargetStore'
import { useCharacterStore } from '../store/useCharacterStore'

const _playerVec = new THREE.Vector3()
const _monsterVec = new THREE.Vector3()

export function useTabTargeting() {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code !== 'Tab') return
            e.preventDefault()

            const [px, py, pz] = useCharacterStore.getState().position
            _playerVec.set(px, py, pz)

            const monsters = useMonsterStore.getState().monsters
            const refs = getMonsterRefs()

            let nearestId: string | null = null
            let nearestDist = Infinity

            for (const [id, group] of Object.entries(refs)) {
                const monster = monsters[id]
                // skip dead monsters
                if (monster && monster.hp <= 0) continue

                _monsterVec.copy(group.position)
                const dist = _playerVec.distanceTo(_monsterVec)

                if (dist < nearestDist) {
                    nearestDist = dist
                    nearestId = id
                }
            }

            if (!nearestId) return

            const monster = monsters[nearestId]
            const group = refs[nearestId]
            const targetPos = group.position.clone()
            targetPos.y += 2.5

            useTargetStore.getState().setSelectedTarget({
                id: nearestId,
                name: monster?.name ?? nearestId,
                level: monster?.level,
                hp: monster?.hp,
                maxHp: monster?.maxHp,
                position: targetPos,
                kind: 'monster',
            })
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])
}
