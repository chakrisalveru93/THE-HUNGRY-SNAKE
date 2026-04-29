import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, TrendingUp, Zap, Target, Timer, 
  Activity, Layers, Award, Shield, Lock
} from 'lucide-react';
import { GameStats, GameMode } from '../types';
import { ACHIEVEMENTS } from '../constants';
import { cn } from '../lib/utils';

interface HUDProps {
  stats: GameStats;
  mode: GameMode;
  combo: number;
}

export const HUD: React.FC<HUDProps> = ({ stats, mode, combo }) => {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Primary Score Panel */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />
         <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] mb-1">Grid Connectivity</p>
         <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white italic tracking-tighter tabular-nums truncate">
               {stats.score}
            </span>
         </div>
         <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
               <TrendingUp className="w-3 h-3 text-white/30" />
               <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">High {stats.highScore}</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded border border-white/10">
               <Layers className="w-3 h-3 text-cyan-400" />
               <span className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">LVL {stats.level}</span>
            </div>
         </div>
      </div>

      {/* Combo Panel */}
      <div className={cn(
        "bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 transition-all duration-500 overflow-hidden relative",
        combo > 1 ? "border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)] scale-[1.02]" : ""
      )}>
         <AnimatePresence mode="wait">
            {combo > 1 && (
               <motion.div 
                  key={combo}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.2, opacity: 0 }}
                  className="absolute inset-0 bg-cyan-500/5 pointer-events-none"
               />
            )}
         </AnimatePresence>
         <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
               <Zap className={cn("w-4 h-4", combo > 1 ? "text-cyan-400 animate-pulse" : "text-white/20")} />
               <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Combo Burst</span>
            </div>
            <span className="text-xs font-mono text-white/40 tracking-wider">MAX x{stats.maxCombo}</span>
         </div>
         <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-3xl font-black italic tracking-tighter tabular-nums",
              combo > 1 ? "text-cyan-400" : "text-white/20"
            )}>x{combo}</span>
            {combo > 5 && <span className="text-[10px] text-cyan-400 font-bold uppercase animate-pulse">Intense!</span>}
         </div>
         <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               className="h-full bg-cyan-400"
               animate={{ width: `${Math.min(combo * 10, 100)}%` }}
            />
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        <StatCard 
          icon={<Timer className="w-4 h-4 text-orange-400" />} 
          label="Uptime" 
          value={formatTime(stats.timeSurvived)} 
        />
        <StatCard 
          icon={<Target className="w-4 h-4 text-emerald-400" />} 
          label="Yield" 
          value={stats.foodEaten.toString()} 
        />
        <div className="col-span-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
           <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                 <Activity className="w-4 h-4 text-cyan-400" />
                 <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Mode Profile</span>
              </div>
              <Award className="w-4 h-4 text-white/20" />
           </div>
           <div className="text-lg font-black text-white italic tracking-tighter uppercase truncate">
             {mode} Protocol
           </div>
        </div>
      </div>

      {/* Achievement Quick View */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
         <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Digital Relics</span>
         </div>
         <div className="flex gap-2 justify-between">
            {ACHIEVEMENTS.map(ach => (
              <div 
                key={ach.id} 
                title={ach.title}
                className={cn(
                  "w-10 h-10 rounded-lg border flex items-center justify-center transition-all cursor-help",
                  ach.unlocked 
                    ? "bg-cyan-500/20 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]" 
                    : "bg-white/5 border-white/10"
                )}
              >
                 {ach.id === 'first_bite' && <Activity className={cn("w-4 h-4", ach.unlocked ? "text-cyan-400" : "text-white/10")} />}
                 {ach.id === 'combo_king' && <Zap className={cn("w-4 h-4", ach.unlocked ? "text-cyan-400" : "text-white/10")} />}
                 {ach.id === 'survivor' && <Shield className={cn("w-4 h-4", ach.unlocked ? "text-cyan-400" : "text-white/10")} />}
                 {ach.id === 'high_flyer' && <Trophy className={cn("w-4 h-4", ach.unlocked ? "text-cyan-400" : "text-white/10")} />}
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-xl font-bold text-white tabular-nums tracking-tighter">
      {value}
    </div>
  </div>
);

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
