export class InputManager {
    constructor(game) {
        this.game = game;
        this.keys = {};
        this.mouseButtons = {};

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Mouse events
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('wheel', (e) => this.onMouseWheel(e));
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    onKeyDown(event) {
        this.keys[event.key.toLowerCase()] = true;

        // Handle special keys
        if (event.key === ' ') {
            event.preventDefault();
            this.selectIdleWorkers();
        }

        // Control groups (1-9)
        if (event.key >= '1' && event.key <= '9') {
            const groupNumber = parseInt(event.key);
            if (event.ctrlKey) {
                this.setControlGroup(groupNumber);
            } else {
                this.selectControlGroup(groupNumber);
            }
        }

        // Stop command
        if (event.key.toLowerCase() === 's') {
            this.stopSelectedUnits();
        }
    }

    onKeyUp(event) {
        this.keys[event.key.toLowerCase()] = false;
    }

    onMouseDown(event) {
        this.mouseButtons[event.button] = true;

        if (event.button === 0) { // Left click
            const addToSelection = event.shiftKey;
            this.game.selectionSystem.startDrag(event);

            // Small delay to distinguish between click and drag
            setTimeout(() => {
                if (!this.game.selectionSystem.isDragging) {
                    this.game.selectionSystem.handleClick(event, addToSelection);
                }
            }, 100);
        }
    }

    onMouseUp(event) {
        this.mouseButtons[event.button] = false;

        if (event.button === 0) { // Left click
            this.game.selectionSystem.endDrag(event);
        } else if (event.button === 2) { // Right click
            this.game.selectionSystem.handleRightClick(event);
        }
    }

    onMouseMove(event) {
        this.game.selectionSystem.updateDrag(event);
    }

    onMouseWheel(event) {
        event.preventDefault();
        const delta = Math.sign(event.deltaY);
        this.game.adjustCameraZoom(delta);
    }

    isKeyPressed(key) {
        return this.keys[key.toLowerCase()] || false;
    }

    isMouseButtonPressed(button) {
        return this.mouseButtons[button] || false;
    }

    selectIdleWorkers() {
        this.game.selectionSystem.clearSelection();

        for (const unit of this.game.units) {
            if (unit.type === 'worker' && unit.team === 0) {
                const status = unit.getStatus();
                if (status === 'Idle') {
                    this.game.selectionSystem.selectUnit(unit, true);
                }
            }
        }
    }

    setControlGroup(groupNumber) {
        if (!this.game.controlGroups) {
            this.game.controlGroups = {};
        }

        this.game.controlGroups[groupNumber] = [...this.game.selectionSystem.getSelectedUnits()];
        console.log(`Control group ${groupNumber} set with ${this.game.controlGroups[groupNumber].length} units`);
    }

    selectControlGroup(groupNumber) {
        if (!this.game.controlGroups || !this.game.controlGroups[groupNumber]) {
            return;
        }

        this.game.selectionSystem.clearSelection();

        for (const unit of this.game.controlGroups[groupNumber]) {
            if (unit.alive) {
                this.game.selectionSystem.selectUnit(unit, true);
            }
        }
    }

    stopSelectedUnits() {
        const units = this.game.selectionSystem.getSelectedUnits();
        for (const unit of units) {
            unit.stop();
        }
    }

    update(deltaTime) {
        // Camera movement with WASD or arrow keys
        const cameraSpeed = 20;
        let moved = false;

        if (this.isKeyPressed('w') || this.isKeyPressed('arrowup')) {
            this.game.camera.position.z -= cameraSpeed * deltaTime;
            moved = true;
        }
        if (this.isKeyPressed('s') || this.isKeyPressed('arrowdown')) {
            this.game.camera.position.z += cameraSpeed * deltaTime;
            moved = true;
        }
        if (this.isKeyPressed('a') || this.isKeyPressed('arrowleft')) {
            this.game.camera.position.x -= cameraSpeed * deltaTime;
            moved = true;
        }
        if (this.isKeyPressed('d') || this.isKeyPressed('arrowright')) {
            this.game.camera.position.x += cameraSpeed * deltaTime;
            moved = true;
        }

        if (moved) {
            // Keep camera within world bounds
            const maxPos = 80;
            this.game.camera.position.x = Math.max(-maxPos, Math.min(maxPos, this.game.camera.position.x));
            this.game.camera.position.z = Math.max(-maxPos, Math.min(maxPos, this.game.camera.position.z));
        }
    }
}
