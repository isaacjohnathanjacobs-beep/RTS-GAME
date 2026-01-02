import { Game } from './core/Game.js';

// Main entry point
async function main() {
    console.log('RTS Game loaded - waiting for user to start...');

    // Setup menu handlers
    const mainMenu = document.getElementById('main-menu');
    const startBtn = document.getElementById('start-game-btn');
    const howToPlayBtn = document.getElementById('how-to-play-btn');
    const backBtn = document.getElementById('back-btn');
    const instructions = document.getElementById('instructions');
    const menuButtons = document.querySelector('.menu-buttons');

    // Show how to play
    howToPlayBtn.addEventListener('click', () => {
        menuButtons.style.display = 'none';
        instructions.classList.remove('hidden');
    });

    // Back to menu
    backBtn.addEventListener('click', () => {
        instructions.classList.add('hidden');
        menuButtons.style.display = 'flex';
    });

    // Start game
    startBtn.addEventListener('click', async () => {
        try {
            // Hide menu and show loading
            mainMenu.classList.add('hidden');
            document.getElementById('loading-screen').style.display = 'flex';

            // Create game instance
            const game = new Game();

            // Initialize game
            await game.init();

            // Start game loop
            game.start();

            // Make game globally accessible for debugging
            window.game = game;

        } catch (error) {
            console.error('Failed to initialize game:', error);

            const loadingScreen = document.getElementById('loading-screen');
            const loadingText = document.getElementById('loading-text');

            loadingText.textContent = 'Error loading game: ' + error.message;
            loadingText.style.color = '#ff0000';
        }
    });
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
