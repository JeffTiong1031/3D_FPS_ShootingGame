import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, useRapier } from '@react-three/rapier';
import { PointerLockControls, useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore, SPAWN_PAIRS } from '../store';
import { registerCollider, unregisterCollider, getColliderType } from '../colliderRegistry';

const SPEED = 10;
const direction = new THREE.Vector3();


export const Player: React.FC = () => {
  const rigidBodyRef = useRef<any>(null);
  const colliderRef = useRef<any>(null);
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const { camera } = useThree();
  const { rapier, world } = useRapier();
  const gameState = useGameStore(state => state.gameState);
  const spawnIndex = useGameStore(state => state.spawnIndex);
  const isShooting = useRef(false);
  const registeredHandle = useRef<number | null>(null);

  // Register player collider in the registry once the collider ref is available
  useEffect(() => {
    const timer = setTimeout(() => {
      if (colliderRef.current && colliderRef.current.handle !== undefined) {
        registerCollider(colliderRef.current.handle, 'player');
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

  // Set spawn and rotate camera when a match begins
  useEffect(() => {
    if (gameState === 'playing' && rigidBodyRef.current) {
      const pair = SPAWN_PAIRS[spawnIndex];
      const p = pair.player;
      const e = pair.enemy;

      // Teleport player
      rigidBodyRef.current.setTranslation({ x: p[0], y: p[1], z: p[2] }, true);
      rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);

      // Snap camera to match location and look at the enemy
      camera.position.set(p[0], p[1] + 0.8, p[2]);
      camera.lookAt(e[0], e[1] + 0.8, e[2]);
    }
  }, [gameState, spawnIndex, camera]);

  useEffect(() => {
    const handleMouseDown = () => {
      // Read game state imperatively at click time — no stale closure
      const { gameState } = useGameStore.getState();
      if (gameState !== 'playing') return;
      if (document.pointerLockElement) {
        isShooting.current = true;
      }
    };
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, []); // No dependencies needed — we read state imperatively

  useFrame(() => {
    // Read store imperatively every frame — never stale
    const { gameState, addProjectile, recordShot } = useGameStore.getState();
    if (gameState !== 'playing' || !rigidBodyRef.current) return;

    const { forward, backward, left, right } = getKeys();
    const velocity = rigidBodyRef.current.linvel();
    const position = rigidBodyRef.current.translation();

    // Update camera to match player
    camera.position.set(position.x, position.y + 0.8, position.z);

    // Movement — use camera's actual world direction to avoid Euler gimbal lock issues
    const forwardVector = new THREE.Vector3();
    camera.getWorldDirection(forwardVector);
    forwardVector.y = 0;
    forwardVector.normalize();

    const rightVector = new THREE.Vector3();
    rightVector.crossVectors(forwardVector, camera.up).normalize();

    direction.set(0, 0, 0);
    if (forward) direction.add(forwardVector);
    if (backward) direction.sub(forwardVector);
    if (right) direction.add(rightVector);
    if (left) direction.sub(rightVector);

    direction.normalize().multiplyScalar(SPEED);
    rigidBodyRef.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);

    // Shooting logic
    if (isShooting.current) {
      isShooting.current = false;
      recordShot(); // Visual feedback: muzzle flash

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

      // Spawn a physical projectile
      const speed = 40; // units per second
      addProjectile({
        id: Math.random().toString(36).substr(2, 9),
        position: [camera.position.x, camera.position.y, camera.position.z],
        velocity: [
          raycaster.ray.direction.x * speed,
          raycaster.ray.direction.y * speed,
          raycaster.ray.direction.z * speed,
        ],
        owner: 'player',
        damage: 20
      });
    }
  });

  return (
    <>
      <PointerLockControls selector="#root" />
      <RigidBody ref={rigidBodyRef} colliders={false} mass={1} type="dynamic" position={[0, 5, 10]} enabledRotations={[false, false, false]}>
        <CapsuleCollider ref={colliderRef} args={[0.75, 0.5]} />
      </RigidBody>
    </>
  );
};


