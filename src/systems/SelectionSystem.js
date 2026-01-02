import * as THREE from 'three';
import { UNIT_COMMANDS } from '../utils/Constants.js';

export class SelectionSystem {
    constructor(game) {
        this.game = game;
        this.selectedUnits = [];
        this.selectedBuilding = null;

        this.isDragging = false;
        this.dragStart = null;
        this.dragEnd = null;
        this.selectionBox = document.getElementById('selection-box');

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    clearSelection() {
        // Deselect all units
        for (const unit of this.selectedUnits) {
            unit.setSelected(false);
        }
        this.selectedUnits = [];

        // Deselect building
        if (this.selectedBuilding) {
            this.selectedBuilding.setSelected(false);
            this.selectedBuilding = null;
        }

        this.updateUI();
    }

    selectUnit(unit, addToSelection = false) {
        if (!addToSelection) {
            this.clearSelection();
        }

        if (!this.selectedUnits.includes(unit)) {
            this.selectedUnits.push(unit);
            unit.setSelected(true);
        }

        this.updateUI();
    }

    selectBuilding(building) {
        this.clearSelection();
        this.selectedBuilding = building;
        building.setSelected(true);
        this.updateUI();
    }

    selectUnitsInBox(start, end) {
        this.clearSelection();

        const minX = Math.min(start.x, end.x);
        const maxX = Math.max(start.x, end.x);
        const minY = Math.min(start.y, end.y);
        const maxY = Math.max(start.y, end.y);

        for (const unit of this.game.units) {
            if (unit.team !== 0) continue; // Only select player units

            const screenPos = this.worldToScreen(unit.position);
            if (screenPos.x >= minX && screenPos.x <= maxX &&
                screenPos.y >= minY && screenPos.y <= maxY) {
                this.selectedUnits.push(unit);
                unit.setSelected(true);
            }
        }

        this.updateUI();
    }

    worldToScreen(worldPos) {
        const vector = worldPos.clone();
        vector.project(this.game.camera);

        const x = (vector.x + 1) / 2 * window.innerWidth;
        const y = -(vector.y - 1) / 2 * window.innerHeight;

        return { x, y };
    }

    handleClick(event, addToSelection = false) {
        this.updateMousePosition(event);

        this.raycaster.setFromCamera(this.mouse, this.game.camera);

        // Check units
        const unitIntersects = [];
        for (const unit of this.game.units) {
            if (unit.model) {
                const intersects = this.raycaster.intersectObject(unit.model, true);
                if (intersects.length > 0) {
                    unitIntersects.push({ unit, distance: intersects[0].distance });
                }
            }
        }

        if (unitIntersects.length > 0) {
            // Select closest unit
            unitIntersects.sort((a, b) => a.distance - b.distance);
            this.selectUnit(unitIntersects[0].unit, addToSelection);
            return;
        }

        // Check buildings
        for (const building of this.game.buildings) {
            if (building.model) {
                const intersects = this.raycaster.intersectObject(building.model, true);
                if (intersects.length > 0) {
                    this.selectBuilding(building);
                    return;
                }
            }
        }

        // Nothing clicked
        if (!addToSelection) {
            this.clearSelection();
        }
    }

    handleRightClick(event) {
        this.updateMousePosition(event);
        this.raycaster.setFromCamera(this.mouse, this.game.camera);

        if (this.selectedUnits.length === 0) return;

        // Check if clicking on enemy unit
        for (const unit of this.game.units) {
            if (unit.team !== 0 && unit.model) {
                const intersects = this.raycaster.intersectObject(unit.model, true);
                if (intersects.length > 0) {
                    this.issueAttackCommand(unit);
                    return;
                }
            }
        }

        // Check if clicking on resource
        for (const building of this.game.buildings) {
            if (building.resourceType && building.model) {
                const intersects = this.raycaster.intersectObject(building.model, true);
                if (intersects.length > 0) {
                    this.issueGatherCommand(building);
                    return;
                }
            }
        }

        // Default: move command
        const groundIntersects = this.raycaster.intersectObject(this.game.ground);
        if (groundIntersects.length > 0) {
            const targetPos = groundIntersects[0].point;
            this.issueMoveCommand(targetPos);
        }
    }

    issueMoveCommand(position) {
        for (const unit of this.selectedUnits) {
            // Add small random offset for multiple units
            const offset = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            );
            unit.setCommand(UNIT_COMMANDS.MOVE, position.clone().add(offset));
        }
    }

    issueAttackCommand(target) {
        for (const unit of this.selectedUnits) {
            if (unit.type === 'fighter') {
                unit.setCommand(UNIT_COMMANDS.ATTACK, target);
            }
        }
    }

    issueGatherCommand(resource) {
        for (const unit of this.selectedUnits) {
            if (unit.type === 'worker') {
                unit.setCommand(UNIT_COMMANDS.GATHER, resource);
            }
        }
    }

    startDrag(event) {
        this.isDragging = true;
        this.dragStart = { x: event.clientX, y: event.clientY };
        this.dragEnd = { x: event.clientX, y: event.clientY };
        this.updateSelectionBox();
    }

    updateDrag(event) {
        if (!this.isDragging) return;

        this.dragEnd = { x: event.clientX, y: event.clientY };
        this.updateSelectionBox();
    }

    endDrag(event) {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.dragEnd = { x: event.clientX, y: event.clientY };

        // Select units in box
        const distance = Math.abs(this.dragStart.x - this.dragEnd.x) +
                        Math.abs(this.dragStart.y - this.dragEnd.y);

        if (distance > 10) { // Minimum drag distance
            this.selectUnitsInBox(this.dragStart, this.dragEnd);
        }

        this.selectionBox.style.display = 'none';
    }

    updateSelectionBox() {
        if (!this.isDragging) return;

        const left = Math.min(this.dragStart.x, this.dragEnd.x);
        const top = Math.min(this.dragStart.y, this.dragEnd.y);
        const width = Math.abs(this.dragEnd.x - this.dragStart.x);
        const height = Math.abs(this.dragEnd.y - this.dragStart.y);

        this.selectionBox.style.left = left + 'px';
        this.selectionBox.style.top = top + 'px';
        this.selectionBox.style.width = width + 'px';
        this.selectionBox.style.height = height + 'px';
        this.selectionBox.style.display = 'block';
    }

    updateMousePosition(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    updateUI() {
        const unitPanel = document.getElementById('unit-panel');
        const actionButtons = document.getElementById('action-buttons');

        if (this.selectedUnits.length === 1) {
            const unit = this.selectedUnits[0];
            const info = unit.getInfo();

            document.getElementById('unit-name').textContent = info.type;
            document.getElementById('unit-hp').textContent = `${Math.floor(info.health)}/${info.maxHealth}`;
            document.getElementById('unit-status').textContent = info.status || 'Idle';

            const healthPercent = (info.health / info.maxHealth) * 100;
            document.getElementById('unit-health-fill').style.width = healthPercent + '%';

            unitPanel.classList.add('active');

            // Clear action buttons
            actionButtons.innerHTML = '';

        } else if (this.selectedUnits.length > 1) {
            document.getElementById('unit-name').textContent = `${this.selectedUnits.length} Units Selected`;
            document.getElementById('unit-hp').textContent = '';
            document.getElementById('unit-status').textContent = '';
            document.getElementById('unit-health-fill').style.width = '100%';

            unitPanel.classList.add('active');
            actionButtons.innerHTML = '';

        } else if (this.selectedBuilding) {
            const info = this.selectedBuilding.getInfo();

            document.getElementById('unit-name').textContent = info.type.replace('_', ' ').toUpperCase();
            document.getElementById('unit-hp').textContent = `${Math.floor(info.health)}/${info.maxHealth}`;
            document.getElementById('unit-status').textContent = info.trainQueue.length > 0 ? 'Training' : 'Idle';

            const healthPercent = (info.health / info.maxHealth) * 100;
            document.getElementById('unit-health-fill').style.width = healthPercent + '%';

            unitPanel.classList.add('active');

            // Add training buttons
            actionButtons.innerHTML = '';
            if (this.selectedBuilding.canTrain) {
                for (const unitType of this.selectedBuilding.canTrain) {
                    const btn = document.createElement('button');
                    btn.className = 'action-btn';
                    btn.textContent = `Train ${unitType}`;
                    btn.onclick = () => this.game.trainUnit(unitType);
                    actionButtons.appendChild(btn);
                }
            }

        } else {
            unitPanel.classList.remove('active');
        }
    }

    getSelectedUnits() {
        return this.selectedUnits;
    }

    getSelectedBuilding() {
        return this.selectedBuilding;
    }
}
