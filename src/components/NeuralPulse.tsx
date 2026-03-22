import React from 'react';
import { motion } from 'motion/react';

export const NeuralPulse: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      {/* Pulsing Dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0, 0.5, 0],
            scale: [0, 1.5, 0],
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
          className="absolute w-1 h-1 bg-neon-cyan rounded-full shadow-[0_0_10px_var(--theme-cyan)]"
        />
      ))}

      {/* Scanning Line */}
      <motion.div
        animate={{ y: ['-100%', '200%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent"
      />
    </div>
  );
};
