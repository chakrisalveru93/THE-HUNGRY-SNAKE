import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Direction, Point, Food, FoodType, PowerUp, PowerUpType, 
  GameMode, GameStatus, GameStats, GameSettings 
} from '../types';
import { 
  GRID_SIZE, INITIAL_SNAKE, INITIAL_DIRECTION, SPEED_MAP, DEFAULT_SETTINGS 
} from '../constants';

export function useSnakeGame() {
  const [status, setStatus] = useState<GameStatus>('START');
  const [mode, setMode] = useState<GameMode>('CLASSIC');
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION as Direction);
  const [foods, setFoods] = useState<Food[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: parseInt(localStorage.getItem('neon_snake_highscore') || '0'),
    level: 1,
    combo: 0,
    maxCombo: 0,
    foodEaten: 0,
    timeSurvived: 0,
  });

  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const nextDirectionRef = useRef<Direction>(INITIAL_DIRECTION as Direction);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // State refs for the loop to access current values without re-creating the loop
  const snakeRef = useRef<Point[]>(INITIAL_SNAKE);
  const foodsRef = useRef<Food[]>([]);
  const statusRef = useRef<GameStatus>('START');
  const modeRef = useRef<GameMode>('CLASSIC');
  const levelRef = useRef<number>(1);
  const settingsRef = useRef<GameSettings>(DEFAULT_SETTINGS);

  // Sync refs with state for rendering and loop access
  useEffect(() => { snakeRef.current = snake; }, [snake]);
  useEffect(() => { foodsRef.current = foods; }, [foods]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { levelRef.current = stats.level; }, [stats.level]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const moveCountRef = useRef(0);
  const engineNodeRef = useRef<{ osc: OscillatorNode, gain: GainNode } | null>(null);

  const stopEngine = useCallback(() => {
    if (engineNodeRef.current) {
        try {
            engineNodeRef.current.osc.stop();
            engineNodeRef.current.osc.disconnect();
            engineNodeRef.current.gain.disconnect();
        } catch (e) { /* ignore */ }
        engineNodeRef.current = null;
    }
  }, []);

  const startEngine = useCallback(() => {
    if (!settingsRef.current.soundEnabled) return;
    if (engineNodeRef.current) return;

    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(40, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    engineNodeRef.current = { osc, gain };
  }, []);

  const updateEngine = useCallback(() => {
    if (!engineNodeRef.current || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const baseFreq = 40;
    const lengthMod = Math.min(10, snakeRef.current.length / 5);
    const speedMod = settingsRef.current.speedMultiplier * 10;
    
    engineNodeRef.current.osc.frequency.setTargetAtTime(baseFreq + lengthMod + speedMod, ctx.currentTime, 0.1);
  }, []);

  const playSFX = useCallback((type: 'EAT' | 'DIE' | 'LEVEL_UP' | 'MOVE') => {
    if (!settingsRef.current.soundEnabled) return;
    
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (type === 'EAT') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else if (type === 'DIE') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'LEVEL_UP') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    } else if (type === 'MOVE') {
        // Subtle tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.02);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.02);
    }
  }, []);

  const triggerHaptics = useCallback((type: 'EAT' | 'DIE') => {
    if (!settingsRef.current.hapticsEnabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (type === 'EAT') navigator.vibrate(20);
        else if (type === 'DIE') navigator.vibrate([100, 50, 100]);
    }
  }, []);

  const spawnFood = useCallback((currentSnake: Point[], currentFoods: Food[], type: FoodType = FoodType.NORMAL): Food => {
    let newPos: Point;
    let attempts = 0;
    while (attempts < 100) {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const onSnake = currentSnake.some(p => p.x === newPos.x && p.y === newPos.y);
      const onFood = currentFoods.some(f => f.position.x === newPos.x && f.position.y === newPos.y);
      if (!onSnake && !onFood) break;
      attempts++;
    }

    const food: Food = {
      id: Math.random().toString(36).substring(2, 9),
      position: newPos!,
      type,
    };

    if (type === FoodType.BONUS) {
      food.expiresAt = Date.now() + 5000;
    }

    return food;
  }, []);

  const initGame = useCallback(() => {
    const initialFoods = [spawnFood(INITIAL_SNAKE, [])];
    setSnake(INITIAL_SNAKE);
    snakeRef.current = INITIAL_SNAKE;
    setDirection(INITIAL_DIRECTION as Direction);
    nextDirectionRef.current = INITIAL_DIRECTION as Direction;
    setFoods(initialFoods);
    foodsRef.current = initialFoods;
    setPowerUps([]);
    setStats(prev => ({
      ...prev,
      score: 0,
      level: 1,
      combo: 0,
      foodEaten: 0,
      timeSurvived: 0,
    }));
    setStatus('PLAYING');
    statusRef.current = 'PLAYING';
    lastUpdateRef.current = performance.now();
  }, [spawnFood]);

  const gameOver = useCallback(() => {
    setStatus('GAME_OVER');
    statusRef.current = 'GAME_OVER';
    stopEngine();
    playSFX('DIE');
    triggerHaptics('DIE');
    setStats(prev => {
      if (prev.score > prev.highScore) {
        localStorage.setItem('neon_snake_highscore', prev.score.toString());
        return { ...prev, highScore: prev.score };
      }
      return prev;
    });
  }, []);

  const moveSnake = useCallback(() => {
    const currentSnake = [...snakeRef.current];
    const head = currentSnake[0];
    if (!head) return;

    moveCountRef.current++;
    if (moveCountRef.current % 1 === 0) { // Every step
        playSFX('MOVE');
        updateEngine();
    }

    const newDirection = nextDirectionRef.current;
    
    setDirection(newDirection);

    const newHead = { ...head };
    switch (newDirection) {
      case Direction.UP: newHead.y -= 1; break;
      case Direction.DOWN: newHead.y += 1; break;
      case Direction.LEFT: newHead.x -= 1; break;
      case Direction.RIGHT: newHead.x += 1; break;
    }

    // Collision Check
    if (modeRef.current !== 'ZEN') {
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        gameOver();
        return;
      }
      if (currentSnake.some(p => p.x === newHead.x && p.y === newHead.y)) {
        gameOver();
        return;
      }
    } else {
      newHead.x = (newHead.x + GRID_SIZE) % GRID_SIZE;
      newHead.y = (newHead.y + GRID_SIZE) % GRID_SIZE;
    }

    const nextSnake = [newHead, ...currentSnake];
    const currentFoods = [...foodsRef.current];
    const foodIndex = currentFoods.findIndex(f => f.position.x === newHead.x && f.position.y === newHead.y);

    if (foodIndex !== -1) {
      const eatenFood = currentFoods[foodIndex];
      let newFoods = currentFoods.filter((_, i) => i !== foodIndex);
      
      playSFX('EAT');
      triggerHaptics('EAT');

      let scoreGain = 10;
      if (eatenFood.type === FoodType.BONUS) scoreGain = 25;
      if (eatenFood.type === FoodType.POISON) {
        scoreGain = -15;
        if (nextSnake.length > 2) {
          nextSnake.pop();
          nextSnake.pop();
        }
      }

      setStats(prev => ({
        ...prev,
        score: Math.max(0, prev.score + scoreGain),
        combo: prev.combo + 1,
        maxCombo: Math.max(prev.maxCombo, prev.combo + 1),
        foodEaten: prev.foodEaten + 1,
        level: Math.floor((prev.score + scoreGain) / 150) + 1,
      }));

      const foodToAdd = spawnFood(nextSnake, newFoods, FoodType.NORMAL);
      newFoods.push(foodToAdd);
      if (Math.random() < 0.15) newFoods.push(spawnFood(nextSnake, newFoods, FoodType.BONUS));
      if (Math.random() < 0.08) newFoods.push(spawnFood(nextSnake, newFoods, FoodType.POISON));
      
      setFoods(newFoods);
      foodsRef.current = newFoods;
    } else {
      nextSnake.pop();
    }

    setSnake(nextSnake);
    snakeRef.current = nextSnake;
  }, [gameOver, spawnFood]);

  const gameLoop = useCallback((timestamp: number) => {
    if (statusRef.current !== 'PLAYING') return;

    const baseSpeed = SPEED_MAP[modeRef.current];
    const speedFactor = modeRef.current === 'HARDCORE' ? 0.15 : 0.08;
    const currentSpeed = (baseSpeed / (1 + (levelRef.current - 1) * speedFactor)) / settingsRef.current.speedMultiplier;
    
    if (timestamp - lastUpdateRef.current >= currentSpeed) {
      moveSnake();
      lastUpdateRef.current = timestamp;
      setStats(prev => ({ ...prev, timeSurvived: prev.timeSurvived + currentSpeed / 1000 }));
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [moveSnake]);

  useEffect(() => {
    if (status === 'PLAYING') {
      lastUpdateRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [status, gameLoop]);

  const handleDirectionChange = useCallback((newDir: Direction) => {
    const currentDir = direction;
    switch (newDir) {
      case Direction.UP: if (currentDir !== Direction.DOWN) nextDirectionRef.current = Direction.UP; break;
      case Direction.DOWN: if (currentDir !== Direction.UP) nextDirectionRef.current = Direction.DOWN; break;
      case Direction.LEFT: if (currentDir !== Direction.RIGHT) nextDirectionRef.current = Direction.LEFT; break;
      case Direction.RIGHT: if (currentDir !== Direction.LEFT) nextDirectionRef.current = Direction.RIGHT; break;
    }
  }, [direction]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (status === 'START' || status === 'GAME_OVER') {
      if (e.key === 'Enter' || e.key === ' ') {
        initGame();
        return;
      }
    }

    if (status !== 'PLAYING' && status !== 'PAUSED') return;

    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W': handleDirectionChange(Direction.UP); break;
      case 'ArrowDown':
      case 's':
      case 'S': handleDirectionChange(Direction.DOWN); break;
      case 'ArrowLeft':
      case 'a':
      case 'A': handleDirectionChange(Direction.LEFT); break;
      case 'ArrowRight':
      case 'd':
      case 'D': handleDirectionChange(Direction.RIGHT); break;
      case 'Escape':
      case 'p':
      case 'P': setStatus(prev => prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev); break;
    }
  }, [status, handleDirectionChange, initGame]);

  useEffect(() => {
    if (status === 'PAUSED' || status === 'GAME_OVER' || status === 'START') {
      stopEngine();
    } else if (status === 'PLAYING') {
      startEngine();
    }
  }, [status, startEngine, stopEngine]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Handle engine cleanup on unmount
  useEffect(() => {
    return () => stopEngine();
  }, [stopEngine]);

  return {
    status,
    setStatus,
    mode,
    setMode,
    snake,
    direction,
    foods,
    powerUps,
    stats,
    settings,
    setSettings,
    initGame,
    handleDirectionChange,
  };
}
