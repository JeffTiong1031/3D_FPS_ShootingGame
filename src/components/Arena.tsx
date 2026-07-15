import React from 'react';
import { RigidBody } from '@react-three/rapier';

export const Arena: React.FC = () => {
  return (
    <group>
      {/* Ground */}
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[100, 1, 100]} />
          <meshStandardMaterial color="#1a1a2e" roughness={0.8} />
        </mesh>
      </RigidBody>

      {/* Obstacles */}
      <RigidBody type="fixed">
        <mesh castShadow receiveShadow position={[5, 2, 5]}>
          <boxGeometry args={[4, 4, 4]} />
          <meshStandardMaterial color="#0f3460" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh castShadow receiveShadow position={[-10, 3, -10]}>
          <boxGeometry args={[6, 6, 6]} />
          <meshStandardMaterial color="#e94560" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh castShadow receiveShadow position={[12, 1.5, -8]}>
          <boxGeometry args={[3, 3, 3]} />
          <meshStandardMaterial color="#0f3460" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh castShadow receiveShadow position={[-15, 2, 15]}>
          <boxGeometry args={[4, 4, 2]} />
          <meshStandardMaterial color="#0f3460" />
        </mesh>
      </RigidBody>
      
      {/* Walls */}
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, 5, 50]}>
          <boxGeometry args={[100, 10, 1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh receiveShadow position={[0, 5, -50]}>
          <boxGeometry args={[100, 10, 1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh receiveShadow position={[50, 5, 0]}>
          <boxGeometry args={[1, 10, 100]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed">
        <mesh receiveShadow position={[-50, 5, 0]}>
          <boxGeometry args={[1, 10, 100]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </RigidBody>
    </group>
  );
};
