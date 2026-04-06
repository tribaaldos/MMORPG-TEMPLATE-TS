# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multiplayer 3D MMORPG template built with React Three Fiber (WebGPU rendering), real-time multiplayer via Socket.io, and a PostgreSQL backend via Prisma (hosted on Supabase). Monorepo with separate `client/` and `server/` packages.

## Commands

### Client (from `client/`)
```bash
npm run dev       # Vite dev server → http://localhost:5173
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Server (from `server/`)
```bash
npm run dev       # nodemon + ts-node → http://localhost:5174
npm run build     # Compile TypeScript → dist/
npm start         # Run dist/index.js
npx prisma migrate dev --name <name>   # Create + apply migration (run from a real terminal, not Claude Code's bash)
npx prisma generate                    # Regenerate Prisma client after schema changes
```

No test runner is configured.

## Architecture

### Client (`client/src/`)

**Entry flow:** `main.tsx` → `App.tsx` → `Experience.tsx` (3D canvas)

**`main.tsx`** wraps everything in `DndProvider` (react-dnd HTML5Backend), `PopupProvider` (react-hook-popup), and `BrowserRouter`. The `ItemDragLayer` component is mounted here (outside any CSS transform context) for correct drag preview positioning.

**`App.tsx`** handles auth rehydration on load — calls `GET /auth/me`, loads position/world/gold/equipment/inventory, emits `playerJoin`, and applies the loadout to the socket.id via `applyLoadout()`.

**`Experience.tsx`** hosts the R3F `<Canvas>` with WebGPU renderer and manages world switching (`currentWorld` state: `world1`, `dungeon`, `dragonDungeon`). Mounts `useSavePosition`, `useSaveGold`, and `useSaveEquipment` hooks.

**World system** (`worlds/`): Each world is a standalone R3F scene component. `StartWorld.tsx` has 3 portals (Dragon Dungeon, ICC Dungeon, Shader Visualizer). Dungeons live under `worlds/dungeons/`.

**State management — two libraries side by side:**
- **Zustand** (`store/`): `useCharacterStore` (stats, gold, position), `useInventoryStore` (inventory + equipment keyed by socketId), `useAuthStore` (token, savedLoadout), `useUIStore`, `useTargetStore`, `useLootStore` (chest loot popup), `useDialogueStore` (NPC dialogue trees), `useShopStore` (NPC shop panel).
- **Jotai** (atoms in `SocketManager.tsx`): Multiplayer state — `usersAtom`, `remotePlayersAtom`, `remoteAnimationsAtom`, `remoteNamesAtom`, `chatByIdAtom`.

**Networking** (`socket/SocketManager.tsx`): Manages all Socket.io listeners. Key events: `playerJoin`, `playerJoined`, `existingPlayers`, `equipmentSnapshot`, `remoteEquipment`, `playerEquipment`, `remotePosition`, `remoteAnim`, `projectileSpawn`, `chatMessage`, monster AI updates.

**Inventory & Equipment system:**
- `useInventoryStore` — state keyed by `socketId` (supports local + remote players)
- `itemRegistry.ts` — single source of truth for all item definitions. Always look up items by `name` (not object reference) for serialization, as shop items are spread copies.
- `useSaveEquipment(socketId)` — debounced (3s) hook that serializes inventory+equipment to `PUT /auth/inventory`
- Equipment is synced in real-time via `socket.emit('playerEquipment', { slot, itemKey })`
- `frustumCulled={false}` is correct and expected on all equipment meshes (skinned mesh bounding boxes don't update with animations)

**NPC system:**
- `KShop` (3D, `components/npc/Shop.tsx`) — proximity detection (radius 5u), floating HTML hint, opens `useDialogueStore` on click. All items from the registry are for sale.
- `Dialogue.tsx` (UI) — RPG dialogue box driven by `useDialogueStore` with branching trees. Shop can be opened from dialogue via `CustomEvent('open-blacksmith-shop')`.
- `LootPopup.tsx` (UI) — driven by `useLootStore`, mounted in `MainUI`. Chests call `openLoot(items)` on animation finish and dissolve when the popup is closed.

**Character system** (`character/noPhysicsCharacter/`):
- `FullBVH.tsx` — local player, BVH collision (no Rapier)
- `extra/remoteBVHCharacter.tsx` — remote players rendering
- `CharacterModel.tsx` — renders character + equipped items (weapon, shoulders, legs, boots, gloves, shield)
- `skills/` — projectile system with `useProjectileStore`

**Monster system** (`worlds/dungeons/monsters/`): Each monster has a local component and a networked component. Per-monster Zustand stores (`wolfStore`, `spiderStore`).

### Server (`server/src/`)

**`index.ts`**: Express + Socket.io on port 5174. In-memory maps: `playerNames`, `socketToUserId`, `equipmentByPlayer`. On `playerJoin`, loads equipment from DB via `loadEquipmentFromDb()`. The `playerEquipment` socket handler updates the in-memory snapshot and rebroadcasts — **does not write to DB** (REST `PUT /auth/inventory` handles persistence).

**`authRoutes.ts`** — REST endpoints:
- `POST /auth/register`, `POST /auth/login`
- `GET /auth/me` — returns user + inventory/equipment built from `InventoryItem` table
- `PUT /auth/inventory` — atomic `deleteMany + createMany` on `InventoryItem`
- `PUT /auth/position`, `POST /auth/position-beacon`
- `PUT /auth/gold`

**Monster AI managers** (`wolfManager.ts`, `spiderManager.ts`, `dragonManager.ts`): 20 Hz loop (50ms). Idle → chase → attack state machine, broadcasts via `io.emit()`.

### Database (Prisma + PostgreSQL/Supabase)

Schema: `User` + `InventoryItem` (replaced the old flat `equip*` columns and `inventory String[]`).

```prisma
model InventoryItem {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(...)
  itemKey   String         // key in itemRegistry
  quantity  Int     @default(1)
  slotIndex Int            // 0-19 for bag slots, -1 if equipped
  equipSlot String?        // null if in bag, "weapon"/"helmet"/etc if equipped
  @@index([userId])
}
```

Use `npx prisma migrate dev` from a real terminal — it works fine with Supabase. It fails when run from Claude Code's bash tool because there's no TTY. Never use `db push` as it skips migration history.

### Key Conventions

- **WebGPU renderer**: Materials must be WebGPU-compatible. Fallback check in `Experience.tsx`.
- **BVH collision** (not Rapier): Player uses BVH. `PhysicsWorld/` is an experiment directory.
- **Item lookup by name**: Always use `item.name` to find `ItemKey`, never object reference equality — shop items are `{ ...registryItem, id, price }` spread copies.
- **socketId as playerId**: All inventory/equipment state is keyed by `socket.id`. On reconnect, the loadout is re-applied from `useAuthStore.savedLoadout`.
- **`isDebug` flag**: Gates expensive rendering (grass instancing, collider visualization). Currently hardcoded `true` in `Experience.tsx`.
- **CORS**: Server currently allows `*`. Restrict to `localhost:5173` (or production domain) before deploying.
- **Deployment**: `netlify.toml` at root for client; server deploys separately.
