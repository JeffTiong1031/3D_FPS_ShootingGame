import React from 'react';
import { useGameStore } from '../store';
import type { Difficulty } from '../store';
import { Crosshair, Shield, Swords, Flame } from 'lucide-react';
import { ShootingEffects } from './ShootingEffects';

const difficultyCards: { key: Difficulty; label: string; desc: string; icon: React.ReactNode; color: string; glow: string }[] = [
  {
    key: 'easy',
    label: 'Easy',
    desc: 'Slow enemy, low damage. Perfect for learning the arena.',
    icon: <Shield size={32} />,
    color: '#4ade80',
    glow: 'rgba(74, 222, 128, 0.4)',
  },
  {
    key: 'medium',
    label: 'Medium',
    desc: 'Balanced speed and damage. A fair challenge.',
    icon: <Swords size={32} />,
    color: '#facc15',
    glow: 'rgba(250, 204, 21, 0.4)',
  },
  {
    key: 'hard',
    label: 'Hard',
    desc: 'Aggressive enemy, heavy damage. Only for the brave.',
    icon: <Flame size={32} />,
    color: '#f87171',
    glow: 'rgba(248, 113, 113, 0.4)',
  },
];

export const HUD: React.FC = () => {
  const { 
    gameState, playerHealth, enemyHealth, startGame, resetGame, returnToMenu,
    playerAmmoClip, playerAmmoReserve, playerIsReloading
  } = useGameStore();

  return (
    <div className="hud-overlay">
      {/* Health Bars */}
      {(gameState === 'playing' || gameState === 'gameover' || gameState === 'victory') && (
        <div className="health-container">
          <div className="health-bar-wrapper player">
            <div className="health-label">Player: {playerHealth} HP</div>
            <div className="health-bar">
              <div className="health-fill" style={{ width: `${playerHealth}%`, backgroundColor: '#4ade80' }}></div>
            </div>
          </div>
          <div className="health-bar-wrapper enemy">
            <div className="health-label">Enemy: {enemyHealth} HP</div>
            <div className="health-bar">
              <div className="health-fill" style={{ width: `${enemyHealth}%`, backgroundColor: '#f87171' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Ammo Display */}
      {gameState === 'playing' && (
        <div className="ammo-container" style={{ position: 'absolute', bottom: '40px', right: '40px', color: 'white', fontFamily: 'monospace', textShadow: '0 0 10px rgba(0,0,0,0.8)', textAlign: 'right', zIndex: 10 }}>
          {playerIsReloading ? (
            <div style={{ color: '#facc15', fontSize: '24px', fontWeight: 'bold' }}>RELOADING...</div>
          ) : (
            <div>
              <span style={{ fontSize: '48px', fontWeight: 'bold', color: playerAmmoClip === 0 ? '#f87171' : 'white' }}>{playerAmmoClip}</span>
              <span style={{ fontSize: '24px', color: '#9ca3af' }}> / {playerAmmoReserve}</span>
            </div>
          )}
        </div>
      )}

      {/* Crosshair */}
      {gameState === 'playing' && (
        <div className="crosshair">
          <Crosshair size={24} color="rgba(255, 255, 255, 0.7)" />
        </div>
      )}

      {/* Muzzle Flash + Hit Marker */}
      <ShootingEffects />

      {/* Main Menu with Difficulty Selection */}
      {gameState === 'menu' && (
        <div className="menu">
          <h1>Neon Arena FPS</h1>
          <p className="menu-subtitle">Choose your difficulty</p>
          <div className="difficulty-container">
            {difficultyCards.map((d) => (
              <button
                key={d.key}
                className="difficulty-card"
                style={{
                  '--card-color': d.color,
                  '--card-glow': d.glow,
                } as React.CSSProperties}
                onClick={() => startGame(d.key)}
              >
                <div className="difficulty-icon">{d.icon}</div>
                <div className="difficulty-label">{d.label}</div>
                <div className="difficulty-desc">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game Over / Victory Overlays */}
      {gameState === 'gameover' && (
        <div className="menu game-over">
          <h1>GAME OVER</h1>
          <p>You have been defeated.</p>
          <div className="menu-buttons">
            <button className="action-btn" onClick={resetGame}>Try Again</button>
            <button className="action-btn" onClick={returnToMenu}>Back to Main Menu</button>
          </div>
        </div>
      )}

      {gameState === 'victory' && (
        <div className="menu victory">
          <h1>VICTORY</h1>
          <p>You have defeated the enemy.</p>
          <div className="menu-buttons">
            <button className="action-btn" onClick={resetGame}>Play Again</button>
            <button className="action-btn" onClick={returnToMenu}>Back to Main Menu</button>
          </div>
        </div>
      )}
    </div>
  );
};
