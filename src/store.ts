import { create } from 'zustand'

export type GameState = 'menu' | 'playing' | 'gameover' | 'victory'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  enemyFireRate: number   // ms between shots
  enemyDamage: number     // damage per shot
  enemySpeed: number      // movement speed
  enemySpread: number     // weapon spread factor (inaccuracy radius)
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy:   { enemyFireRate: 1500, enemyDamage: 5,  enemySpeed: 3, enemySpread: 3.0 },
  medium: { enemyFireRate: 1000, enemyDamage: 10, enemySpeed: 5, enemySpread: 1.5 },
  hard:   { enemyFireRate: 500,  enemyDamage: 20, enemySpeed: 7, enemySpread: 0.5 },
}

export const SPAWN_PAIRS = [
  { player: [0, 5, 20], enemy: [0, 5, -20] },
  { player: [20, 5, 20], enemy: [-20, 5, -20] },
  { player: [-20, 5, 20], enemy: [20, 5, -20] },
  { player: [20, 5, 0], enemy: [-20, 5, 0] },
  { player: [0, 5, -20], enemy: [0, 5, 20] },
]

export interface ProjectileData {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  owner: 'player' | 'enemy';
  damage: number;
}

interface GameStore {
  gameState: GameState
  difficulty: Difficulty
  playerHealth: number
  enemyHealth: number
  lastShotTime: number
  lastHitTime: number
  spawnIndex: number
  projectiles: ProjectileData[]
  setGameState: (state: GameState) => void
  setDifficulty: (difficulty: Difficulty) => void
  startGame: (difficulty: Difficulty) => void
  hitPlayer: (damage: number) => void
  hitEnemy: (damage: number) => void
  recordShot: () => void
  recordHit: () => void
  resetGame: () => void
  returnToMenu: () => void
  addProjectile: (proj: ProjectileData) => void
  removeProjectile: (id: string) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: 'menu',
  difficulty: 'medium',
  playerHealth: 100,
  enemyHealth: 100,
  lastShotTime: 0,
  lastHitTime: 0,
  spawnIndex: 0,
  projectiles: [],
  setGameState: (state) => set({ gameState: state }),
  setDifficulty: (difficulty) => set({ difficulty }),
  startGame: (difficulty) => set({
    gameState: 'playing',
    difficulty,
    playerHealth: 100,
    enemyHealth: 100,
    lastShotTime: 0,
    lastHitTime: 0,
    spawnIndex: Math.floor(Math.random() * SPAWN_PAIRS.length),
    projectiles: []
  }),
  hitPlayer: (damage) => {
    const { playerHealth, gameState } = get()
    if (gameState !== 'playing') return
    const newHealth = Math.max(0, playerHealth - damage)
    set({ playerHealth: newHealth })
    if (newHealth === 0) {
      set({ gameState: 'gameover' })
    }
  },
  hitEnemy: (damage) => {
    const { enemyHealth, gameState } = get()
    if (gameState !== 'playing') return
    const newHealth = Math.max(0, enemyHealth - damage)
    set({ enemyHealth: newHealth })
    if (newHealth === 0) {
      set({ gameState: 'victory' })
    }
  },
  recordShot: () => set({ lastShotTime: Date.now() }),
  recordHit: () => set({ lastHitTime: Date.now() }),
  resetGame: () => {
    const { difficulty } = get()
    set({
      gameState: 'playing',
      playerHealth: 100,
      enemyHealth: 100,
      lastShotTime: 0,
      lastHitTime: 0,
      spawnIndex: Math.floor(Math.random() * SPAWN_PAIRS.length),
      projectiles: [],
      difficulty
    })
  },
  returnToMenu: () => {
    set({
      gameState: 'menu',
      projectiles: [],
      playerHealth: 100,
      enemyHealth: 100,
    })
  },
  addProjectile: (proj) => set((state) => ({ projectiles: [...state.projectiles, proj] })),
  removeProjectile: (id) => set((state) => ({ projectiles: state.projectiles.filter((p) => p.id !== id) })),
}))
