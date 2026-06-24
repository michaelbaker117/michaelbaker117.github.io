# Mythandria (Single-Player MVP)

Phase 0 scaffold: a runnable Phaser 3 + TypeScript + Vite project with scene flow,
a typed event bus, Vitest tests, and a controllable placeholder character with a
following camera.

## Requirements

- Node.js 18 or newer (built and tested on Node 22)

## Setup

```bash
npm install
```

## Run the game (dev server)

```bash
npm run dev
```

Then open the printed URL (default http://localhost:5173). Press ENTER or click to
start, then move with WASD or the arrow keys. The camera follows the character and
the HUD overlay shows placeholder bars plus a live coordinate readout.

## Other commands

```bash
npm test         # run the Vitest unit tests once
npm run test:watch
npm run typecheck  # tsc --noEmit
npm run build      # type check, then produce a static bundle in dist/
npm run preview    # serve the production build
```

## What Phase 0 includes

- Vite + TypeScript + Phaser 3 project that builds clean under strict mode.
- Scene flow: Boot, Preload, MainMenu, GameScene, with UIScene running in
  parallel as a HUD overlay.
- A typed event bus (`src/util/events.ts`) whose `GameEvents` map is the single
  source of truth for events. Phase 0 emits `game:ready` and `scene:changed`;
  later events are forward declared.
- A `Player` entity with 8 direction movement, world bounds collision, and a
  facing vector reserved for later combat aiming.
- A large tiled world with a smoothing follow camera.
- Procedurally generated placeholder textures, so there are no art dependencies.
- Vitest tests for the event bus and core constants.

## Project structure

```
src/
  main.ts                 game bootstrap + scene registration
  config.ts               Phaser game config factory
  constants.ts            game constants and palette (Phaser free, testable)
  scenes/
    BootScene.ts
    PreloadScene.ts        generates placeholder textures
    MainMenuScene.ts
    GameScene.ts           world, player, camera, input, launches UIScene
    UIScene.ts             parallel HUD overlay
  entities/
    Player.ts
  util/
    events.ts             typed event bus
tests/
  events.test.ts
  smoke.test.ts
```

## What is intentionally NOT here yet

Phase 0 stops at a runnable shell. No combat, enemies, progression, inventory,
quests, boss, save system, or real art. Those arrive in Phases 1 through 10 of
the development plan. The next step (Phase 1) is the real zone tilemap,
interaction triggers, and the save scaffold.

## Notes for the next build session

- Keep `constants.ts` and `util/events.ts` free of Phaser imports so they remain
  unit testable in the node test environment.
- New events go in the `GameEvents` map first, then get emitted.
- New content (enemies, items, skills, quests) should live in a `src/data/`
  folder as plain data, per the architecture in the development plan.
