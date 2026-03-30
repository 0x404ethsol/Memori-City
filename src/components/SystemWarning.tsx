import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SystemWarningProps {
  isOpen: boolean;
  message?: string;
}

export const SystemWarning: React.FC<SystemWarningProps> = ({ isOpen, message = "SYSTEM_CRITICAL_ERROR" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none select-none"
        >
          <div className="absolute inset-0 bg-red-600/10 backdrop-blur-[2px]" />
          
          {/* Scrolling Warning Tape - Top */}
          <div className="absolute top-0 left-0 w-full h-12 bg-red-600 flex items-center overflow-hidden border-y-4 border-black">
            <motion.div 
              animate={{ x: [0, -1000] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="flex gap-10 whitespace-nowrap text-2xl font-display font-black text-black uppercase italic"
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i}>WARNING // 警告 // SYSTEM_BREACH // 警告 // CAUTION // 警告</span>
              ))}
            </motion.div>
          </div>

          {/* Scrolling Warning Tape - Bottom */}
          <div className="absolute bottom-0 left-0 w-full h-12 bg-red-600 flex items-center overflow-hidden border-y-4 border-black">
            <motion.div 
              animate={{ x: [-1000, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="flex gap-10 whitespace-nowrap text-2xl font-display font-black text-black uppercase italic"
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <span key={i}>WARNING // 警告 // SYSTEM_BREACH // 警告 // CAUTION // 警告</span>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="relative bg-black border-4 border-red-600 p-8 flex flex-col items-center gap-4 shadow-[0_0_50px_rgba(220,38,38,0.5)] chromatic-aberration"
          >
            <div className="text-6xl font-display font-black text-red-600 italic tracking-tighter">
              {message}
            </div>
            <div className="text-xl font-mono text-red-600/60 uppercase tracking-[0.5em] animate-pulse">
              Unauthorized_Access_Detected
            </div>
            <div className="flex gap-2 mt-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-4 h-4 bg-red-600 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
