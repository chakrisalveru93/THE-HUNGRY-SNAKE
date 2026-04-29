import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, 
  VolumeX, Repeat, Music, Disc 
} from 'lucide-react';
import { Track } from '../types';
import { Visualizer } from './Visualizer';
import { cn } from '../lib/utils';

interface MusicPlayerProps {
  tracks: Track[];
  currentIndex: number;
  isPlaying: boolean;
  onToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  onVolumeChange: (val: number) => void;
  onSelectTrack: (index: number) => void;
  volume: number;
  frequencyData: Uint8Array;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  tracks,
  currentIndex,
  isPlaying,
  onToggle,
  onNext,
  onPrev,
  onVolumeChange,
  onSelectTrack,
  volume,
  frequencyData,
  currentTime,
  duration,
  onSeek
}) => {
  const currentTrack = tracks[currentIndex];

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-6 h-full font-sans">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-white/20">
          <motion.img 
            src={currentTrack.cover} 
            alt={currentTrack.title}
            className="w-full h-full object-cover"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          {isPlaying && (
             <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <Disc className="w-8 h-8 text-white animate-spin-slow" />
             </div>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-white font-semibold truncate text-lg tracking-tight">
            {currentTrack.title}
          </h3>
          <p className="text-white/50 text-sm truncate font-medium uppercase tracking-wider">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[120px]">
         <Visualizer frequencyData={frequencyData} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-[10px] text-white/40 font-mono uppercase tracking-[0.2em] mb-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden group cursor-pointer">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <motion.div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={onVolumeChange.bind(null, volume === 0 ? 0.7 : 0)}>
          {volume === 0 ? <VolumeX className="w-5 h-5 text-white/60 hover:text-white transition-colors" /> : <Volume2 className="w-5 h-5 text-white/60 hover:text-white transition-colors" />}
        </button>
        
        <div className="flex items-center gap-6">
          <button onClick={onPrev} className="text-white/60 hover:text-white transition-colors">
            <SkipBack className="w-6 h-6 fill-current" />
          </button>
          <button 
            onClick={onToggle}
            className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
          </button>
          <button onClick={onNext} className="text-white/60 hover:text-white transition-colors">
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>

        <button className="text-white/60 hover:text-white transition-colors">
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      <div className="pt-4 border-t border-white/5">
         <div className="flex items-center gap-2 mb-3">
            <Music className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-widest">Digital Playlist</span>
         </div>
         <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
            {tracks.map((track, idx) => (
               <div 
                  key={track.id}
                  onClick={() => onSelectTrack(idx)}
                  className={cn(
                    "group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all",
                    idx === currentIndex ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/5"
                  )}
               >
                  <div className="flex items-center gap-3 overflow-hidden">
                     <span className={cn(
                       "text-[10px] font-mono",
                       idx === currentIndex ? "text-cyan-400" : "text-white/20"
                     )}>
                        {String(idx + 1).padStart(2, '0')}
                     </span>
                     <div className="overflow-hidden">
                        <p className={cn(
                          "text-xs font-semibold truncate",
                          idx === currentIndex ? "text-white" : "text-white/60"
                        )}>{track.title}</p>
                        <p className="text-[10px] text-white/30 truncate uppercase">{track.artist}</p>
                     </div>
                  </div>
                  {idx === currentIndex && isPlaying && (
                    <div className="flex gap-0.5 h-3 items-end">
                       <div className="w-0.5 bg-cyan-400 animate-music-bar-1" />
                       <div className="w-0.5 bg-cyan-400 animate-music-bar-2" />
                       <div className="w-0.5 bg-cyan-400 animate-music-bar-3" />
                    </div>
                  )}
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};
