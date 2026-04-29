import React, { useState, useEffect, TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Shield, Zap, Music, Terminal, Radio, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Pause as PauseIcon } from 'lucide-react';
import { Direction } from './types';
import { useSnakeGame } from './hooks/useSnakeGame';
import { useAudioVisualizer } from './hooks/useAudioVisualizer';
import { GameBoard } from './components/GameBoard';
import { HUD } from './components/HUD';
import { MusicPlayer } from './components/MusicPlayer';
import { SettingsPanel } from './components/SettingsPanel';
import { MOCK_TRACKS } from './constants';
import { cn } from './lib/utils';

export default function App() {
  const {
    status, setStatus, mode, setMode, 
    snake, foods, stats, initGame, handleDirectionChange,
    settings, setSettings
  } = useSnakeGame();

  const {
    isPlaying, currentTrackIndex, setCurrentTrackIndex,
    volume, setVolume, duration, currentTime,
    frequencyData, togglePlay, seek, play
  } = useAudioVisualizer();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  // Swipe detection
  const onTouchStart = (e: TouchEvent) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const onTouchEnd = (e: TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStart.x;
    const deltaY = e.changedTouches[0].clientY - touchStart.y;
    const minSwipeDistance = 30;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        handleDirectionChange(deltaX > 0 ? Direction.RIGHT : Direction.LEFT);
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        handleDirectionChange(deltaY > 0 ? Direction.DOWN : Direction.UP);
      }
    }
  };

  // Auto-play next track
  useEffect(() => {
    if (currentTime >= duration && duration > 0) {
      const nextIndex = (currentTrackIndex + 1) % MOCK_TRACKS.length;
      setCurrentTrackIndex(nextIndex);
      play(MOCK_TRACKS[nextIndex].url);
    }
  }, [currentTime, duration, currentTrackIndex, play, setCurrentTrackIndex]);

  // Sync music with game status
  useEffect(() => {
    if (status === 'PLAYING' && !isPlaying) {
      // Small delay to ensure browser interaction context is fresh if needed
      play(MOCK_TRACKS[currentTrackIndex].url);
    } else if (status === 'PAUSED' && isPlaying) {
      togglePlay(MOCK_TRACKS[currentTrackIndex].url);
    }
  }, [status, isPlaying, play, togglePlay, currentTrackIndex]);

  return (
    <div 
      className="h-screen w-full flex flex-col bg-[#050506] relative overflow-hidden text-white selection:bg-cyan-500/30"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Dynamic Background Noise/Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.1),transparent_70%)]" />
      </div>

      {/* Top Header/Bar */}
      <header className="h-16 z-10 flex items-center justify-between px-8 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded bg-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:scale-110 transition-transform">
               <Radio className="w-5 h-5 text-black animate-pulse" />
            </div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase">Neon Snake <span className="text-white/20">Radio</span></h1>
          </div>
          <div className="h-6 w-[1px] bg-white/10 mx-2" />
          <div className="hidden md:flex items-center gap-6">
             <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] hover:text-white/80 transition-colors cursor-pointer">
                <Terminal className="w-3 h-3" />
                Console
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] hover:text-white/80 transition-colors cursor-pointer">
                <Shield className="w-3 h-3" />
                Security
             </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-4">
             <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest leading-none">Net Status</span>
             <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Stable :: 124ms</span>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white/60 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 z-10 p-4 md:p-8 grid grid-cols-1 md:grid-cols-[380px_1fr_380px] gap-6 max-w-[1920px] mx-auto w-full overflow-hidden">
        
        {/* Left Side: Music Player */}
        <aside className="hidden lg:block h-full overflow-hidden">
          <MusicPlayer 
            tracks={MOCK_TRACKS}
            currentIndex={currentTrackIndex}
            isPlaying={isPlaying}
            onToggle={() => togglePlay(MOCK_TRACKS[currentTrackIndex].url)}
            onNext={() => {
              const next = (currentTrackIndex + 1) % MOCK_TRACKS.length;
              setCurrentTrackIndex(next);
              play(MOCK_TRACKS[next].url);
            }}
            onPrev={() => {
              const prev = (currentTrackIndex - 1 + MOCK_TRACKS.length) % MOCK_TRACKS.length;
              setCurrentTrackIndex(prev);
              play(MOCK_TRACKS[prev].url);
            }}
            onVolumeChange={setVolume}
            onSelectTrack={(idx) => {
              setCurrentTrackIndex(idx);
              play(MOCK_TRACKS[idx].url);
            }}
            volume={volume}
            frequencyData={frequencyData}
            currentTime={currentTime}
            duration={duration}
            onSeek={seek}
          />
        </aside>

        {/* Center: Game Board */}
        <section className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 flex flex-col justify-center gap-6">
             {/* Center Header (Score Display for Mobile) */}
             <div className="flex justify-between items-center lg:hidden">
                <div>
                   <h2 className="text-sm font-black text-white/40 uppercase tracking-widest">Active Core</h2>
                   <div className="text-3xl font-black italic text-white tracking-tighter tabular-nums">{stats.score}</div>
                </div>
                <div className="flex gap-2">
                   <div className="px-3 py-1 bg-white/5 border border-white/10 rounded flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-lg font-black text-cyan-400 italic">x{stats.combo}</span>
                   </div>
                </div>
             </div>

             <GameBoard 
               snake={snake}
               foods={foods}
               status={status}
               onStart={initGame}
               onRestart={initGame}
               score={stats.score}
               frequencyData={frequencyData}
               settings={settings}
             />

             {/* Mobile Controls */}
             <div className="flex lg:hidden justify-center gap-4 py-4">
                <ControlGrid 
                  onDirChange={handleDirectionChange} 
                  onTogglePause={() => setStatus(prev => prev === 'PLAYING' ? 'PAUSED' : prev === 'PAUSED' ? 'PLAYING' : prev)}
                />
             </div>
          </div>
        </section>

        {/* Right Side: HUD */}
        <aside className="hidden md:block h-full overflow-hidden">
          <HUD stats={stats} mode={mode} combo={stats.combo} />
        </aside>
      </main>

      {/* Footer / Status Rail */}
      <footer className="h-8 z-10 px-8 border-t border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.2em] text-white/30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
            System Secure
          </div>
          <div>Encryption: AES-256-GCM</div>
          <div>Location: Tokyo / Grid 82</div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex gap-1">
             {MOCK_TRACKS.map((_, i) => (
                <div key={i} className={cn("w-1 h-1 rounded-full", i === currentTrackIndex ? "bg-cyan-500 scale-125" : "bg-white/10")} />
             ))}
           </div>
           <div>© 2026 Neon Logic Research</div>
        </div>
      </footer>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsPanel 
            isOpen={isSettingsOpen} 
            onClose={() => setIsSettingsOpen(false)} 
            mode={mode}
            onModeChange={setMode}
            settings={settings}
            onSettingsChange={setSettings}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const ControlGrid = ({ 
  onDirChange, 
  onTogglePause 
}: { 
  onDirChange: (d: Direction) => void, 
  onTogglePause: () => void 
}) => (
   <div className="flex items-center gap-6 px-8 py-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl">
      <div className="grid grid-cols-3 gap-2">
         <div />
         <button 
           onClick={() => onDirChange(Direction.UP)}
           className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 active:bg-cyan-500/20 transition-all"
         >
           <ChevronUp className="w-6 h-6 text-white/60" />
         </button>
         <div />
         
         <button 
           onClick={() => onDirChange(Direction.LEFT)}
           className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 active:bg-cyan-500/20 transition-all"
         >
           <ChevronLeft className="w-6 h-6 text-white/60" />
         </button>
         <button 
           onClick={() => onDirChange(Direction.DOWN)}
           className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 active:bg-cyan-500/20 transition-all"
         >
           <ChevronDown className="w-6 h-6 text-white/60" />
         </button>
         <button 
           onClick={() => onDirChange(Direction.RIGHT)}
           className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 active:scale-90 active:bg-cyan-500/20 transition-all"
         >
           <ChevronRight className="w-6 h-6 text-white/60" />
         </button>
      </div>
      
      <div className="h-12 w-[1px] bg-white/10" />
      
      <button 
        onClick={onTogglePause}
        className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-90 transition-all text-black"
      >
        <PauseIcon className="w-8 h-8 fill-current" />
      </button>
   </div>
);
