export default class InputManager {
    constructor() {
        this.keys = {};
        this.mouse = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0,
            buttons: {}
        };

        this.locked = false;

        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        document.addEventListener('mousedown', (e) => {
            this.mouse.buttons[e.button] = true;
        });

        document.addEventListener('mouseup', (e) => {
            this.mouse.buttons[e.button] = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.locked) {
                this.mouse.deltaX = e.movementX || 0;
                this.mouse.deltaY = e.movementY || 0;
            }
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        document.addEventListener('pointerlockchange', () => {
            this.locked = document.pointerLockElement !== null;
        });
    }

    isKeyPressed(keyCode) {
        return this.keys[keyCode] === true;
    }

    isMouseButtonPressed(button) {
        return this.mouse.buttons[button] === true;
    }

    getMouseDelta() {
        const delta = { x: this.mouse.deltaX, y: this.mouse.deltaY };
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        return delta;
    }

    requestPointerLock() {
        document.body.requestPointerLock();
    }

    exitPointerLock() {
        document.exitPointerLock();
    }
}
