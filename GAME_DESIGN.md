# RTS Game Design Document

## Game Overview
A real-time strategy game featuring worker and fighter units with resource gathering, base building, and tactical combat.

## Core Mechanics

### Units
1. **Worker Units**
   - Gather resources (gold, wood)
   - Build structures
   - Can be trained at Town Hall
   - Animations: Walking, Idle
   - Cost: 50 gold

2. **Fighter Units**
   - Combat units that attack enemies
   - Can be trained at Barracks
   - Animations: Combat Stance, Axe Spin Attack, Charged Slash, Left Slash, Rifle Charge, Walking, Idle, Death
   - Cost: 100 gold, 50 wood
   - Stats: 100 HP, 15 attack damage, 1.5 attack speed

### Resources
- **Gold**: Primary currency for training units
- **Wood**: Used for buildings and fighter units
- **Food**: Population cap (each unit consumes food)

### Buildings
1. **Town Hall** (Main Base)
   - Trains workers
   - Drop-off point for resources
   - HP: 1500

2. **Barracks**
   - Trains fighter units
   - Cost: 200 gold, 150 wood
   - HP: 800

3. **Gold Mine**
   - Resource gathering point
   - Workers gather gold here

4. **Forest**
   - Resource gathering point
   - Workers gather wood here

### Controls
- **Left Click**: Select units/buildings
- **Right Click**: Move/Attack/Gather command
- **Drag Select**: Select multiple units
- **WASD/Arrow Keys**: Move camera
- **Mouse Wheel**: Zoom camera
- **1-9**: Control groups
- **Spacebar**: Select all idle workers

### Game Flow
1. Start with Town Hall and 3 workers
2. Gather resources
3. Build Barracks
4. Train fighters
5. Expand and control the map
6. Defeat enemy units and buildings

## Technical Stack
- **Three.js**: 3D rendering engine
- **FBXLoader**: Load character models and animations
- **Custom A* Pathfinding**: Unit movement
- **Custom Animation System**: Blend between animations
- **Simple Physics**: Collision detection and unit separation

## File Structure
```
/RTS-GAME
├── index.html (Main game file)
├── src/
│   ├── core/
│   │   ├── Game.js (Main game class)
│   │   ├── InputManager.js (Handle user input)
│   │   └── ResourceManager.js (Load assets)
│   ├── entities/
│   │   ├── Unit.js (Base unit class)
│   │   ├── Worker.js (Worker unit)
│   │   ├── Fighter.js (Fighter unit)
│   │   └── Building.js (Building class)
│   ├── systems/
│   │   ├── AnimationController.js (Manage animations)
│   │   ├── PathfindingSystem.js (A* pathfinding)
│   │   ├── CombatSystem.js (Handle combat)
│   │   └── SelectionSystem.js (Unit selection)
│   ├── ui/
│   │   ├── HUD.js (Resource display, unit info)
│   │   └── Minimap.js (Small map overview)
│   └── utils/
│       ├── Math.js (Math utilities)
│       └── Constants.js (Game constants)
└── assets/ (FBX models and textures)
```

## Development Phases
1. Phase 1: Core engine and rendering
2. Phase 2: Unit movement and pathfinding
3. Phase 3: Resource gathering
4. Phase 4: Building construction
5. Phase 5: Combat system
6. Phase 6: UI and polish
