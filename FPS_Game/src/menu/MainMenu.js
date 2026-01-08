export default class MainMenu {
    constructor(game) {
        this.game = game;
        this.container = null;
        this.createMenu();
    }

    createMenu() {
        this.container = document.createElement('div');
        this.container.id = 'mainMenu';
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            display: none;
            justify-content: center;
            align-items: center;
            pointer-events: all;
            z-index: 1000;
        `;

        const menuContent = document.createElement('div');
        menuContent.style.cssText = `
            text-align: center;
            color: white;
        `;

        const title = document.createElement('h1');
        title.textContent = 'THIRD PERSON FPS';
        title.style.cssText = `
            font-size: 72px;
            margin-bottom: 50px;
            text-shadow: 4px 4px 8px rgba(0,0,0,0.5);
            font-weight: bold;
            letter-spacing: 4px;
        `;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 20px;
        `;

        const buttonStyle = `
            padding: 20px 60px;
            font-size: 24px;
            background: rgba(255, 255, 255, 0.1);
            border: 3px solid rgba(255, 255, 255, 0.8);
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            backdrop-filter: blur(10px);
        `;

        const singlePlayerBtn = this.createButton('Single Player', buttonStyle);
        singlePlayerBtn.addEventListener('click', () => this.startSinglePlayer());

        const multiplayerBtn = this.createButton('Multiplayer', buttonStyle);
        multiplayerBtn.addEventListener('click', () => this.startMultiplayer());

        const mapEditorBtn = this.createButton('Map Editor', buttonStyle);
        mapEditorBtn.addEventListener('click', () => this.startMapEditor());

        const settingsBtn = this.createButton('Settings', buttonStyle);
        settingsBtn.addEventListener('click', () => this.openSettings());

        const exitBtn = this.createButton('Exit', buttonStyle);
        exitBtn.addEventListener('click', () => this.exit());

        buttonContainer.appendChild(singlePlayerBtn);
        buttonContainer.appendChild(multiplayerBtn);
        buttonContainer.appendChild(mapEditorBtn);
        buttonContainer.appendChild(settingsBtn);
        buttonContainer.appendChild(exitBtn);

        menuContent.appendChild(title);
        menuContent.appendChild(buttonContainer);
        this.container.appendChild(menuContent);
        document.body.appendChild(this.container);
    }

    createButton(text, style) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = style;

        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(255, 255, 255, 0.3)';
            button.style.transform = 'scale(1.05)';
            button.style.borderColor = 'rgba(255, 255, 255, 1)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(255, 255, 255, 0.1)';
            button.style.transform = 'scale(1)';
            button.style.borderColor = 'rgba(255, 255, 255, 0.8)';
        });

        return button;
    }

    startSinglePlayer() {
        console.log('Starting Single Player...');
        this.game.setState('singlePlayer');
    }

    startMultiplayer() {
        console.log('Starting Multiplayer...');
        this.showMultiplayerOptions();
    }

    showMultiplayerOptions() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: linear-gradient(135deg, #2a5298 0%, #1e3c72 100%);
            padding: 40px;
            border-radius: 10px;
            border: 3px solid rgba(255,255,255,0.5);
            text-align: center;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Multiplayer Options';
        title.style.cssText = 'color: white; margin-bottom: 30px; font-size: 32px;';

        const hostBtn = this.createButton('Host Game', `
            padding: 15px 40px;
            font-size: 20px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.8);
            color: white;
            cursor: pointer;
            margin: 10px;
        `);
        hostBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            this.game.states.multiplayer.host();
            this.game.setState('multiplayer');
        });

        const joinBtn = this.createButton('Join Game', `
            padding: 15px 40px;
            font-size: 20px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.8);
            color: white;
            cursor: pointer;
            margin: 10px;
        `);
        joinBtn.addEventListener('click', () => {
            const serverIP = prompt('Enter server IP:', 'localhost:3001');
            if (serverIP) {
                document.body.removeChild(overlay);
                this.game.states.multiplayer.join(serverIP);
                this.game.setState('multiplayer');
            }
        });

        const cancelBtn = this.createButton('Cancel', `
            padding: 15px 40px;
            font-size: 20px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.8);
            color: white;
            cursor: pointer;
            margin: 10px;
        `);
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        dialog.appendChild(title);
        dialog.appendChild(hostBtn);
        dialog.appendChild(document.createElement('br'));
        dialog.appendChild(joinBtn);
        dialog.appendChild(document.createElement('br'));
        dialog.appendChild(cancelBtn);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }

    startMapEditor() {
        console.log('Starting Map Editor...');
        this.game.setState('mapEditor');
    }

    openSettings() {
        alert('Settings menu - Coming soon!\nAdjust graphics, controls, and audio settings.');
    }

    exit() {
        if (confirm('Are you sure you want to exit?')) {
            window.close();
        }
    }

    enter() {
        this.container.style.display = 'flex';
        this.game.inputManager.exitPointerLock();
        document.getElementById('crosshair').style.display = 'none';
        document.getElementById('hud').style.display = 'none';
    }

    exit() {
        this.container.style.display = 'none';
    }

    update(deltaTime) {
        // Menu doesn't need update logic
    }
}
