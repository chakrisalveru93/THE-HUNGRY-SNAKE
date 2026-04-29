export type Point = {
  x: number;
  y: number;
};

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum FoodType {
  NORMAL = 'NORMAL',
  BONUS = 'BONUS',
  POISON = 'POISON',
  MULTIPLIER = 'MULTIPLIER',
}

export enum PowerUpType {
  SLOW_MO = 'SLOW_MO',
  SHIELD = 'SHIELD',
  GHOST = 'GHOST',
  MAGNET = 'MAGNET',
}

export type Food = {
  id: string;
  position: Point;
  type: FoodType;
  expiresAt?: number;
};

export type PowerUp = {
  type: PowerUpType;
  endTime: number;
};

export type GameMode = 'CLASSIC' | 'ZEN' | 'HARDCORE' | 'MUSIC_SYNC';

export type GameStatus = 'START' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string;
};

export type Track = {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
  duration: number;
};

export type GameSettings = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showGrid: boolean;
  speedMultiplier: number;
};

export type GameStats = {
  score: number;
  highScore: number;
  level: number;
  combo: number;
  maxCombo: number;
  foodEaten: number;
  timeSurvived: number;
};
