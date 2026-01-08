import * as THREE from 'three';

export default class MapEditor {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.camera = null;
        this.cameraPosition = new THREE.Vector3(0, 20, 20);
        this.cameraRotation = { x: -0.5, y: 0 };

        this.objects = [];
        this.selectedObject = null;
        this.selectedObjectType = 'box';

        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();

        this.gridHelper = null;
        this.ui = null;

        this.setupUI();
    }

    setupUI() {
        this.ui = document.createElement('div');
        this.ui.id = 'mapEditorUI';
        this.ui.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            display: none;
            pointer-events: all;
            max-width: 300px;
            z-index: 1000;
        `;

        const title = document.createElement('h2');
        title.textContent = 'Map Editor';
        title.style.marginTop = '0';
        this.ui.appendChild(title);

        const instructions = document.createElement('div');
        instructions.innerHTML = `
            <p><strong>Controls:</strong></p>
            <p>WASD - Move camera</p>
            <p>Q/E - Up/Down</p>
            <p>Mouse - Rotate view</p>
            <p>Left Click - Place object</p>
            <p>Right Click - Select object</p>
            <p>Delete - Remove selected</p>
            <p>ESC - Back to menu</p>
            <hr>
        `;
        instructions.style.fontSize = '12px';
        this.ui.appendChild(instructions);

        const objectTypeLabel = document.createElement('label');
        objectTypeLabel.textContent = 'Object Type:';
        objectTypeLabel.style.display = 'block';
        objectTypeLabel.style.marginTop = '10px';
        this.ui.appendChild(objectTypeLabel);

        const objectTypeSelect = document.createElement('select');
        objectTypeSelect.style.cssText = 'width: 100%; padding: 5px; margin-top: 5px;';
        objectTypeSelect.innerHTML = `
            <option value="box">Box</option>
            <option value="cylinder">Cylinder</option>
            <option value="sphere">Sphere</option>
            <option value="wall">Wall</option>
            <option value="ramp">Ramp</option>
        `;
        objectTypeSelect.addEventListener('change', (e) => {
            this.selectedObjectType = e.target.value;
        });
        this.ui.appendChild(objectTypeSelect);

        const saveButton = this.createButton('Save Map', () => this.saveMap());
        const loadButton = this.createButton('Load Map', () => this.loadMap());
        const clearButton = this.createButton('Clear Map', () => this.clearMap());
        const backButton = this.createButton('Back to Menu', () => this.game.setState('menu'));

        this.ui.appendChild(saveButton);
        this.ui.appendChild(loadButton);
        this.ui.appendChild(clearButton);
        this.ui.appendChild(backButton);

        document.body.appendChild(this.ui);
    }

    createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.cssText = `
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid white;
            color: white;
            cursor: pointer;
            border-radius: 5px;
            font-size: 14px;
        `;
        button.addEventListener('click', onClick);
        button.addEventListener('mouseenter', () => {
            button.style.background = 'rgba(255, 255, 255, 0.4)';
        });
        button.addEventListener('mouseleave', () => {
            button.style.background = 'rgba(255, 255, 255, 0.2)';
        });
        return button;
    }

    enter() {
        this.active = true;
        this.setupCamera();
        this.setupEnvironment();
        this.setupEventListeners();

        this.ui.style.display = 'block';

        this.game.inputManager.requestPointerLock();
    }

    exit() {
        this.active = false;
        this.cleanup();
        this.ui.style.display = 'none';
        this.game.inputManager.exitPointerLock();
    }

    setupCamera() {
        this.game.camera.position.copy(this.cameraPosition);
        this.game.camera.lookAt(0, 0, 0);
    }

    setupEnvironment() {
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a7c3e,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.userData.isGround = true;
        this.game.scene.add(ground);

        this.gridHelper = new THREE.GridHelper(200, 40, 0x000000, 0x444444);
        this.game.scene.add(this.gridHelper);
    }

    setupEventListeners() {
        this.mouseDownHandler = (e) => this.onMouseDown(e);
        this.mouseMoveHandler = (e) => this.onMouseMove(e);

        document.addEventListener('mousedown', this.mouseDownHandler);
        document.addEventListener('mousemove', this.mouseMoveHandler);
    }

    onMouseDown(event) {
        if (!this.active || !this.game.inputManager.locked) return;

        this.updateMousePosition(event);

        if (event.button === 0) {
            this.placeObject();
        } else if (event.button === 2) {
            this.selectObject();
        }
    }

    onMouseMove(event) {
        this.updateMousePosition(event);
    }

    updateMousePosition(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    placeObject() {
        this.raycaster.setFromCamera(this.mouse, this.game.camera);

        const intersects = this.raycaster.intersectObjects(this.game.scene.children, true);

        for (const intersect of intersects) {
            if (intersect.object.userData.isGround || intersect.object.userData.isEditorObject) {
                const position = intersect.point;
                this.createObject(this.selectedObjectType, position);
                break;
            }
        }
    }

    createObject(type, position) {
        let geometry, material, mesh;

        switch (type) {
            case 'box':
                geometry = new THREE.BoxGeometry(2, 2, 2);
                material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.copy(position);
                mesh.position.y = 1;
                break;

            case 'cylinder':
                geometry = new THREE.CylinderGeometry(1, 1, 3, 16);
                material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.copy(position);
                mesh.position.y = 1.5;
                break;

            case 'sphere':
                geometry = new THREE.SphereGeometry(1, 16, 16);
                material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.copy(position);
                mesh.position.y = 1;
                break;

            case 'wall':
                geometry = new THREE.BoxGeometry(5, 3, 0.5);
                material = new THREE.MeshStandardMaterial({ color: 0x808080 });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.copy(position);
                mesh.position.y = 1.5;
                break;

            case 'ramp':
                geometry = new THREE.BoxGeometry(5, 0.5, 5);
                material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.copy(position);
                mesh.position.y = 0.25;
                mesh.rotation.x = Math.PI / 8;
                break;

            default:
                return;
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData.isEditorObject = true;
        mesh.userData.type = type;

        this.game.scene.add(mesh);
        this.objects.push(mesh);

        console.log('Placed', type, 'at', position);
    }

    selectObject() {
        this.raycaster.setFromCamera(this.mouse, this.game.camera);

        const intersects = this.raycaster.intersectObjects(this.objects, true);

        if (intersects.length > 0) {
            this.selectedObject = intersects[0].object;
            console.log('Selected object:', this.selectedObject.userData.type);

            this.selectedObject.material.emissive = new THREE.Color(0x00ff00);
        }
    }

    update(deltaTime) {
        if (!this.active) return;

        this.handleCameraMovement(deltaTime);

        const input = this.game.inputManager;

        if (input.isKeyPressed('Delete') && this.selectedObject) {
            this.deleteSelectedObject();
        }

        if (input.isKeyPressed('Escape')) {
            input.exitPointerLock();
            this.game.setState('menu');
        }
    }

    handleCameraMovement(deltaTime) {
        const input = this.game.inputManager;
        const moveSpeed = 20 * deltaTime;

        if (input.locked) {
            const mouseDelta = input.getMouseDelta();
            this.cameraRotation.y -= mouseDelta.x * 0.002;
            this.cameraRotation.x -= mouseDelta.y * 0.002;
            this.cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.cameraRotation.x));
        }

        const forward = new THREE.Vector3(
            Math.sin(this.cameraRotation.y),
            0,
            Math.cos(this.cameraRotation.y)
        );
        const right = new THREE.Vector3(
            Math.cos(this.cameraRotation.y),
            0,
            -Math.sin(this.cameraRotation.y)
        );

        if (input.isKeyPressed('KeyW')) this.cameraPosition.add(forward.clone().multiplyScalar(-moveSpeed));
        if (input.isKeyPressed('KeyS')) this.cameraPosition.add(forward.clone().multiplyScalar(moveSpeed));
        if (input.isKeyPressed('KeyA')) this.cameraPosition.add(right.clone().multiplyScalar(-moveSpeed));
        if (input.isKeyPressed('KeyD')) this.cameraPosition.add(right.clone().multiplyScalar(moveSpeed));
        if (input.isKeyPressed('KeyQ')) this.cameraPosition.y -= moveSpeed;
        if (input.isKeyPressed('KeyE')) this.cameraPosition.y += moveSpeed;

        this.game.camera.position.copy(this.cameraPosition);

        const lookAtPoint = this.cameraPosition.clone().add(
            new THREE.Vector3(
                -Math.sin(this.cameraRotation.y) * Math.cos(this.cameraRotation.x),
                Math.sin(this.cameraRotation.x),
                -Math.cos(this.cameraRotation.y) * Math.cos(this.cameraRotation.x)
            )
        );
        this.game.camera.lookAt(lookAtPoint);
    }

    deleteSelectedObject() {
        if (!this.selectedObject) return;

        const index = this.objects.indexOf(this.selectedObject);
        if (index > -1) {
            this.objects.splice(index, 1);
        }

        this.game.scene.remove(this.selectedObject);
        this.selectedObject = null;
        console.log('Deleted object');
    }

    saveMap() {
        const mapData = {
            objects: this.objects.map(obj => ({
                type: obj.userData.type,
                position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
                rotation: { x: obj.rotation.x, y: obj.rotation.y, z: obj.rotation.z },
                scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z },
                color: obj.material.color.getHex()
            }))
        };

        const json = JSON.stringify(mapData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'map_' + Date.now() + '.json';
        link.click();

        URL.revokeObjectURL(url);

        console.log('Map saved!');
        alert('Map saved successfully!');
    }

    loadMap() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    const mapData = JSON.parse(event.target.result);
                    this.clearMap();

                    for (const objData of mapData.objects) {
                        const position = new THREE.Vector3(
                            objData.position.x,
                            objData.position.y,
                            objData.position.z
                        );
                        this.createObject(objData.type, position);

                        const lastObject = this.objects[this.objects.length - 1];
                        lastObject.rotation.set(objData.rotation.x, objData.rotation.y, objData.rotation.z);
                        lastObject.scale.set(objData.scale.x, objData.scale.y, objData.scale.z);
                        lastObject.material.color.setHex(objData.color);
                    }

                    console.log('Map loaded!');
                    alert('Map loaded successfully!');
                } catch (error) {
                    console.error('Error loading map:', error);
                    alert('Error loading map file!');
                }
            };

            reader.readAsText(file);
        };

        input.click();
    }

    clearMap() {
        for (const obj of this.objects) {
            this.game.scene.remove(obj);
        }
        this.objects = [];
        this.selectedObject = null;
        console.log('Map cleared!');
    }

    cleanup() {
        for (const obj of this.objects) {
            this.game.scene.remove(obj);
        }
        this.objects = [];
        this.selectedObject = null;

        const objectsToRemove = [];
        this.game.scene.traverse((object) => {
            if (object.isMesh || object.isGroup || object instanceof THREE.GridHelper) {
                if (object !== this.game.scene) {
                    objectsToRemove.push(object);
                }
            }
        });

        for (const object of objectsToRemove) {
            this.game.scene.remove(object);
        }

        document.removeEventListener('mousedown', this.mouseDownHandler);
        document.removeEventListener('mousemove', this.mouseMoveHandler);
    }
}
