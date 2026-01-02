// Game Constants
export const GAME_CONSTANTS = {
    // World settings
    WORLD_SIZE: 200,
    GRID_SIZE: 2,

    // Unit constants
    WORKER_COST: { gold: 50, wood: 0 },
    FIGHTER_COST: { gold: 100, wood: 50 },
    WORKER_FOOD: 1,
    FIGHTER_FOOD: 2,

    // Building constants
    TOWN_HALL_COST: { gold: 0, wood: 0 }, // Starting building
    BARRACKS_COST: { gold: 200, wood: 150 },

    // Resource gathering
    GATHER_RATE: 10, // Resources per second
    CARRY_CAPACITY: 10,
    RESOURCE_RETURN_DISTANCE: 3,

    // Combat
    FIGHTER_HP: 100,
    FIGHTER_DAMAGE: 15,
    FIGHTER_ATTACK_SPEED: 1.5, // Seconds between attacks
    FIGHTER_ATTACK_RANGE: 5,
    WORKER_HP: 50,

    // Building HP
    TOWN_HALL_HP: 1500,
    BARRACKS_HP: 800,

    // Movement
    MOVE_SPEED: 5,
    RUN_SPEED: 8,
    ROTATION_SPEED: 10,

    // Selection
    SELECTION_RING_COLOR: 0x00ff00,
    ENEMY_SELECTION_COLOR: 0xff0000,

    // Camera
    CAMERA_MOVE_SPEED: 20,
    CAMERA_ZOOM_SPEED: 5,
    CAMERA_MIN_ZOOM: 20,
    CAMERA_MAX_ZOOM: 100,

    // Teams
    TEAM_PLAYER: 0,
    TEAM_ENEMY: 1,
    TEAM_NEUTRAL: 2,
};

export const ANIMATION_STATES = {
    IDLE: 'idle',
    WALK: 'walk',
    RUN: 'run',
    ATTACK: 'attack',
    GATHER: 'gather',
    BUILD: 'build',
    DEATH: 'death',
    COMBAT_STANCE: 'combat_stance',
};

export const UNIT_TYPES = {
    WORKER: 'worker',
    FIGHTER: 'fighter',
};

export const BUILDING_TYPES = {
    TOWN_HALL: 'town_hall',
    BARRACKS: 'barracks',
    GOLD_MINE: 'gold_mine',
    FOREST: 'forest',
};

export const RESOURCE_TYPES = {
    GOLD: 'gold',
    WOOD: 'wood',
};

export const UNIT_COMMANDS = {
    MOVE: 'move',
    ATTACK: 'attack',
    GATHER: 'gather',
    BUILD: 'build',
    STOP: 'stop',
};
