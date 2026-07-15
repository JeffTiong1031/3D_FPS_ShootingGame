import React, { useEffect, useRef } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useGameStore, type PickupData } from '../store';
import { getColliderType } from '../colliderRegistry';
import * as THREE from 'three';

const Pickup = ({ pickup }: { pickup: PickupData }) => {
  const { removePickup, healPlayer, addPlayerAmmo, healEnemy, addEnemyAmmo } = useGameStore();
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2 + parseInt(pickup.id, 36)) * 0.2;
    }
  });

  const handleIntersection = (e: any) => {
    const targetType = getColliderType(e.other.collider.handle);
    if (targetType === 'player') {
      if (pickup.type === 'health') {
        healPlayer(20);
      } else {
        addPlayerAmmo(30);
      }
      removePickup(pickup.id);
    } else if (targetType === 'enemy') {
      if (pickup.type === 'health') {
        healEnemy(20);
      } else {
        addEnemyAmmo(30);
      }
      removePickup(pickup.id);
    }
  };

  const isHealth = pickup.type === 'health';
  const color = isHealth ? '#4ade80' : '#facc15'; // Green for health, Yellow for ammo

  return (
    <RigidBody type="fixed" position={pickup.position} colliders={false}>
      <CuboidCollider args={[0.5, 0.5, 0.5]} sensor onIntersectionEnter={handleIntersection} />
      <group ref={meshRef as any}>
        {isHealth ? (
          <group>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.6, 0.2, 0.2]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.2, 0.6, 0.2]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
          </group>
        ) : (
          <group>
            <mesh position={[-0.15, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0.15, 0, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0, 0.15, 0.15]}>
              <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
            </mesh>
          </group>
        )}
      </group>
    </RigidBody>
  );
};

export const Pickups: React.FC = () => {
  const { pickups, addPickups, gameState } = useGameStore();

  useEffect(() => {
    if (gameState !== 'playing') return;

    // Spawn randomly every 10 seconds up to a max of 10 active pickups
    const interval = setInterval(() => {
      const currentPickups = useGameStore.getState().pickups;
      if (currentPickups.length < 10) {
        // Arena is roughly 100x100, we'll spawn within -40 to 40
        const x = (Math.random() - 0.5) * 80;
        const z = (Math.random() - 0.5) * 80;
        const type = Math.random() > 0.5 ? 'health' : 'ammo';
        addPickups([{
          id: Math.random().toString(36).substr(2, 9),
          type,
          position: [x, 1, z]
        }]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [gameState, addPickups]);

  return (
    <>
      {pickups.map(p => (
        <Pickup key={p.id} pickup={p} />
      ))}
    </>
  );
};
