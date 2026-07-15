import React from 'react';
import { GameEngine } from './components/GameEngine';
import { HUD } from './components/HUD';

function App() {
  return (
    <div className="app-container">
      <GameEngine />
      <HUD />
    </div>
  );
}

export default App;
