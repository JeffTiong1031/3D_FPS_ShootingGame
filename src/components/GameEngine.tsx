import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Sky, KeyboardControls } from '@react-three/drei';
import type { KeyboardControlsEntry } from '@react-three/drei';
import { Arena } from './Arena';
import { Player } from './Player';
import { Enemy } from './Enemy';
import { Projectiles } from './Projectiles';
import { Pickups } from './Pickups';

enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  crouch = 'crouch',
  reload = 'reload',
}

export const GameEngine: React.FC = () => {
  const map: KeyboardControlsEntry<Controls>[] = [
    { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
    { name: Controls.backward, keys: ['ArrowDown', 'KeyS'] },
    { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
    { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
    { name: Controls.crouch, keys: ['Space'] },
    { name: Controls.reload, keys: ['KeyR'] },
  ];

  return (
    <KeyboardControls map={map}>
      <Canvas shadows camera={{ fov: 75, position: [0, 5, 15] }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[10, 20, 10]}
          intensity={1.5}
          shadow-mapSize={[1024, 1024]}
        />
        <Physics>
          <Arena />
          <Player />
          <Enemy />
          <Projectiles />
          <Pickups />
        </Physics>
      </Canvas>
    </KeyboardControls>
  );
};
