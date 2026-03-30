import React from 'react';
import { motion } from 'motion/react';

export const WireframeGlobe: React.FC = () => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-5 pointer-events-none select-none">
      <svg viewBox="0 0 100 100" className="w-full h-full text-neon-cyan">
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: 'center' }}
        >
          {/* Latitudes */}
          {Array.from({ length: 10 }).map((_, i) => (
            <ellipse
              key={`lat-${i}`}
              cx="50"
              cy="50"
              rx="48"
              ry={48 * Math.sin((i / 10) * Math.PI)}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.1"
            />
          ))}
          {/* Longitudes */}
          {Array.from({ length: 10 }).map((_, i) => (
            <ellipse
              key={`long-${i}`}
              cx="50"
              cy="50"
              rx={48 * Math.sin((i / 10) * Math.PI)}
              ry="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.1"
            />
          ))}
          {/* Outer Ring */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.2" />
        </motion.g>
      </svg>
    </div>
  );
};
