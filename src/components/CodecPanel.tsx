import React from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CodecPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  status?: 'active' | 'idle' | 'warning';
}

export const CodecPanel: React.FC<CodecPanelProps> = ({ children, className, title, status }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("codec-panel p-3 flex flex-col gap-2 relative group overflow-hidden", className)}
    >
      {/* Scanline effect */}
      <div className="scan-line" />
      
      {/* Background patterns */}
      <div className="absolute top-0 right-0 p-1 opacity-10 pointer-events-none select-none">
        <span className="text-[8px] font-japanese">システムステータス</span>
      </div>

      {title && (
        <div className="flex items-center justify-between border-b border-neon-cyan/30 pb-1.5 mb-0.5 relative z-10">
          <div className="flex flex-col">
            <span className="text-[9px] font-display font-black uppercase tracking-[0.15em] text-neon-cyan/90">
              {title}
            </span>
            <span className="text-[6px] font-mono text-neon-cyan/40 mt-0.5">
              SECURE_CHANNEL_V4.20
            </span>
          </div>
          {status && (
            <div className="flex items-center gap-1.5 bg-void/40 px-1.5 py-0.5 border border-neon-cyan/10">
              <div className={cn(
                "w-1 h-1 rounded-full flicker-anim",
                status === 'active' ? "bg-neon-green shadow-[0_0_12px_var(--theme-green)]" : 
                status === 'warning' ? "bg-neon-pink shadow-[0_0_12px_var(--theme-pink)]" : "bg-gray-700"
              )} />
              <span className="text-[8px] font-mono uppercase tracking-widest text-white/60">{status}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex-1 overflow-auto custom-scrollbar relative z-10">
        {children}
      </div>
      
      {/* Decorative corners and edges */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-neon-cyan/60" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-neon-cyan/60" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-neon-cyan/60" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-neon-cyan/60" />
      
      {/* Micro-details */}
      <div className="absolute bottom-1 right-10 opacity-20 pointer-events-none">
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-1 h-1 bg-neon-cyan" />
          ))}
        </div>
      </div>
      
      {/* Warning stripes on hover */}
      <div className="absolute bottom-0 left-0 w-full h-1 warning-stripes opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};
