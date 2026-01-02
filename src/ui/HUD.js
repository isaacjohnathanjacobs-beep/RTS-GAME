export class HUD {
    constructor(game) {
        this.game = game;

        this.goldElement = document.getElementById('gold-amount');
        this.woodElement = document.getElementById('wood-amount');
        this.foodElement = document.getElementById('food-amount');
    }

    update() {
        // Update resource display
        this.goldElement.textContent = Math.floor(this.game.resources.gold);
        this.woodElement.textContent = Math.floor(this.game.resources.wood);

        // Calculate food usage
        let foodUsed = 0;
        for (const unit of this.game.units) {
            if (unit.team === 0) {
                foodUsed += unit.type === 'worker' ? 1 : 2;
            }
        }

        this.foodElement.textContent = `${foodUsed}/${this.game.resources.maxFood}`;
    }

    showMessage(message, duration = 3000) {
        // Create a temporary message element
        const msgElement = document.createElement('div');
        msgElement.style.position = 'absolute';
        msgElement.style.top = '50%';
        msgElement.style.left = '50%';
        msgElement.style.transform = 'translate(-50%, -50%)';
        msgElement.style.background = 'rgba(0, 0, 0, 0.8)';
        msgElement.style.color = '#fff';
        msgElement.style.padding = '20px 40px';
        msgElement.style.borderRadius = '10px';
        msgElement.style.fontSize = '24px';
        msgElement.style.zIndex = '1000';
        msgElement.textContent = message;

        document.body.appendChild(msgElement);

        setTimeout(() => {
            msgElement.remove();
        }, duration);
    }
}
