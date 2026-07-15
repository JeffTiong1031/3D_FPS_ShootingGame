import React, { useEffect } from 'react';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useGameStore, type ProjectileData } from '../store';
import { getColliderType } from '../colliderRegistry';
import * as THREE from 'three';

const Projectile = ({ id, position, velocity, owner, damage }: ProjectileData) => {
  const { hitPlayer, hitEnemy, removeProjectile, recordHit } = useGameStore();

  // Self-destruct after 3 seconds to prevent memory leaks if it flies off into space
  useEffect(() => {
    const timer = setTimeout(() => {
      removeProjectile(id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [id, removeProjectile]);

  const handleIntersection = (e: any) => {
    const targetType = getColliderType(e.other.collider.handle);
    
    if (owner === 'player' && targetType === 'enemy') {
      hitEnemy(damage);
      recordHit(); // visual hit marker
      removeProjectile(id);
    } else if (owner === 'enemy' && targetType === 'player') {
      hitPlayer(damage);
      removeProjectile(id);
    } else if (targetType !== 'player' && targetType !== 'enemy') {
      // We hit a wall, ground, or obstacle (unregistered collider)
      removeProjectile(id);
    }
  };

  // Align mesh with velocity vector
  const dir = new THREE.Vector3(...velocity).normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  return (
    <RigidBody 
      type="kinematicVelocity" 
      position={position} 
      linearVelocity={velocity}
      gravityScale={0}
      ccd={true}
      colliders={false}
    >
      <CapsuleCollider 
        args={[0.4, 0.2]} 
        sensor 
        onIntersectionEnter={handleIntersection} 
      />
      <mesh quaternion={quaternion}>
        <capsuleGeometry args={[0.05, 0.8, 4, 8]} />
        <meshBasicMaterial 
          color={owner === 'player' ? "#00ffff" : "#ff0000"} 
          transparent 
          opacity={0.8} 
        />
      </mesh>
    </RigidBody>
  );
};

export const Projectiles: React.FC = () => {
  const projectiles = useGameStore(state => state.projectiles);
  return (
    <>
      {projectiles.map(p => <Projectile key={p.id} {...p} />)}
    </>
  );
};
