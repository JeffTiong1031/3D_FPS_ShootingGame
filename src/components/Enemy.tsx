import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore, DIFFICULTY_CONFIGS, SPAWN_PAIRS } from '../store';
import { registerCollider, unregisterCollider, getColliderType } from '../colliderRegistry';

const SIGHT_RANGE = 100;

export const Enemy: React.FC = () => {
  const rigidBodyRef = useRef<any>(null);
  const colliderRef = useRef<any>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const { rapier, world } = useRapier();
  const { camera } = useThree();
  const gameState = useGameStore(state => state.gameState);
  const spawnIndex = useGameStore(state => state.spawnIndex);

  // Mutable refs for values read inside useFrame — avoids stale closures
  const lastShotRef = useRef(0);
  const targetPointRef = useRef(new THREE.Vector3(0, 0, 0));
  const registeredHandle = useRef<number | null>(null);

  // Register enemy collider in the registry once the collider ref is available
  useEffect(() => {
    const timer = setTimeout(() => {
      if (colliderRef.current && colliderRef.current.handle !== undefined) {
        registerCollider(colliderRef.current.handle, 'enemy');
        registeredHandle.current = colliderRef.current.handle;
      }
    }, 100);
    return () => {
      clearTimeout(timer);
      if (registeredHandle.current !== null) {
        unregisterCollider(registeredHandle.current);
      }
    };
  }, []);

  // Set spawn when a match begins
  useEffect(() => {
    if (gameState === 'playing' && rigidBodyRef.current) {
      const pair = SPAWN_PAIRS[spawnIndex];
      const e = pair.enemy;
      
      rigidBodyRef.current.setTranslation({ x: e[0], y: e[1], z: e[2] }, true);
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [gameState, spawnIndex]);

  // Random patrol logic
  useEffect(() => {
    const interval = setInterval(() => {
      const rx = (Math.random() - 0.5) * 40;
      const rz = (Math.random() - 0.5) * 40;
      targetPointRef.current.set(rx, 0, rz);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    // Read store imperatively every frame — never stale
    const { gameState, difficulty, addProjectile } = useGameStore.getState();
    const config = DIFFICULTY_CONFIGS[difficulty];
    if (gameState !== 'playing' || !rigidBodyRef.current || !meshRef.current) return;

    const position = rigidBodyRef.current.translation();
    const enemyPos = new THREE.Vector3(position.x, position.y, position.z);

    // Check line of sight to player
    const rayOrigin = new THREE.Vector3(enemyPos.x, enemyPos.y + 0.5, enemyPos.z);
    const directionToPlayer = new THREE.Vector3().subVectors(camera.position, rayOrigin).normalize();
    const distanceToPlayer = rayOrigin.distanceTo(camera.position);

    let hasLOS = false;
    let hitDistance = SIGHT_RANGE;

    if (distanceToPlayer < SIGHT_RANGE) {
      const ray = new rapier.Ray(
        { x: rayOrigin.x, y: rayOrigin.y, z: rayOrigin.z },
        { x: directionToPlayer.x, y: directionToPlayer.y, z: directionToPlayer.z }
      );
      // Use filterPredicate to explicitly only hit the player
      const hit = world.castRay(
        ray, 
        SIGHT_RANGE, 
        true, 
        undefined, 
        undefined, 
        undefined, 
        undefined, 
        (collider) => getColliderType(collider.handle) === 'player'
      );

      if (hit && hit.collider) {
        hasLOS = true;
        hitDistance = hit.toi;
      }
    }

    // 1. Shooting Logic
    if (hasLOS) {
      // Look at player
      meshRef.current.lookAt(camera.position.x, meshRef.current.position.y, camera.position.z);

      const now = Date.now();
      if (now - lastShotRef.current > config.enemyFireRate) {
        lastShotRef.current = now;
        
        // Add inaccuracy (spread) to the shot target
        const spread = config.enemySpread !== undefined ? config.enemySpread : 1.5;
        const spreadOffset = new THREE.Vector3(
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread,
          (Math.random() - 0.5) * spread
        );
        
        // Calculate new shot direction
        const inaccurateTarget = new THREE.Vector3().copy(camera.position).add(spreadOffset);
        const shotDirection = new THREE.Vector3().subVectors(inaccurateTarget, rayOrigin).normalize();
        
        // Spawn physical projectile
        const speed = 25; // slightly slower than player
        addProjectile({
          id: Math.random().toString(36).substr(2, 9),
          position: [rayOrigin.x, rayOrigin.y, rayOrigin.z],
          velocity: [
            shotDirection.x * speed,
            shotDirection.y * speed,
            shotDirection.z * speed,
          ],
          owner: 'enemy',
          damage: config.enemyDamage
        });
      }
    }

    // 2. Movement Logic (Patrol continuously)
    const dir = new THREE.Vector3().subVectors(targetPointRef.current, enemyPos);
    dir.y = 0;
    if (dir.length() > 1) {
      dir.normalize().multiplyScalar(config.enemySpeed);
      rigidBodyRef.current.setLinvel({ x: dir.x, y: rigidBodyRef.current.linvel().y, z: dir.z }, true);
      
      // Only face the movement direction if not already staring down the player
      if (!hasLOS) {
        meshRef.current.lookAt(enemyPos.x + dir.x, meshRef.current.position.y, enemyPos.z + dir.z);
      }
    } else {
      rigidBodyRef.current.setLinvel({ x: 0, y: rigidBodyRef.current.linvel().y, z: 0 }, true);
    }
  });

  return (
    <>
      <RigidBody ref={rigidBodyRef} colliders={false} mass={1} type="dynamic" position={[0, 5, -20]} enabledRotations={[false, false, false]}>
        <CapsuleCollider ref={colliderRef} args={[0.75, 0.5]} />
        <mesh ref={meshRef} castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[1, 1.5, 1]} />
          <meshStandardMaterial color="#f87171" />
          {/* Simple face/eye to show direction */}
          <mesh position={[0, 0.4, 0.51]}>
            <boxGeometry args={[0.6, 0.2, 0.1]} />
            <meshStandardMaterial color="#fff" />
          </mesh>
        </mesh>
      </RigidBody>
    </>
  );
};

