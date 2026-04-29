import { Achievement, Track, GameSettings } from "./types";

export const GRID_SIZE = 20;
export const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
export const INITIAL_DIRECTION = "UP";

export const SPEED_MAP = {
  CLASSIC: 120,
  ZEN: 150,
  HARDCORE: 80,
  MUSIC_SYNC: 100,
};

export const MOCK_TRACKS: Track[] = [
  {
    id: "1",
    title: "Synthwave Breeze",
    artist: "Alex-Productions",
    url: "https://www.chosic.com/wp-content/uploads/2021/04/Synthwave-Breeze.mp3",
    cover: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=300&h=300&auto=format&fit=crop",
    duration: 145,
  },
  {
    id: "2",
    title: "Cyberpunk City",
    artist: "White Bat Audio",
    url: "https://www.chosic.com/wp-content/uploads/2021/07/Cyberpunk-City.mp3",
    cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=300&h=300&auto=format&fit=crop",
    duration: 168,
  },
  {
    id: "3",
    title: "Midnight Drive",
    artist: "Karl Casey",
    url: "https://www.chosic.com/wp-content/uploads/2021/04/Midnight-Drive.mp3",
    cover: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=300&h=300&auto=format&fit=crop",
    duration: 120,
  },
];

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  showGrid: true,
  speedMultiplier: 1.0,
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_bite",
    title: "First Bite",
    description: "Eat your first piece of food.",
    unlocked: false,
    icon: "Apple",
  },
  {
    id: "combo_king",
    title: "Combo King",
    description: "Reach a 10x combo streak.",
    unlocked: false,
    icon: "Zap",
  },
  {
    id: "survivor",
    title: "Cyber Survivor",
    description: "Survive for 2 minutes in a single game.",
    unlocked: false,
    icon: "Shield",
  },
  {
    id: "high_flyer",
    title: "High Flyer",
    description: "Score over 1000 points.",
    unlocked: false,
    icon: "Trophy",
  },
];
