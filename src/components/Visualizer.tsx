import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface VisualizerProps {
  frequencyData: Uint8Array;
  color?: string;
}

export const Visualizer: React.FC<VisualizerProps> = ({ 
  frequencyData, 
  color = '#00f2ff' 
}) => {
  const bars = useMemo(() => {
    if (!frequencyData.length) return Array(32).fill(1);
    // Downsample to 32 bars
    const samples = 32;
    const step = Math.floor(frequencyData.length / samples);
    return Array.from({ length: samples }).map((_, i) => {
      const start = i * step;
      const end = start + step;
      const slice = frequencyData.slice(start, end);
      let sum = 0;
      for (let j = 0; j < slice.length; j++) sum += slice[j];
      const avg = sum / (step || 1);
      return avg || 1;
    });
  }, [frequencyData]);

  return (
    <div className="flex items-end justify-center gap-1 h-32 w-full px-4 overflow-hidden">
      {bars.map((val, i) => (
        <motion.div
          key={i}
          animate={{ height: `${(val / 255) * 100}%` }}
          transition={{ type: 'spring', damping: 15, stiffness: 100 }}
          style={{ backgroundColor: color }}
          className="w-full min-w-[2px] max-w-[8px] rounded-t-sm shadow-[0_0_10px_rgba(0,242,255,0.5)]"
        />
      ))}
    </div>
  );
};

export const WaveformVisualizer: React.FC<VisualizerProps> = ({ 
  frequencyData, 
  color = '#ff00d4' 
}) => {
  const points = useMemo(() => {
    if (!frequencyData.length) return "";
    const samples = 64;
    const step = Math.floor(frequencyData.length / samples);
    const path = Array.from({ length: samples }).map((_, i) => {
      const slice = frequencyData.slice(i * step, i * step + step);
      let sum = 0;
      for (let j = 0; j < slice.length; j++) sum += slice[j];
      const avg = sum / (step || 1);
      const x = (i / (samples - 1)) * 100;
      const y = 50 - (avg / 255) * 40;
      return `${x},${y}`;
    }).join(' L ');
    
    const pathMirror = Array.from({ length: samples }).reverse().map((_, i) => {
        const revIdx = samples - 1 - i;
        const slice = frequencyData.slice(revIdx * step, revIdx * step + step);
        let sum = 0;
        for (let j = 0; j < slice.length; j++) sum += slice[j];
        const avg = sum / (step || 1);
        const x = (revIdx / (samples - 1)) * 100;
        const y = 50 + (avg / 255) * 40;
        return `${x},${y}`;
      }).join(' L ');

    return `M 0,50 L ${path} L 100,50 L ${pathMirror} Z`;
  }, [frequencyData]);

  return (
    <div className="w-full h-24 relative overflow-hidden">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full opacity-40">
        <motion.path
          d={points}
          fill={color}
          initial={false}
          animate={{ d: points }}
          className="drop-shadow-[0_0_8px_rgba(255,0,212,0.6)]"
        />
      </svg>
    </div>
  );
};
