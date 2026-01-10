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
            background: linear-gradient(135deg, #1a0a2e 0%, #4b0082 50%, #6a0dad 100%);
            display: none;
            justify-content: center;
            align-items: center;
            pointer-events: all;
            z-index: 1000;
        `;

        const menuContent = document.createElement('div');
        menuContent.style.cssText = `
            text-align: center;
            color: #e0d0ff;
        `;

        const title = document.createElement('h1');
        title.textContent = 'ARCANE BATTLEGROUNDS';
        title.style.cssText = `
            font-size: 72px;
            margin-bottom: 20px;
            text-shadow: 0 0 20px rgba(147, 112, 219, 0.8), 4px 4px 8px rgba(0,0,0,0.5);
            font-weight: bold;
            letter-spacing: 6px;
            font-family: Georgia, serif;
        `;

        const subtitle = document.createElement('div');
        subtitle.textContent = '✨ Master the Elements ✨';
        subtitle.style.cssText = `
            font-size: 24px;
            margin-bottom: 50px;
            color: #c8b4e0;
            font-style: italic;
            text-shadow: 0 0 10px rgba(147, 112, 219, 0.6);
        `;

        menuContent.appendChild(subtitle);

        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 25px;
        `;

        const startButtonStyle = `
            padding: 25px 80px;
            font-size: 32px;
            background: rgba(147, 112, 219, 0.5);
            border: 4px solid rgba(186, 85, 211, 0.9);
            color: #ffffff;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
            letter-spacing: 3px;
            text-transform: uppercase;
            backdrop-filter: blur(10px);
            box-shadow: 0 0 25px rgba(147, 112, 219, 0.6);
            font-family: Georgia, serif;
        `;

        const buttonStyle = `
            padding: 15px 50px;
            font-size: 20px;
            background: rgba(75, 0, 130, 0.3);
            border: 3px solid rgba(147, 112, 219, 0.8);
            color: #e0d0ff;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
            backdrop-filter: blur(10px);
            box-shadow: 0 0 15px rgba(147, 112, 219, 0.4);
            font-family: Georgia, serif;
        `;

        const startBtn = this.createButton('⚡ START GAME ⚡', startButtonStyle);
        startBtn.addEventListener('click', () => this.startSinglePlayer());
        startBtn.addEventListener('mouseenter', () => {
            startBtn.style.background = 'rgba(186, 85, 211, 0.7)';
            startBtn.style.transform = 'scale(1.08)';
            startBtn.style.boxShadow = '0 0 35px rgba(186, 85, 211, 1)';
        });
        startBtn.addEventListener('mouseleave', () => {
            startBtn.style.background = 'rgba(147, 112, 219, 0.5)';
            startBtn.style.transform = 'scale(1)';
            startBtn.style.boxShadow = '0 0 25px rgba(147, 112, 219, 0.6)';
        });

        const mapEditorBtn = this.createButton('Map Editor', buttonStyle);
        mapEditorBtn.addEventListener('click', () => this.startMapEditor());

        const instructionsBtn = this.createButton('How to Play', buttonStyle);
        instructionsBtn.addEventListener('click', () => this.showInstructions());

        buttonContainer.appendChild(startBtn);
        buttonContainer.appendChild(mapEditorBtn);
        buttonContainer.appendChild(instructionsBtn);

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
            button.style.background = 'rgba(147, 112, 219, 0.5)';
            button.style.transform = 'scale(1.05)';
            button.style.borderColor = 'rgba(186, 85, 211, 1)';
            button.style.boxShadow = '0 0 25px rgba(147, 112, 219, 0.8)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(75, 0, 130, 0.3)';
            button.style.transform = 'scale(1)';
            button.style.borderColor = 'rgba(147, 112, 219, 0.8)';
            button.style.boxShadow = '0 0 15px rgba(147, 112, 219, 0.4)';
        });

        return button;
    }

    startSinglePlayer() {
        console.log('Starting Single Player...');
        this.game.setState('singlePlayer');
    }

    startMapEditor() {
        console.log('Starting Map Editor...');
        this.game.setState('mapEditor');
    }

    showInstructions() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
            pointer-events: all;
        `;

        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: linear-gradient(135deg, #1a0a2e 0%, #4b0082 100%);
            padding: 40px;
            border-radius: 15px;
            border: 3px solid rgba(147, 112, 219, 0.8);
            text-align: left;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 0 30px rgba(147, 112, 219, 0.6);
        `;

        const title = document.createElement('h2');
        title.textContent = '🔮 How to Play';
        title.style.cssText = `
            color: #e0d0ff;
            margin-bottom: 20px;
            font-size: 32px;
            text-align: center;
            text-shadow: 0 0 15px rgba(147, 112, 219, 0.8);
        `;

        const instructions = document.createElement('div');
        instructions.innerHTML = `
            <div style="color: #e0d0ff; line-height: 1.8; font-size: 16px;">
                <h3 style="color: #ba55d3; margin-top: 15px;">⚔️ Combat</h3>
                <p><strong>Left Click:</strong> Cast current spell</p>
                <p><strong>Right Click:</strong> Aim/Focus</p>
                <p><strong>1-5:</strong> Quick-select spells</p>
                <p><strong>Q/E:</strong> Cycle through spells</p>

                <h3 style="color: #ba55d3; margin-top: 15px;">🏃 Movement</h3>
                <p><strong>W/A/S/D:</strong> Move</p>
                <p><strong>Shift:</strong> Sprint</p>
                <p><strong>Space:</strong> Jump</p>
                <p><strong>Mouse:</strong> Look around</p>

                <h3 style="color: #ba55d3; margin-top: 15px;">✨ Spells</h3>
                <p><strong>Fireball (1):</strong> Balanced damage - 10 mana</p>
                <p><strong>Ice Shard (2):</strong> Freezes enemies - 8 mana</p>
                <p><strong>Lightning (3):</strong> High damage - 15 mana</p>
                <p><strong>Arcane (4):</strong> Fast homing - 5 mana</p>
                <p><strong>Shadow (5):</strong> Poison DOT - 12 mana</p>

                <h3 style="color: #ba55d3; margin-top: 15px;">🎯 Objective</h3>
                <p>Survive endless waves of corrupted mages! Each wave gets harder. Manage your mana wisely and master all five elemental spells to achieve the highest wave!</p>

                <p style="margin-top: 20px; text-align: center; color: #c8b4e0;"><strong>ESC</strong> to return to menu anytime</p>
            </div>
        `;

        const closeBtn = this.createButton('Got It!', `
            padding: 12px 40px;
            font-size: 18px;
            background: rgba(147, 112, 219, 0.5);
            border: 2px solid rgba(186, 85, 211, 0.8);
            color: white;
            cursor: pointer;
            margin-top: 20px;
            display: block;
            margin-left: auto;
            margin-right: auto;
        `);
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });

        dialog.appendChild(title);
        dialog.appendChild(instructions);
        dialog.appendChild(closeBtn);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
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
