# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A multiplayer 3D MMORPG template built with React Three Fiber (WebGPU rendering), featuring real-time multiplayer via Socket.io. Monorepo with separate `client/` and `server/` packages.

## Commands

### Client (from `client/`)
```bash
npm run dev       # Start Vite dev server (port 5173)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

### Server (from `server/`)
```bash
npm run dev       # Start with nodemon + ts-node (port 5174)
npm run build     # Compile TypeScript to dist/
npm start         # Run compiled dist/index.js
```

### Root
```bash
npm run build     # Builds client only (cd client && vite build)
```

No test runner is configured — there are no test files.

## Architecture

### Client (`client/src/`)

**Entry flow:** `main.tsx` → `App.tsx` (routing) → `Experience.tsx` (3D canvas)

**`Experience.tsx`** is the core — it hosts the R3F `<Canvas>` with WebGPU renderer and manages world switching via a `currentWorld` state (world1, dungeon, dragonDungeon). All keyboard controls, physics, and rendering layers are configured here.

**World system** (`worlds/`): Each world is a standalone R3F scene component. Portals in `StartWorld.tsx` trigger teleportation via a loading overlay (`UI/WorldLoadingOverlay.tsx`). Dungeons live under `worlds/dungeons/`.

**State management — two libraries used side by side:**
- **Zustand** (`store/`): Player stats, inventory, UI state, audio, performance. Use `useCharacterStore`, `useInventoryStore`, `useTargetStore`, `useUIStore`.
- **Jotai** (atoms defined inline): Multiplayer-specific state — connected users, remote player positions/rotations/animations, chat history. Atoms like `usersAtom`, `remotePlayersAtom`, `remoteAnimationsAtom`, `chatByIdAtom`.

**Networking** (`socket/SocketManager.tsx`): Single component that manages all Socket.io event listeners and dispatches to Jotai atoms and Zustand stores. Handles: player join/disconnect, position sync, animation sync, equipment changes, projectile spawning, chat, monster AI updates.

**Character system** (`character/noPhysicsCharacter/`):
- `FullBVH.tsx` — local player with BVH collision detection (no Rapier physics on player)
- `extra/remoteBVHCharacter.tsx` — rendering for other players
- `extra/StaticCollider.tsx` — static environment collision meshes
- `skills/` — projectile skill system with its own Zustand store (`useProjectileStore.ts`)

**Monster system** (`worlds/dungeons/monsters/`): Each monster type has a local component (e.g., `WolfLocal.tsx`) and a networked component (e.g., `Wolf.tsx`). State is in per-monster Zustand stores (`wolfStore.ts`, `spiderStore.ts`).

**Items** (`items/`): Organized by slot (boots, weapons, shields, gloves, shoulders, pants). `itemRegistry.ts` is the central item lookup.

### Server (`server/src/`)

**`index.ts`**: Express + Socket.io server on port 5174. Manages player sessions, chat history (50 message limit), equipment state, and delegates monster AI to manager modules.

**Monster AI managers** (`wolfManager.ts`, `spiderManager.ts`, `dragonManager.ts`): Run at 20 Hz (50ms loop). Each manager tracks player positions, computes AI behavior (idle → chase → attack), and broadcasts state via `io.emit()`.

### Key Conventions

- **WebGPU renderer**: The client uses `@react-three/fiber`'s WebGPU canvas. Shader code and materials should be compatible with WebGPU; there's a fallback check in `Experience.tsx`.
- **BVH collision** (not Rapier): The player uses a BVH-based collision system, not `@react-three/rapier`. The `PhysicsWorld/` directory exists for Rapier-based experiments.
- **Leva debug panel**: Many components accept debug toggles via `leva/` config. Use `isDebug` flags to gate expensive rendering (e.g., grass instancing in `GrassBlock.tsx`).
- **Client CORS**: Server allows `localhost:5173` only. Update CORS config in `server/src/index.ts` for production.
- **Deployment**: `netlify.toml` at root for client; server deploys separately.
