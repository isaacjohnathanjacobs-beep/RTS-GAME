# RTS Game - Workers vs Fighters

A complete real-time strategy game built with Three.js, featuring animated 3D characters, resource gathering, base building, and tactical combat.

## Features

### Units
- **Workers**: Gather resources (gold and wood) and return them to your town hall
- **Fighters**: Combat units with attack animations and health management

### Buildings
- **Town Hall**: Main base that trains workers and serves as a resource drop-off point
- **Barracks**: Military structure that trains fighter units
- **Gold Mines**: Resource nodes for gathering gold
- **Forests**: Resource nodes for gathering wood

### Game Mechanics
- **Resource Management**: Collect gold and wood to build your economy
- **Unit Training**: Train workers and fighters using resources
- **Combat System**: Fighters automatically engage enemies within range
- **Pathfinding**: A* algorithm for intelligent unit movement
- **Selection System**: Box selection, control groups, and multi-unit commands
- **Animated 3D Models**: Smooth transitions between idle, walking, combat, and death animations

## How to Play

### Starting the Game

**Important**: Due to browser security (CORS), you need to run a local web server. Choose one of these methods:

#### Method 1: Use the Launcher Scripts (Easiest)
- **Windows**: Double-click `start-server.bat`
- **Mac/Linux**: Run `./start-server.sh` or `bash start-server.sh`
- Then open http://localhost:8000 in your browser

#### Method 2: Python (if installed)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Then open http://localhost:8000

#### Method 3: Node.js (if installed)
```bash
npx http-server -p 8000
```
Then open http://localhost:8000

#### Method 4: VS Code
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

Once the server is running:
1. Open the URL in your browser (usually http://localhost:8000)
2. Wait for all assets to load (FBX models and animations)
3. Start with a Town Hall and 3 workers

### Controls

#### Mouse Controls
- **Left Click**: Select a unit or building
- **Left Click + Drag**: Box select multiple units
- **Shift + Left Click**: Add to current selection
- **Right Click on Ground**: Move selected units
- **Right Click on Enemy**: Attack target (fighters only)
- **Right Click on Resource**: Gather resources (workers only)
- **Mouse Wheel**: Zoom camera in/out

#### Keyboard Controls
- **W/A/S/D or Arrow Keys**: Move camera
- **Spacebar**: Select all idle workers
- **S Key**: Stop selected units
- **1-9**: Select control group
- **Ctrl + 1-9**: Assign units to control group

### Basic Strategy

1. **Early Game**:
   - Select workers and right-click on gold mines or forests to gather resources
   - Workers automatically return resources to the town hall
   - Train more workers to speed up resource gathering

2. **Mid Game**:
   - Build a Barracks (select Town Hall and click "Train fighter")
   - Train fighters to defend your base
   - Expand resource gathering to multiple nodes

3. **Late Game**:
   - Build an army of fighters
   - Attack enemy units and buildings
   - Control the map with strategic positioning

### UI Elements

- **Top Left**: Resource display (Gold, Wood, Food)
- **Bottom Left**: Selected unit/building information
  - Health bar
  - Current status
  - Action buttons (train units, etc.)
- **Bottom Right**: Minimap
  - Blue: Your units and buildings
  - Red: Enemy units and buildings
  - Yellow: Gold mines
  - Green: Forests
  - Click minimap to move camera
- **Top Right**: Controls help

## Unit Information

### Worker
- **Cost**: 50 gold
- **Health**: 50 HP
- **Speed**: Medium
- **Abilities**: Gather resources, build structures
- **Food Cost**: 1

### Fighter
- **Cost**: 100 gold, 50 wood
- **Health**: 100 HP
- **Damage**: 15 per attack
- **Attack Speed**: 1.5 seconds
- **Range**: 5 units
- **Food Cost**: 2

## Building Information

### Town Hall
- **Health**: 1500 HP
- **Can Train**: Workers
- **Special**: Resource drop-off point

### Barracks
- **Cost**: 200 gold, 150 wood
- **Health**: 800 HP
- **Can Train**: Fighters

### Gold Mine
- **Resource Type**: Gold
- **Gather Rate**: 10 gold/second
- **Capacity**: Infinite

### Forest
- **Resource Type**: Wood
- **Gather Rate**: 10 wood/second
- **Capacity**: Infinite

## Technical Details

### Architecture
- **Engine**: Three.js for 3D rendering
- **Model Format**: FBX with animations
- **Pathfinding**: Custom A* implementation
- **Animation System**: State machine with smooth blending
- **UI**: HTML/CSS overlay with canvas minimap

### File Structure
```
RTS-GAME/
├── index.html              # Main game file
├── src/
│   ├── main.js            # Entry point
│   ├── core/
│   │   ├── Game.js        # Main game class
│   │   ├── InputManager.js
│   │   └── ResourceManager.js
│   ├── entities/
│   │   ├── Unit.js        # Base unit class
│   │   ├── Worker.js
│   │   ├── Fighter.js
│   │   └── Building.js
│   ├── systems/
│   │   ├── AnimationController.js
│   │   ├── PathfindingSystem.js
│   │   └── SelectionSystem.js
│   ├── ui/
│   │   ├── HUD.js
│   │   └── Minimap.js
│   └── utils/
│       ├── Constants.js
│       └── MathUtils.js
├── assets/
│   ├── Meshy_AI_Character_output.fbx
│   ├── Meshy_AI_Animation_*.fbx
│   └── Meshy_AI_texture_*.png
└── GAME_DESIGN.md
```

### Performance
- Optimized for 60 FPS gameplay
- Efficient pathfinding with grid-based navigation
- Model instancing for multiple units
- Frustum culling and LOD ready

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

Requires WebGL 2.0 support.

## Quick Start

**Easiest method**:
1. Double-click `start-server.bat` (Windows) or run `./start-server.sh` (Mac/Linux)
2. Open http://localhost:8000 in your browser
3. Wait for assets to load and start playing!

**Alternative**: Use Python, Node.js, or VS Code Live Server (see "Starting the Game" section above)

No build process required - runs entirely in the browser once served!

---

**Enjoy the game! Build your base, gather resources, and conquer your enemies!**