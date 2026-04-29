import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings, Monitor, Zap, Volume2, Grid3X3 } from 'lucide-react';
import { GameMode, GameSettings } from '../types';
import { cn } from '../lib/utils';
import { Smartphone, Info } from 'lucide-react';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  mode,
  onModeChange,
  settings,
  onSettingsChange
}) => {
  if (!isOpen) return null;

  const toggleSetting = (key: keyof GameSettings) => {
    if (typeof settings[key] === 'boolean') {
      onSettingsChange({
        ...settings,
        [key]: !settings[key]
      });
    }
  };

  const handleSpeedChange = (value: number) => {
    onSettingsChange({
      ...settings,
      speedMultiplier: value
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-[#0f0f11] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-cyan-500" />
            <h2 className="text-xl font-black text-white italic uppercase tracking-widest">Protocol Config</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-white/40" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Mode Selector */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">Game Simulation Mode</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['CLASSIC', 'ZEN', 'HARDCORE', 'MUSIC_SYNC'] as GameMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => onModeChange(m)}
                  className={cn(
                    "p-4 rounded-xl border transition-all text-left group relative overflow-hidden",
                    mode === m 
                      ? "bg-cyan-500/10 border-cyan-500" 
                      : "bg-white/5 border-white/10 hover:border-white/20"
                  )}
                >
                  <div className={cn(
                    "text-sm font-bold tracking-tight uppercase mb-1",
                    mode === m ? "text-cyan-400" : "text-white/60"
                  )}>{m}</div>
                  <p className="text-[10px] text-white/30 leading-tight">
                    {m === 'CLASSIC' && 'Standard grid response and scaling.'}
                    {m === 'ZEN' && 'Infinite life. No wall collision.'}
                    {m === 'HARDCORE' && 'High velocity. Maximum hazard.'}
                    {m === 'MUSIC_SYNC' && 'Speed reactive to frequency.'}
                  </p>
                  {mode === m && (
                    <motion.div 
                      layoutId="active-mode"
                      className="absolute top-0 right-0 w-8 h-8 bg-cyan-500/20 rounded-bl-xl flex items-center justify-center border-b border-l border-cyan-500"
                    >
                       <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Visual config */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/5 rounded-lg"><Zap className="w-4 h-4 text-white/60" /></div>
                   <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Engine Velocity</h4>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">Speed Multiplier: {settings.speedMultiplier.toFixed(1)}x</p>
                   </div>
                </div>
                <div className="flex items-center gap-2">
                   {[0.5, 1.0, 1.5, 2.0].map(v => (
                     <button
                       key={v}
                       onClick={() => handleSpeedChange(v)}
                       className={cn(
                         "w-8 h-8 rounded-lg text-[10px] font-bold border transition-all",
                         settings.speedMultiplier === v 
                           ? "bg-cyan-500 border-cyan-500 text-black" 
                           : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                       )}
                     >
                       {v}
                     </button>
                   ))}
                </div>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/5 rounded-lg"><Grid3X3 className="w-4 h-4 text-white/60" /></div>
                   <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Grid Matrix</h4>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">Toggle visual grid lines</p>
                   </div>
                </div>
                <button 
                  onClick={() => toggleSetting('showGrid')}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all flex items-center px-1",
                    settings.showGrid ? "bg-cyan-500" : "bg-white/10"
                  )}
                >
                   <div className={cn(
                     "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                     settings.showGrid ? "translate-x-6" : "translate-x-0"
                   )} />
                </button>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/5 rounded-lg"><Volume2 className="w-4 h-4 text-white/60" /></div>
                   <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Sound Effects</h4>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">Synth response alerts</p>
                   </div>
                </div>
                <button 
                  onClick={() => toggleSetting('soundEnabled')}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all flex items-center px-1",
                    settings.soundEnabled ? "bg-cyan-500" : "bg-white/10"
                  )}
                >
                   <div className={cn(
                     "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                     settings.soundEnabled ? "translate-x-6" : "translate-x-0"
                   )} />
                </button>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/5 rounded-lg"><Smartphone className="w-4 h-4 text-white/60" /></div>
                   <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Tactile Feedback</h4>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">Haptic vibration pulses</p>
                   </div>
                </div>
                <button 
                  onClick={() => toggleSetting('hapticsEnabled')}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all flex items-center px-1",
                    settings.hapticsEnabled ? "bg-cyan-500" : "bg-white/10"
                  )}
                >
                   <div className={cn(
                     "w-4 h-4 bg-white rounded-full shadow-sm transition-transform",
                     settings.hapticsEnabled ? "translate-x-6" : "translate-x-0"
                   )} />
                </button>
             </div>
          </section>
        </div>

        <div className="p-6 bg-white/5 border-t border-white/5 flex gap-4">
           <button 
            onClick={onClose}
            className="flex-1 py-3 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-white/90 transition-all"
           >
             Save Configuration
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
