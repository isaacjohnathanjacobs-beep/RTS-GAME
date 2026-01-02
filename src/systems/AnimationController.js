import * as THREE from 'three';
import { ANIMATION_STATES } from '../utils/Constants.js';

export class AnimationController {
    constructor(model, resourceManager) {
        this.model = model;
        this.resourceManager = resourceManager;
        this.mixer = new THREE.AnimationMixer(model);
        this.currentAction = null;
        this.actions = {};
        this.currentState = ANIMATION_STATES.IDLE;

        this.setupAnimations();
    }

    setupAnimations() {
        // Map animation states to loaded animations
        const animationMap = {
            [ANIMATION_STATES.IDLE]: 'idle',
            [ANIMATION_STATES.WALK]: 'walk',
            [ANIMATION_STATES.RUN]: 'run',
            [ANIMATION_STATES.ATTACK]: 'attack_slash',
            [ANIMATION_STATES.COMBAT_STANCE]: 'combat_stance',
            [ANIMATION_STATES.DEATH]: 'death',
        };

        // Create actions for each animation
        for (const [state, animName] of Object.entries(animationMap)) {
            const clip = this.resourceManager.getAnimation(animName);
            if (clip) {
                const action = this.mixer.clipAction(clip);
                this.actions[state] = action;
            } else {
                console.warn(`Animation ${animName} not found for state ${state}`);
            }
        }

        // Start with idle animation
        if (this.actions[ANIMATION_STATES.IDLE]) {
            this.currentAction = this.actions[ANIMATION_STATES.IDLE];
            this.currentAction.play();
        }
    }

    setState(state, options = {}) {
        if (this.currentState === state && !options.force) {
            return;
        }

        const newAction = this.actions[state];
        if (!newAction) {
            console.warn(`Animation state ${state} not found`);
            return;
        }

        // Fade between animations
        const fadeDuration = options.fadeDuration || 0.2;

        if (this.currentAction && this.currentAction !== newAction) {
            this.currentAction.fadeOut(fadeDuration);
        }

        newAction.reset();
        newAction.fadeIn(fadeDuration);
        newAction.play();

        // Death animation should not loop
        if (state === ANIMATION_STATES.DEATH) {
            newAction.setLoop(THREE.LoopOnce);
            newAction.clampWhenFinished = true;
        } else {
            newAction.setLoop(THREE.LoopRepeat);
        }

        this.currentAction = newAction;
        this.currentState = state;
    }

    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
    }

    getState() {
        return this.currentState;
    }

    dispose() {
        if (this.mixer) {
            this.mixer.stopAllAction();
        }
    }
}
