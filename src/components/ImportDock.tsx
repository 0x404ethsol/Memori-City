import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface ImportDockProps {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
  color?: string;
}

export const ImportDock: React.FC<ImportDockProps> = ({ icon: Icon, label, description, onClick, color = 'var(--theme-cyan)' }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="import-dock group relative battle-border cursor-pointer overflow-hidden"
      style={{ borderColor: `color-mix(in srgb, ${color} 40%, transparent)` }}
    >
      {/* Decorative background text */}
      <div className="absolute -top-1 -right-1 opacity-10 pointer-events-none select-none rotate-12">
        <span className="text-[12px] font-sans font-bold">データ</span>
      </div>
      
      {/* Warning stripes corner */}
      <div className="absolute top-0 left-0 w-8 h-8 warning-stripes opacity-10" />

      <div className="relative z-10 flex flex-col items-center gap-2 py-1">
        <div className="p-3 bg-void border border-white/10 group-hover:border-neon-cyan/60 transition-all relative battle-border shadow-inner">
          <Icon size={24} style={{ color }} className="group-hover:scale-110 transition-transform duration-500" />
          {/* Micro-glow */}
          <div className="absolute -inset-1 bg-neon-cyan/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        <div className="text-center px-1">
          <div className="text-[10px] font-display font-black uppercase tracking-[0.2em] group-hover:text-white transition-colors hud-label truncate w-full" style={{ color }}>
            {label}
          </div>
          <div className="text-[8px] font-mono text-white/40 uppercase mt-1 tracking-[0.1em] line-clamp-2 leading-tight">
            {description}
          </div>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-void border-t border-neon-cyan/10 flex items-center px-1 gap-1">
        <div className="w-1 h-1 bg-neon-cyan/40" />
        <div className="w-1 h-1 bg-neon-cyan/40" />
        <div className="flex-1 h-[1px] bg-neon-cyan/10" />
        <span className="text-[6px] font-mono text-neon-cyan/20">V.4.20</span>
      </div>
    </motion.div>
  );
};
