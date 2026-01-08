# Third Person FPS Game

A feature-rich third-person FPS game built with Three.js featuring single player, multiplayer, and a fully functional map editor.

## Features

- **Main Menu**: Sleek interface with multiple game modes
- **Single Player Mode**: Wave-based survival against AI enemies
- **Multiplayer Mode**: Real-time multiplayer using Socket.IO
- **Map Editor**: Create and save custom maps
- **Character Animations**: Full character animation system with 17+ animations
- **Third Person Camera**: Dynamic camera following the player
- **Shooting Mechanics**: Weapon system with ammo management
- **Physics**: Gravity, jumping, and collision detection

## Installation

1. Install dependencies:
```bash
cd FPS_Game
npm install
```

2. Build and run the game:
```bash
npm run dev
```

3. For multiplayer, start the server in a separate terminal:
```bash
npm start
```

The game will open automatically in your browser at `http://localhost:3000`

## Game Modes

### Single Player
- Fight waves of AI enemies
- Enemies get stronger with each wave
- Survive as long as possible
- Track your kills and wave progress

### Multiplayer
- **Host Game**: Create a server for others to join
- **Join Game**: Connect to an existing server
- See other players in real-time
- Compete against friends

### Map Editor
- Create custom maps with various objects
- Place boxes, cylinders, spheres, walls, and ramps
- Save and load maps as JSON files
- Full camera control for precise editing

## Controls

### General
- **ESC**: Return to main menu / Pause
- **Mouse**: Look around (when pointer is locked)

### Gameplay (Single Player / Multiplayer)
- **W/A/S/D**: Move
- **Shift**: Sprint
- **Space**: Jump
- **Left Click**: Shoot
- **Right Click**: Aim
- **R**: Reload
- **Mouse Movement**: Rotate camera

### Map Editor
- **W/A/S/D**: Move camera horizontally
- **Q/E**: Move camera up/down
- **Mouse**: Rotate camera view
- **Left Click**: Place selected object
- **Right Click**: Select object
- **Delete**: Remove selected object

## Project Structure

```
FPS_Game/
├── assets/
│   ├── models/          # Character models (FBX)
│   ├── animations/      # Character animations (FBX)
│   ├── textures/        # Texture maps
│   └── maps/           # Saved map files
├── src/
│   ├── core/
│   │   ├── Game.js              # Main game engine
│   │   └── InputManager.js     # Input handling
│   ├── menu/
│   │   └── MainMenu.js         # Main menu UI
│   ├── gameplay/
│   │   ├── Player.js           # Player controller
│   │   ├── Enemy.js            # Enemy AI
│   │   └── SinglePlayer.js    # Single player mode
│   ├── multiplayer/
│   │   └── Multiplayer.js      # Multiplayer client
│   ├── mapeditor/
│   │   └── MapEditor.js        # Map editor
│   └── main.js                 # Entry point
├── server/
│   └── index.js                # Multiplayer server
├── index.html                   # Main HTML file
├── package.json
└── vite.config.js
```

## Technical Details

### Technologies Used
- **Three.js**: 3D rendering engine
- **Socket.IO**: Real-time multiplayer networking
- **Vite**: Build tool and development server
- **Express**: Multiplayer server
- **FBX Loader**: Loading character models and animations

### Game Systems

#### Animation System
The game includes 17 different animations:
- Idle variations (3 types)
- Walking and Running
- Sprinting
- Combat stance
- Shooting while walking
- Various attack animations
- Death animations

#### Physics System
- Gravity simulation
- Ground collision detection
- Velocity-based movement
- Jump mechanics

#### AI System (Single Player)
- Pathfinding to chase player
- Attack range detection
- Health system with visual health bars
- Wave-based spawning

#### Networking (Multiplayer)
- WebSocket-based real-time communication
- Player position synchronization
- Animation state sharing
- Bullet synchronization

## Map Editor Guide

1. Enter the Map Editor from the main menu
2. Select an object type from the dropdown
3. Click on the ground to place objects
4. Right-click to select placed objects
5. Press Delete to remove selected objects
6. Use the Save Map button to export your creation
7. Use Load Map to import saved maps

Map files are saved as JSON and can be shared with others.

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

### Starting Multiplayer Server
```bash
npm start
```

The multiplayer server runs on port 3001 by default.

## Credits

- Character models and animations: Meshy AI
- Game engine: Three.js
- Networking: Socket.IO

## License

This project is for educational and demonstration purposes.

## Future Enhancements

- More weapon types
- Power-ups and collectibles
- Larger maps with varied terrain
- Team-based multiplayer modes
- Custom character skins
- Sound effects and music
- Mobile support
- Improved AI pathfinding
- Minimap display
- Scoreboard and leaderboards

## Troubleshooting

**Issue**: Assets not loading
- Ensure all FBX and texture files are in the correct directories
- Check browser console for specific errors

**Issue**: Multiplayer connection fails
- Verify the multiplayer server is running
- Check that port 3001 is not blocked by firewall
- Ensure correct server address when joining

**Issue**: Performance issues
- Lower the number of enemies in single player
- Reduce shadow quality in Game.js
- Close other browser tabs

## Support

For issues or questions, please check the browser console for error messages and ensure all dependencies are properly installed.

Enjoy the game!
