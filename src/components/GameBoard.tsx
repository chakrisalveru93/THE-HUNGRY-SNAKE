import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Point, Food, FoodType, GameStatus, GameSettings } from '../types';
import { GRID_SIZE } from '../constants';
import { Play, RotateCcw, Trophy } from 'lucide-react';

interface GameBoardProps {
  snake: Point[];
  foods: Food[];
  status: GameStatus;
  onStart: () => void;
  onRestart: () => void;
  score: number;
  frequencyData?: Uint8Array;
  settings: GameSettings;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  snake,
  foods,
  status,
  onStart,
  onRestart,
  score,
  frequencyData,
  settings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastScoreRef = useRef(score);
  const [shake, setShake] = useState(false);
  const frameCountRef = useRef(0);

  // Trigger shake and particles on score change (eating food)
  useEffect(() => {
    if (score > lastScoreRef.current) {
      // Eat effect
      setShake(true);
      setTimeout(() => setShake(false), 150);
      
      // Spawn particles at head position
      if (snake.length > 0) {
        const head = snake[0];
        spawnParticles(head.x, head.y, '#00f2ff', 15);
      }
    }
    lastScoreRef.current = score;
  }, [score, snake]);

  // Trigger dramatic shake on Game Over
  useEffect(() => {
    if (status === 'GAME_OVER') {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      
      // Explosion at head
      if (snake.length > 0) {
        const head = snake[0];
        spawnParticles(head.x, head.y, '#ff3c00', 40);
        // Also spawn particles along the body
        snake.slice(1, 10).forEach(p => spawnParticles(p.x, p.y, '#00f2ff', 5));
      }
    }
  }, [status, snake]);

  const spawnParticles = (gx: number, gy: number, color: string, count: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cellSize = canvas.width / GRID_SIZE;
    const x = gx * cellSize + cellSize / 2;
    const y = gy * cellSize + cellSize / 2;

    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1.0,
        color,
        size: Math.random() * 4 + 2
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;

    const render = () => {
      frameCountRef.current++;
      const size = canvas.width;
      const cellSize = size / GRID_SIZE;

      ctx.clearRect(0, 0, size, size);

      // Grid
      if (settings.showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_SIZE; i++) {
          ctx.beginPath(); ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, size); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, i * cellSize); ctx.lineTo(size, i * cellSize); ctx.stroke();
        }
      }

      // Audio Power
      let audioPower = 0;
      if (frequencyData && frequencyData.length > 0) {
        let total = 0;
        for (let i = 0; i < frequencyData.length; i++) {
          total += Number(frequencyData[i]);
        }
        audioPower = total / (255 * frequencyData.length);
      }

      // Draw Foods
      foods.forEach(food => {
        const x = food.position.x * cellSize + cellSize / 2;
        const y = food.position.y * cellSize + cellSize / 2;
        const pulse = Math.sin(frameCountRef.current * 0.1) * 3;
        const radius = (cellSize / 3) + pulse + (audioPower * 10);
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        if (food.type === FoodType.NORMAL) { ctx.fillStyle = '#00f2ff'; ctx.shadowColor = '#00f2ff'; }
        else if (food.type === FoodType.BONUS) { ctx.fillStyle = '#ff00d4'; ctx.shadowColor = '#ff00d4'; }
        else { ctx.fillStyle = '#ff3c00'; ctx.shadowColor = '#ff3c00'; }
        ctx.shadowBlur = 15 + (audioPower * 30);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw Snake
      snake.forEach((segment, i) => {
        const x = segment.x * cellSize;
        const y = segment.y * cellSize;
        const isHead = i === 0;
        const pad = isHead ? 1 : 2.5;

        // Visual enhancement: Audio-reactive size and glow
        const segmentPulse = Math.sin(frameCountRef.current * 0.15 - i * 0.2) * (1 + audioPower * 10);
        const intensity = isHead ? (30 + audioPower * 50) : (0 + audioPower * 20);

        if (isHead) {
          ctx.shadowBlur = intensity;
          ctx.shadowColor = '#00f2ff';
          ctx.fillStyle = '#ffffff';
          
          ctx.beginPath();
          ctx.roundRect(x + pad, y + pad, cellSize - pad * 2, cellSize - pad * 2, 8);
          ctx.fill();

          // Eyes with audio flicker
          ctx.fillStyle = audioPower > 0.6 ? '#00f2ff' : '#000000';
          const eyeSize = 3 + (audioPower * 2);
          const eyeOffset = cellSize / 4;
          ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
          ctx.fillRect(x + cellSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
        } else {
          ctx.shadowBlur = intensity;
          ctx.shadowColor = '#00f2ff';
          const alpha = Math.max(0.2, 1 - i / Math.max(1, snake.length) * 0.8);
          ctx.fillStyle = `rgba(0, 242, 255, ${alpha})`;
          
          // Subtle rhythmic sway and pulse
          const wave = Math.sin(frameCountRef.current * 0.15 + i * 0.5) * (1.5 + audioPower * 2);
          const sizeMod = segmentPulse * 0.5;
          ctx.beginPath();
          ctx.roundRect(
            x + pad + wave - sizeMod, 
            y + pad + wave - sizeMod, 
            cellSize - (pad * 2) + sizeMod * 2, 
            cellSize - (pad * 2) + sizeMod * 2, 
            4
          );
          ctx.fill();

          // Digital exhaust effect (trailing particles)
          if (i === snake.length - 1 && frameCountRef.current % 2 === 0) {
            particlesRef.current.push({
              x: x + cellSize / 2,
              y: y + cellSize / 2,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 0.5) * 2,
              life: 1.0,
              color: '#00f2ff'
            });
          }
        }
        ctx.shadowBlur = 0;
      });

      // Update and Draw Particles
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [snake, foods, frequencyData]);

  return (
    <motion.div 
      animate={shake ? { 
        x: [0, -10, 10, -10, 10, 0],
        y: [0, 5, -5, 5, -5, 0]
      } : { x: 0, y: 0 }}
      transition={{ duration: status === 'GAME_OVER' ? 0.5 : 0.15 }}
      className="relative aspect-square w-full max-w-[600px] mx-auto bg-[#0a0a0b] border-[1px] border-white/5 rounded-2xl p-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-xl -translate-x-1 -translate-y-1" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-xl translate-x-1 -translate-y-1" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-xl -translate-x-1 translate-y-1" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/30 rounded-br-xl translate-x-1 translate-y-1" />

      <canvas 
        ref={canvasRef} 
        width={800} 
        height={800} 
        className="w-full h-full"
      />

      <AnimatePresence>
        {status === 'START' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-6xl font-black text-white mb-2 italic tracking-tighter uppercase">Neon Snake</h1>
              <div className="h-1 w-24 bg-cyan-500 mx-auto mb-6 shadow-[0_0_15px_#06b6d4]" />
              <p className="text-white/60 mb-8 max-w-xs text-sm uppercase tracking-[0.2em]">Pilot your vessel through the digital matrix. Chase the signal. Surpass the mainframe.</p>
              
              <div className="flex flex-col items-center gap-6">
                <button 
                  onClick={onStart}
                  className="group relative px-12 py-4 bg-transparent border-2 border-cyan-500 text-cyan-500 font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all overflow-hidden"
                >
                  <div className="relative z-10 flex items-center gap-2">
                    <Play className="w-5 h-5 fill-current" />
                    Initialize Core
                  </div>
                  <div className="absolute inset-0 bg-cyan-400/20 translate-x-full group-hover:translate-x-0 transition-transform skew-x-12" />
                </button>

                <div className="flex gap-4 items-center opacity-40">
                  <div className="flex flex-col items-center">
                    <div className="px-2 py-1 border border-white/20 rounded text-[10px] font-mono mb-1">WASD</div>
                    <span className="text-[8px] uppercase tracking-widest font-bold">Vector</span>
                  </div>
                  <div className="w-[1px] h-4 bg-white/20" />
                  <div className="flex flex-col items-center">
                    <div className="px-2 py-1 border border-white/20 rounded text-[10px] font-mono mb-1">SPACE</div>
                    <span className="text-[8px] uppercase tracking-widest font-bold">Manual</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {status === 'PAUSED' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="bg-white/10 border border-white/20 p-8 rounded-2xl backdrop-blur-xl text-center">
               <h2 className="text-2xl font-black text-white italic uppercase mb-6 tracking-widest">Protocol Interrupted</h2>
               <button 
                onClick={onStart}
                className="px-8 py-3 bg-cyan-500 text-black font-bold uppercase tracking-wider rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.5)]"
               >
                 Resume Sequence
               </button>
            </div>
          </motion.div>
        )}

        {status === 'GAME_OVER' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-950/40 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-bounce" />
              <h2 className="text-4xl font-black text-white mb-2 italic uppercase tracking-tighter">System Terminated</h2>
              <p className="text-white/60 mb-1 uppercase text-xs font-bold tracking-widest">Digital Yield</p>
              <div className="text-6xl font-black text-white mb-8 mb-8 tabular-nums tracking-tighter">{score}</div>
              
              <div className="flex gap-4 justify-center">
                 <button 
                  onClick={onRestart}
                  className="flex items-center gap-2 px-8 py-3 bg-white text-black font-black uppercase tracking-widest rounded-lg hover:bg-white/90 transition-all active:scale-95"
                 >
                   <RotateCcw className="w-5 h-5" />
                   Reboot
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
