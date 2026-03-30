import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const VaporwaveAnimeOverlay: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isRec, setIsRec] = useState(true);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const recTimer = setInterval(() => setIsRec(prev => !prev), 1000);
    
    const glitchTimer = setInterval(() => {
      if (Math.random() > 0.98) {
        setGlitch(true);
        setTimeout(() => setGlitch(false), 200);
      }
    }, 2000);

    return () => {
      clearInterval(timer);
      clearInterval(recTimer);
      clearInterval(glitchTimer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
  };

  return (
    <div className={cn(
      "fixed inset-0 z-[100] pointer-events-none select-none overflow-hidden transition-all duration-75",
      glitch && "skew-x-2 scale-[1.02] brightness-150 contrast-150 blur-[1px]"
    )}>
      {/* VHS OSD - Top Left */}
      <div className="absolute top-8 left-8 flex flex-col gap-1 font-mono text-white/40 text-[10px] tracking-[0.2em] uppercase">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]", isRec ? "opacity-100" : "opacity-20")} />
          <span className={cn(isRec ? "text-red-500" : "text-white/20")}>REC</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white/60">PLAY</span>
          <span className="text-white/20">▶</span>
        </div>
        <div className="mt-2 text-white/30">
          SP
        </div>
      </div>

      {/* VHS OSD - Bottom Right */}
      <div className="absolute bottom-8 right-8 flex flex-col items-end gap-1 font-mono text-white/40 text-[10px] tracking-[0.2em] uppercase">
        <div className="text-white/60">
          {formatTime(time)}
        </div>
        <div className="text-white/30">
          {formatDate(time)}
        </div>
      </div>

      {/* Anime Style "SYSTEM" Banner - Vertical Left */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col gap-4 opacity-10">
        <div className="writing-vertical-rl text-[40px] font-japanese font-black text-neon-cyan tracking-[0.5em] leading-none">
          システム稼働中
        </div>
        <div className="h-32 w-[1px] bg-neon-cyan/40 mx-auto" />
        <div className="writing-vertical-rl text-[12px] font-mono text-neon-cyan tracking-[1em] uppercase">
          Kernel_Status_Stable
        </div>
      </div>

      {/* Anime Style "WARNING" Banner - Vertical Right */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-4 opacity-10">
        <div className="writing-vertical-rl text-[12px] font-mono text-neon-pink tracking-[1em] uppercase">
          Neural_Link_Active
        </div>
        <div className="h-32 w-[1px] bg-neon-pink/40 mx-auto" />
        <div className="writing-vertical-rl text-[40px] font-japanese font-black text-neon-pink tracking-[0.5em] leading-none">
          警告_監視中
        </div>
      </div>

      {/* Wireframe Decorative Elements - Corners */}
      <svg className="absolute top-0 left-0 w-32 h-32 opacity-10 text-neon-cyan" viewBox="0 0 100 100">
        <path d="M0 0 L100 0 L100 2 L2 2 L2 100 L0 100 Z" fill="currentColor" />
        <path d="M10 10 L40 10 L40 11 L11 11 L11 40 L10 40 Z" fill="currentColor" />
        <circle cx="5" cy="5" r="1" fill="currentColor" />
      </svg>

      <svg className="absolute bottom-0 right-0 w-32 h-32 opacity-10 text-neon-pink rotate-180" viewBox="0 0 100 100">
        <path d="M0 0 L100 0 L100 2 L2 2 L2 100 L0 100 Z" fill="currentColor" />
        <path d="M10 10 L40 10 L40 11 L11 11 L11 40 L10 40 Z" fill="currentColor" />
        <circle cx="5" cy="5" r="1" fill="currentColor" />
      </svg>

      {/* Subtle Chromatic Aberration Overlay */}
      <div className="absolute inset-0 z-[-1] opacity-20 pointer-events-none mix-blend-screen">
        <div className="absolute inset-0 bg-[rgba(255,0,0,0.05)] translate-x-[1px]" />
        <div className="absolute inset-0 bg-[rgba(0,255,0,0.05)] -translate-x-[1px]" />
        <div className="absolute inset-0 bg-[rgba(0,0,255,0.05)] translate-y-[1px]" />
      </div>

      {/* Scrolling "System" Tape - Bottom */}
      <div className="absolute bottom-0 left-0 w-full h-4 bg-void/80 border-t border-white/10 overflow-hidden flex items-center opacity-30">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-20 whitespace-nowrap text-[8px] font-mono text-white/40 uppercase tracking-[0.5em]"
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span key={i}>
              System_Integrity_Verified // 整合性確認済み // District_7_Online // 第7地区オンライン // Memory_Link_Stable // メモリリンク安定
            </span>
          ))}
        </motion.div>
      </div>

      {/* VHS Tracking Line */}
      <motion.div 
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-px bg-white/5 shadow-[0_0_10px_rgba(255,255,255,0.2)] z-[101]"
      />
    </div>
  );
};
