import * as THREE from 'three';
import { GAME_CONSTANTS } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';

class PathNode {
    constructor(x, z) {
        this.x = x;
        this.z = z;
        this.g = 0; // Cost from start
        this.h = 0; // Heuristic cost to end
        this.f = 0; // Total cost
        this.parent = null;
        this.walkable = true;
    }

    getKey() {
        return `${this.x},${this.z}`;
    }
}

export class PathfindingSystem {
    constructor(worldSize, gridSize) {
        this.worldSize = worldSize;
        this.gridSize = gridSize;
        this.gridWidth = Math.floor(worldSize / gridSize);
        this.gridHeight = Math.floor(worldSize / gridSize);
        this.grid = this.createGrid();
        this.obstacles = new Set();
    }

    createGrid() {
        const grid = {};
        for (let x = 0; x < this.gridWidth; x++) {
            for (let z = 0; z < this.gridHeight; z++) {
                const node = new PathNode(x, z);
                grid[node.getKey()] = node;
            }
        }
        return grid;
    }

    worldToGrid(worldPos) {
        const offset = this.worldSize / 2;
        const x = Math.floor((worldPos.x + offset) / this.gridSize);
        const z = Math.floor((worldPos.z + offset) / this.gridSize);
        return { x: MathUtils.clamp(x, 0, this.gridWidth - 1), z: MathUtils.clamp(z, 0, this.gridHeight - 1) };
    }

    gridToWorld(gridPos) {
        const offset = this.worldSize / 2;
        return new THREE.Vector3(
            gridPos.x * this.gridSize - offset + this.gridSize / 2,
            0,
            gridPos.z * this.gridSize - offset + this.gridSize / 2
        );
    }

    getNode(x, z) {
        const key = `${x},${z}`;
        return this.grid[key];
    }

    getNeighbors(node) {
        const neighbors = [];
        const directions = [
            { x: 0, z: 1 },  // North
            { x: 1, z: 0 },  // East
            { x: 0, z: -1 }, // South
            { x: -1, z: 0 }, // West
            { x: 1, z: 1 },  // NE
            { x: 1, z: -1 }, // SE
            { x: -1, z: -1 },// SW
            { x: -1, z: 1 }, // NW
        ];

        for (const dir of directions) {
            const newX = node.x + dir.x;
            const newZ = node.z + dir.z;

            if (newX >= 0 && newX < this.gridWidth && newZ >= 0 && newZ < this.gridHeight) {
                const neighbor = this.getNode(newX, newZ);
                if (neighbor && neighbor.walkable) {
                    neighbors.push(neighbor);
                }
            }
        }

        return neighbors;
    }

    heuristic(nodeA, nodeB) {
        // Euclidean distance
        const dx = nodeA.x - nodeB.x;
        const dz = nodeA.z - nodeB.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    findPath(startPos, endPos) {
        const startGrid = this.worldToGrid(startPos);
        const endGrid = this.worldToGrid(endPos);

        const startNode = this.getNode(startGrid.x, startGrid.z);
        const endNode = this.getNode(endGrid.x, endGrid.z);

        if (!startNode || !endNode || !endNode.walkable) {
            return null;
        }

        // Reset all nodes before pathfinding to prevent stale data
        this.resetNodes();

        // A* algorithm
        const openSet = [startNode];
        const closedSet = new Set();
        const openSetKeys = new Set([startNode.getKey()]);

        startNode.g = 0;
        startNode.h = this.heuristic(startNode, endNode);
        startNode.f = startNode.h;

        // Add iteration limit to prevent infinite loops
        let iterations = 0;
        const maxIterations = 10000; // Reasonable limit for pathfinding

        while (openSet.length > 0 && iterations < maxIterations) {
            iterations++;

            // Find node with lowest f score
            let currentIndex = 0;
            for (let i = 1; i < openSet.length; i++) {
                if (openSet[i].f < openSet[currentIndex].f) {
                    currentIndex = i;
                }
            }

            const current = openSet[currentIndex];

            // Check if we reached the goal
            if (current === endNode) {
                return this.reconstructPath(current);
            }

            // Move current from open to closed
            openSet.splice(currentIndex, 1);
            openSetKeys.delete(current.getKey());
            closedSet.add(current.getKey());

            // Check neighbors
            const neighbors = this.getNeighbors(current);
            for (const neighbor of neighbors) {
                if (closedSet.has(neighbor.getKey())) {
                    continue;
                }

                // Calculate distance (diagonal = 1.414, straight = 1)
                const dx = Math.abs(neighbor.x - current.x);
                const dz = Math.abs(neighbor.z - current.z);
                const moveCost = (dx === 1 && dz === 1) ? 1.414 : 1;
                const tentativeG = current.g + moveCost;

                if (!openSetKeys.has(neighbor.getKey())) {
                    openSet.push(neighbor);
                    openSetKeys.add(neighbor.getKey());
                } else if (tentativeG >= neighbor.g) {
                    continue;
                }

                neighbor.parent = current;
                neighbor.g = tentativeG;
                neighbor.h = this.heuristic(neighbor, endNode);
                neighbor.f = neighbor.g + neighbor.h;
            }
        }

        // No path found or exceeded iterations
        if (iterations >= maxIterations) {
            console.warn('Pathfinding exceeded maximum iterations - cancelling search');
        }
        return null;
    }

    resetNodes() {
        // Reset all node pathfinding data to prevent stale parent references
        for (const key in this.grid) {
            const node = this.grid[key];
            node.parent = null;
            node.g = 0;
            node.h = 0;
            node.f = 0;
        }
    }

    reconstructPath(endNode) {
        const path = [];
        let current = endNode;
        let safetyCounter = 0;
        const maxIterations = this.gridWidth * this.gridHeight;

        // Prevent infinite loops with safety counter
        while (current && safetyCounter < maxIterations) {
            path.unshift(this.gridToWorld({ x: current.x, z: current.z }));
            current = current.parent;
            safetyCounter++;
        }

        if (safetyCounter >= maxIterations) {
            console.error('Path reconstruction exceeded maximum iterations - potential infinite loop detected');
            return null;
        }

        return path;
    }

    setObstacle(worldPos, isObstacle = true) {
        const gridPos = this.worldToGrid(worldPos);
        const node = this.getNode(gridPos.x, gridPos.z);
        if (node) {
            node.walkable = !isObstacle;
            if (isObstacle) {
                this.obstacles.add(node.getKey());
            } else {
                this.obstacles.delete(node.getKey());
            }
        }
    }

    clearObstacles() {
        for (const key of this.obstacles) {
            const [x, z] = key.split(',').map(Number);
            const node = this.getNode(x, z);
            if (node) {
                node.walkable = true;
            }
        }
        this.obstacles.clear();
    }
}
