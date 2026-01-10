# Arcane Battlegrounds - Single Player Magic Combat

A stunning single-player magical combat game built with Three.js, featuring spell-based combat, wave-based survival, and a map editor.

## ✨ Quick Start

```bash
cd FPS_Game
npm install
npm run dev
```

The game will open in your browser! Click **START GAME** to begin your magical adventure.

## 🎮 Features

- **Wave-Based Survival**: Battle endless waves of corrupted mages
- **5 Elemental Spells**: Master Fire, Ice, Lightning, Arcane, and Shadow magic
- **Mana System**: Strategic resource management with auto-regeneration
- **Map Editor**: Create custom magical arenas
- **Stunning Visuals**: Particle effects, spell trails, and magical atmosphere
- **Easy to Play**: Just click Start Game and you're in!

## 🔮 Spell Arsenal

### Fireball 🔥
- **Mana Cost**: 10
- **Damage**: 30
- **Effect**: Explosive impact
- **Best for**: Balanced combat

### Ice Shard ❄️
- **Mana Cost**: 8
- **Damage**: 20
- **Effect**: Slows enemies
- **Best for**: Crowd control

### Lightning Bolt ⚡
- **Mana Cost**: 15
- **Damage**: 40
- **Effect**: Chain lightning
- **Best for**: Burst damage

### Arcane Missile 🌟
- **Mana Cost**: 5
- **Damage**: 15
- **Effect**: Homing projectiles
- **Best for**: Fast casting

### Shadow Bolt 💀
- **Mana Cost**: 12
- **Damage**: 35
- **Effect**: Poison DOT
- **Best for**: Sustained damage

## ⌨️ Controls

### Movement
- **W/A/S/D**: Move
- **Shift**: Sprint
- **Space**: Jump
- **Mouse**: Look around

### Combat
- **Left Click**: Cast spell
- **Right Click**: Aim/Focus
- **1-5**: Quick-select spells
- **Q/E**: Cycle spells
- **ESC**: Return to menu

## 🎯 How to Play

1. Click **START GAME** from the main menu
2. Use WASD to move and mouse to aim
3. Cast spells with Left Click
4. Switch between 5 elemental spells (1-5 keys)
5. Survive waves of enemies
6. Each wave gets progressively harder
7. Manage your mana wisely - it regenerates over time!

**Goal**: Survive as many waves as possible and master all five elemental schools of magic!

## 🗺️ Map Editor

Create your own magical arenas:
1. Select "Map Editor" from main menu
2. Choose objects and place them
3. Save your creations as JSON files
4. Load custom maps anytime

## 📁 Project Structure

```
FPS_Game/
├── assets/
│   ├── models/          # Character models
│   ├── animations/      # Character animations
│   ├── textures/        # Texture maps
│   └── maps/           # Custom maps
├── src/
│   ├── core/           # Game engine
│   ├── menu/           # Main menu
│   ├── gameplay/       # Player, enemies, game modes
│   ├── mapeditor/      # Map editor
│   ├── utils/          # Spell system
│   └── main.js
└── index.html
```

## 🧙‍♂️ Game Mechanics

### Mana System
- **Max Mana**: 100
- **Regeneration**: 10/second
- **Strategy**: Balance spell costs vs. regen
- **Visual**: Aura color changes with equipped spell

### Wave System
- Start with 3 enemies
- Each wave adds more enemies
- Progressive difficulty scaling
- Enemies get smarter and faster

### Spell Effects
- **Freeze**: Slows enemy movement (Ice Shard)
- **Poison**: Damage over time (Shadow Bolt)
- **Chain**: Jumps to nearby enemies (Lightning)
- **Homing**: Tracks targets (Arcane Missile)
- **Explosion**: Area damage (Fireball)

## 🎨 Visual Features

- **Mystical Environment**: Purple-tinted magical realm
- **Dynamic Lighting**: Spell-based illumination
- **Particle Systems**: Spell trails and explosions
- **Magical Auras**: Character glows
- **Atmospheric Fog**: Enhanced ambiance

## 💡 Tips & Tricks

1. **Mana Management**: Don't spam expensive spells
2. **Spell Combos**: Ice Shard to slow, then Lightning for damage
3. **Movement**: Keep moving while casting
4. **Spell Choice**: Match spells to situations
5. **Positioning**: Use terrain and obstacles

## 🚀 Technologies

- **Three.js**: 3D rendering
- **Vite**: Development server
- **FBX Loader**: 3D models
- **Custom Spell System**: Particle effects

## 🐛 Troubleshooting

**Assets not loading?**
- Check browser console for errors
- Ensure all files are in correct directories

**Performance issues?**
- Close other browser tabs
- Lower enemy counts in code
- Reduce particle counts

**Game won't start?**
- Run `npm install` first
- Make sure you're in the FPS_Game directory
- Check Node.js is installed

## 📜 Lore

In the Arcane Battlegrounds, you stand as the last guardian against waves of corrupted mages seeking to destroy the mystical realm. Master five schools of elemental magic - Fire, Ice, Lightning, Arcane, and Shadow - to defend against the endless corruption. Only those who truly master the elements will survive!

## 🎓 Advanced Tactics

- **Kiting**: Move while casting to maintain distance
- **Resource Management**: Save mana for critical moments
- **Spell Rotation**: Use cheap spells to maintain pressure
- **Crowd Control**: Freeze groups before bursting them down
- **DOT Management**: Apply Shadow Bolt early for sustained damage

## 🏆 Achievements (Unofficial)

- **Apprentice**: Reach Wave 5
- **Mage**: Reach Wave 10
- **Archmage**: Reach Wave 15
- **Grand Wizard**: Reach Wave 20
- **Elemental Master**: Master all 5 spell types

## 📄 License

Educational and demonstration purposes.

---

**Ready to master the elements? Click START GAME and begin your magical journey!** ✨🔮⚡
