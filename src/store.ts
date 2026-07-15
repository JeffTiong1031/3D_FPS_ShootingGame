import { create } from 'zustand'

export type GameState = 'menu' | 'playing' | 'gameover' | 'victory'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  enemyFireRate: number   // ms between shots
  enemyDamage: number     // damage per shot
  enemySpeed: number      // movement speed
  enemySpread: number     // weapon spread factor (inaccuracy radius)
  enemyMaxHealth: number  // max health
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy:   { enemyFireRate: 1500, enemyDamage: 5,  enemySpeed: 3, enemySpread: 3.0, enemyMaxHealth: 100 },
  medium: { enemyFireRate: 1000, enemyDamage: 10, enemySpeed: 6, enemySpread: 1.5, enemyMaxHealth: 150 },
  hard:   { enemyFireRate: 500,  enemyDamage: 20, enemySpeed: 10, enemySpread: 0.5, enemyMaxHealth: 250 },
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

export interface PickupData {
  id: string;
  type: 'health' | 'ammo';
  position: [number, number, number];
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
  playerAmmoClip: number
  playerAmmoReserve: number
  playerIsReloading: boolean
  enemyAmmoClip: number
  enemyAmmoReserve: number
  enemyIsReloading: boolean
  pickups: PickupData[]
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
  setPlayerReloading: (isReloading: boolean) => void
  setEnemyReloading: (isReloading: boolean) => void
  reloadPlayer: () => void
  reloadEnemy: () => void
  consumePlayerAmmo: () => boolean
  consumeEnemyAmmo: () => boolean
  addPickups: (newPickups: PickupData[]) => void
  removePickup: (id: string) => void
  healPlayer: (amount: number) => void
  addPlayerAmmo: (amount: number) => void
  healEnemy: (amount: number) => void
  addEnemyAmmo: (amount: number) => void
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
  playerAmmoClip: 16,
  playerAmmoReserve: 90,
  playerIsReloading: false,
  enemyAmmoClip: 16,
  enemyAmmoReserve: 90,
  enemyIsReloading: false,
  pickups: [],
  setGameState: (state) => set({ gameState: state }),
  setDifficulty: (difficulty) => set({ difficulty }),
  startGame: (difficulty) => set({
    gameState: 'playing',
    difficulty,
    playerHealth: 100,
    enemyHealth: DIFFICULTY_CONFIGS[difficulty].enemyMaxHealth,
    lastShotTime: 0,
    lastHitTime: 0,
    spawnIndex: Math.floor(Math.random() * SPAWN_PAIRS.length),
    projectiles: [],
    playerAmmoClip: 16,
    playerAmmoReserve: 90,
    playerIsReloading: false,
    enemyAmmoClip: 16,
    enemyAmmoReserve: 90,
    enemyIsReloading: false,
    pickups: [],
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
      enemyHealth: DIFFICULTY_CONFIGS[difficulty].enemyMaxHealth,
      lastShotTime: 0,
      lastHitTime: 0,
      spawnIndex: Math.floor(Math.random() * SPAWN_PAIRS.length),
      projectiles: [],
      difficulty,
      playerAmmoClip: 16,
      playerAmmoReserve: 90,
      playerIsReloading: false,
      enemyAmmoClip: 16,
      enemyAmmoReserve: 90,
      enemyIsReloading: false,
      pickups: [],
    })
  },
  returnToMenu: () => {
    set({
      gameState: 'menu',
      projectiles: [],
      playerHealth: 100,
      enemyHealth: 100,
      pickups: [],
    })
  },
  addProjectile: (proj) => set((state) => ({ projectiles: [...state.projectiles, proj] })),
  removeProjectile: (id) => set((state) => ({ projectiles: state.projectiles.filter((p) => p.id !== id) })),
  setPlayerReloading: (isReloading) => set({ playerIsReloading: isReloading }),
  setEnemyReloading: (isReloading) => set({ enemyIsReloading: isReloading }),
  reloadPlayer: () => set((state) => {
    const needed = 16 - state.playerAmmoClip;
    if (needed <= 0 || state.playerAmmoReserve <= 0) return {};
    const take = Math.min(needed, state.playerAmmoReserve);
    return {
      playerAmmoClip: state.playerAmmoClip + take,
      playerAmmoReserve: state.playerAmmoReserve - take,
      playerIsReloading: false,
    };
  }),
  reloadEnemy: () => set((state) => {
    const needed = 16 - state.enemyAmmoClip;
    if (needed <= 0 || state.enemyAmmoReserve <= 0) return {};
    const take = Math.min(needed, state.enemyAmmoReserve);
    return {
      enemyAmmoClip: state.enemyAmmoClip + take,
      enemyAmmoReserve: state.enemyAmmoReserve - take,
      enemyIsReloading: false,
    };
  }),
  consumePlayerAmmo: () => {
    const { playerAmmoClip } = get();
    if (playerAmmoClip > 0) {
      set({ playerAmmoClip: playerAmmoClip - 1 });
      return true;
    }
    return false;
  },
  consumeEnemyAmmo: () => {
    const { enemyAmmoClip } = get();
    if (enemyAmmoClip > 0) {
      set({ enemyAmmoClip: enemyAmmoClip - 1 });
      return true;
    }
    return false;
  },
  addPickups: (newPickups) => set((state) => ({ pickups: [...state.pickups, ...newPickups] })),
  removePickup: (id) => set((state) => ({ pickups: state.pickups.filter((p) => p.id !== id) })),
  healPlayer: (amount) => set((state) => ({ playerHealth: Math.min(100, state.playerHealth + amount) })),
  addPlayerAmmo: (amount) => set((state) => ({ playerAmmoReserve: state.playerAmmoReserve + amount })),
  healEnemy: (amount) => set((state) => ({
    enemyHealth: Math.min(DIFFICULTY_CONFIGS[state.difficulty].enemyMaxHealth, state.enemyHealth + amount)
  })),
  addEnemyAmmo: (amount) => set((state) => ({ enemyAmmoReserve: state.enemyAmmoReserve + amount })),
}))
