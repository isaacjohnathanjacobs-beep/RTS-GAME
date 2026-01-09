# Arcane Battlegrounds - Magic Third Person FPS

A stunning third-person magical combat game built with Three.js, featuring spell-based combat, multiplayer battles, and a fully functional map editor.

## ✨ Features

- **Main Menu**: Beautiful mystical interface with multiple game modes
- **Single Player Mode**: Wave-based survival against magical enemies
- **Multiplayer Mode**: Real-time multiplayer spell battles using Socket.IO
- **Map Editor**: Create and save custom battlegrounds
- **Spell System**: 5 unique elemental spells with different effects
- **Character Animations**: Full character animation system with 17+ animations
- **Third Person Camera**: Dynamic camera following your sorcerer
- **Magical Effects**: Particle systems, spell trails, and explosive impacts
- **Mana Management**: Strategic resource system with auto-regeneration

## 🔮 Spell Arsenal

### Fireball 🔥
- **Mana Cost**: 10
- **Damage**: 30
- **Effect**: Explosive impact with fire particles
- **Speed**: Medium
- **Best for**: Balanced damage and cost

### Ice Shard ❄️
- **Mana Cost**: 8
- **Damage**: 20
- **Effect**: Freezes enemies, slowing their movement
- **Speed**: Fast
- **Best for**: Crowd control

### Lightning Bolt ⚡
- **Mana Cost**: 15
- **Damage**: 40
- **Effect**: Chain lightning to nearby enemies
- **Speed**: Very Fast
- **Best for**: High burst damage

### Arcane Missile 🌟
- **Mana Cost**: 5
- **Damage**: 15
- **Effect**: Homing capability
- **Speed**: Fast
- **Best for**: Rapid casting and guaranteed hits

### Shadow Bolt 💀
- **Mana Cost**: 12
- **Damage**: 35
- **Effect**: Poison damage over time
- **Speed**: Medium
- **Best for**: DOT (Damage Over Time) strategies

## 🎮 Installation

1. Install dependencies:
```bash
cd FPS_Game
npm install
```

2. Run the game:
```bash
npm run dev
```

3. For multiplayer, start the server in a separate terminal:
```bash
npm start
```

The game will open automatically in your browser at `http://localhost:3000`

## 🎯 Game Modes

### Single Player - Arcane Survival
- Fight endless waves of corrupted mages
- Enemies become stronger with each wave
- Master all spells to maximize survival
- Track your kills and wave progress

### Multiplayer - Wizard Duel
- **Host Arcane Arena**: Create a server for others to join
- **Join Battle**: Connect to an existing server
- See other wizards casting in real-time
- Battle against friends in magical combat

### Map Editor - Realm Creator
- Create custom magical arenas
- Place mystical objects and structures
- Save and load realms as JSON files
- Full camera control for precision building

## ⌨️ Controls

### General
- **ESC**: Return to main menu
- **Mouse**: Look around (when pointer is locked)

### Combat (Single Player / Multiplayer)
- **W/A/S/D**: Move
- **Shift**: Sprint
- **Space**: Jump / Levitate
- **Left Click**: Cast current spell
- **Right Click**: Aim / Focus
- **1-5**: Switch spells (1=Fireball, 2=Ice Shard, 3=Lightning, 4=Arcane, 5=Shadow)
- **Q/E**: Cycle through spells
- **Mouse Movement**: Rotate camera

### Map Editor
- **W/A/S/D**: Move camera horizontally
- **Q/E**: Move camera up/down
- **Mouse**: Rotate camera view
- **Left Click**: Place selected object
- **Right Click**: Select object
- **Delete**: Remove selected object

## 📁 Project Structure

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
│   │   └── MainMenu.js         # Magical main menu
│   ├── gameplay/
│   │   ├── Player.js           # Wizard controller
│   │   ├── Enemy.js            # Enemy mage AI
│   │   └── SinglePlayer.js    # Survival mode
│   ├── multiplayer/
│   │   └── Multiplayer.js      # Multiplayer client
│   ├── mapeditor/
│   │   └── MapEditor.js        # Map editor
│   ├── utils/
│   │   └── SpellSystem.js      # Spell mechanics
│   └── main.js                 # Entry point
├── server/
│   └── index.js                # Multiplayer server
├── index.html                   # Main HTML file
├── package.json
└── vite.config.js
```

## 🧙‍♂️ Technical Details

### Technologies Used
- **Three.js**: 3D rendering engine
- **Socket.IO**: Real-time multiplayer networking
- **Vite**: Build tool and development server
- **Express**: Multiplayer server
- **FBX Loader**: Loading character models and animations

### Spell System Features
- Procedural particle effects
- Dynamic lighting per spell type
- Trail effects and glows
- Explosion animations
- Status effects (freeze, poison, chain)
- Cooldown management
- Mana cost balancing

### Game Mechanics

#### Mana System
- **Max Mana**: 100
- **Regeneration**: 10 mana/second
- **Strategic Casting**: Choose spells wisely to avoid running out
- **Visual Feedback**: Magical aura changes color based on selected spell

#### Animation System
17 unique character animations:
- Multiple idle poses
- Walking and running
- Sprint animations
- Combat stances
- Spell casting poses
- Death animations
- Aerial movements

#### Physics System
- Gravity simulation
- Ground collision detection
- Velocity-based movement
- Jump/levitation mechanics

#### AI System (Single Player)
- Intelligent pathfinding
- Attack range detection
- Health system with visual indicators
- Wave-based difficulty scaling
- Status effect reactions

#### Networking (Multiplayer)
- WebSocket-based real-time communication
- Player position and rotation sync
- Animation state sharing
- Spell projectile synchronization
- Latency compensation

## 🎨 Visual Features

- **Mystical Environment**: Purple-tinted magical realm
- **Dynamic Lighting**: Spell-based point lights
- **Particle Systems**: Spell trails and explosions
- **Magical Auras**: Character glows indicating power
- **Atmospheric Fog**: Enhances the mystical ambiance
- **Moonlit Shadows**: Dramatic shadow casting

## 🗺️ Map Editor Guide

1. Enter the Map Editor from the main menu
2. Select an object type from the dropdown
3. Click on the ground to place mystical structures
4. Right-click to select placed objects
5. Press Delete to remove selected objects
6. Save your creation as a JSON file
7. Load previously saved realms

Map files can be shared with other wizards!

## 🎓 Spell Casting Tips

1. **Mana Management**: Don't spam expensive spells
2. **Spell Combos**: Use Ice Shard to slow, then Lightning for damage
3. **Positioning**: Keep moving while casting
4. **Spell Selection**: Switch spells based on situation
5. **Cooldowns**: Time your powerful spells carefully

## 🌟 Future Enhancements

- Additional elemental schools (Earth, Wind, Holy, Dark)
- Ultimate abilities with long cooldowns
- Spell upgrades and talent trees
- Magical artifacts and power-ups
- Larger mystical maps with varied terrain
- Team-based arena modes
- Custom wizard appearances
- Sound effects and mystical music
- Mobile/tablet support
- Advanced AI spell-casting enemies
- Leaderboards and achievements
- Spell combination system

## 🐛 Troubleshooting

**Issue**: Assets not loading
- Ensure all FBX and texture files are in correct directories
- Check browser console for specific errors

**Issue**: Multiplayer connection fails
- Verify multiplayer server is running (`npm start`)
- Check port 3001 is not blocked
- Ensure correct server address when joining

**Issue**: Spell effects lag
- Lower number of enemies in single player
- Reduce particle counts in SpellSystem.js
- Close other browser tabs

**Issue**: Mana not regenerating
- Check console for errors
- Verify you're not at max mana
- Restart the game mode

## 📜 Lore

In the Arcane Battlegrounds, powerful mages battle for supremacy over the mystical realm. Master five schools of magic - Fire, Ice, Lightning, Arcane, and Shadow - to prove yourself as the ultimate sorcerer. Face waves of corrupted wizards in single combat, or challenge other players in the arena. Only those who master the elements will survive!

## 🎮 Credits

- Character models and animations: Meshy AI
- Game engine: Three.js
- Networking: Socket.IO
- Spell system design: Custom implementation
- Visual effects: Procedural particle systems

## 📄 License

This project is for educational and demonstration purposes.

---

**Master the elements. Command the battlefield. Become the Arcane Champion!** ✨🔮⚡
