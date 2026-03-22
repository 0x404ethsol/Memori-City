import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchProbability?: number;
}

export const GlitchText: React.FC<GlitchTextProps> = ({ 
  text, 
  className, 
  glitchProbability = 0.95 
}) => {
  const [glitchedText, setGlitchedText] = useState(text);
  const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > glitchProbability) {
        const newText = text.split('').map((char, i) => {
          if (Math.random() > 0.8) {
            return chars[Math.floor(Math.random() * chars.length)];
          }
          return char;
        }).join('');
        setGlitchedText(newText);
        setTimeout(() => setGlitchedText(text), 100);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [text, glitchProbability]);

  return (
    <span className={cn("font-display font-black tracking-tighter uppercase relative group", className)}>
      <span className="relative z-10">{glitchedText}</span>
      <span className="absolute top-0 left-0 -z-10 text-neon-pink opacity-0 group-hover:opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-75 animate-pulse">
        {glitchedText}
      </span>
      <span className="absolute top-0 left-0 -z-10 text-neon-cyan opacity-0 group-hover:opacity-70 group-hover:-translate-x-0.5 group-hover:translate-y-0.5 transition-all duration-75 animate-pulse">
        {glitchedText}
      </span>
    </span>
  );
};
