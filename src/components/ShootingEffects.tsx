import React, { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store';

const MUZZLE_FLASH_DURATION = 80;
const HIT_MARKER_DURATION = 200;

export const ShootingEffects: React.FC = () => {
  const [showFlash, setShowFlash] = useState(false);
  const [showHitMarker, setShowHitMarker] = useState(false);
  const prevShotTime = useRef(0);
  const prevHitTime = useRef(0);

  const lastShotTime = useGameStore((s) => s.lastShotTime);
  const lastHitTime = useGameStore((s) => s.lastHitTime);
  const gameState = useGameStore((s) => s.gameState);

  // Muzzle flash
  useEffect(() => {
    if (lastShotTime > 0 && lastShotTime !== prevShotTime.current) {
      prevShotTime.current = lastShotTime;
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), MUZZLE_FLASH_DURATION);
      return () => clearTimeout(timer);
    }
  }, [lastShotTime]);

  // Hit marker
  useEffect(() => {
    if (lastHitTime > 0 && lastHitTime !== prevHitTime.current) {
      prevHitTime.current = lastHitTime;
      setShowHitMarker(true);
      const timer = setTimeout(() => setShowHitMarker(false), HIT_MARKER_DURATION);
      return () => clearTimeout(timer);
    }
  }, [lastHitTime]);

  if (gameState !== 'playing') return null;

  return (
    <>
      {/* Muzzle Flash — full-screen subtle flash */}
      {showFlash && <div className="muzzle-flash" />}

      {/* Hit Marker — "X" at crosshair position */}
      {showHitMarker && (
        <div className="hit-marker">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="4" y1="4" x2="20" y2="20" stroke="#ff4444" strokeWidth="3" strokeLinecap="round" />
            <line x1="20" y1="4" x2="4" y2="20" stroke="#ff4444" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </>
  );
};
