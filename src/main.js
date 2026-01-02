import { Game } from './core/Game.js';

// Main entry point
async function main() {
    console.log('Starting RTS Game...');

    try {
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
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}
