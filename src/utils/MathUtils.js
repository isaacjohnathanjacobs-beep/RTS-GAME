import * as THREE from 'three';

export class MathUtils {
    static distance2D(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    static direction2D(from, to) {
        const dx = to.x - from.x;
        const dz = to.z - from.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        if (length === 0) return { x: 0, z: 0 };
        return { x: dx / length, z: dz / length };
    }

    static angleToTarget(from, to) {
        const dx = to.x - from.x;
        const dz = to.z - from.z;
        return Math.atan2(dx, dz);
    }

    static lerp(start, end, t) {
        return start + (end - start) * t;
    }

    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomPointInCircle(center, radius) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        return new THREE.Vector3(
            center.x + Math.cos(angle) * r,
            center.y,
            center.z + Math.sin(angle) * r
        );
    }

    static isPointInRectangle(point, rectMin, rectMax) {
        return point.x >= rectMin.x && point.x <= rectMax.x &&
               point.z >= rectMin.z && point.z <= rectMax.z;
    }
}
