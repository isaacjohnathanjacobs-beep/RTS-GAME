export class Minimap {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('minimap');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = 200;
        this.canvas.height = 200;

        this.worldSize = 200;
        this.scale = this.canvas.width / this.worldSize;

        // Click on minimap to move camera
        this.canvas.addEventListener('click', (e) => this.onClick(e));
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.ctx.strokeStyle = '#3a3a3a';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const pos = (i / 10) * this.canvas.width;
            this.ctx.beginPath();
            this.ctx.moveTo(pos, 0);
            this.ctx.lineTo(pos, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, pos);
            this.ctx.lineTo(this.canvas.width, pos);
            this.ctx.stroke();
        }

        // Draw buildings
        for (const building of this.game.buildings) {
            const pos = this.worldToMinimap(building.position);
            const size = building.type === 'town_hall' ? 8 : 6;

            if (building.team === 0) {
                this.ctx.fillStyle = '#4169E1'; // Blue for player
            } else if (building.resourceType) {
                this.ctx.fillStyle = building.resourceType === 'gold' ? '#FFD700' : '#228B22';
            } else {
                this.ctx.fillStyle = '#FF4500'; // Red for enemy
            }

            this.ctx.fillRect(pos.x - size / 2, pos.y - size / 2, size, size);
        }

        // Draw units
        for (const unit of this.game.units) {
            const pos = this.worldToMinimap(unit.position);
            const size = 3;

            if (unit.team === 0) {
                this.ctx.fillStyle = unit.type === 'worker' ? '#87CEEB' : '#00FF00';
            } else {
                this.ctx.fillStyle = '#FF0000';
            }

            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw camera view
        const cameraPos = this.worldToMinimap(this.game.camera.position);
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(cameraPos.x - 20, cameraPos.y - 20, 40, 40);
    }

    worldToMinimap(worldPos) {
        const offset = this.worldSize / 2;
        return {
            x: (worldPos.x + offset) * this.scale,
            y: (worldPos.z + offset) * this.scale,
        };
    }

    minimapToWorld(minimapPos) {
        const offset = this.worldSize / 2;
        return {
            x: minimapPos.x / this.scale - offset,
            z: minimapPos.y / this.scale - offset,
        };
    }

    onClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const worldPos = this.minimapToWorld({ x, y });

        // Move camera to clicked position
        this.game.camera.position.x = worldPos.x;
        this.game.camera.position.z = worldPos.z;
    }
}
