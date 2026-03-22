import React from 'react';
import { motion } from 'motion/react';

export const DitherBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* The Main Photo */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 grayscale contrast-150 brightness-50"
        style={{ 
          backgroundImage: `url('https://picsum.photos/seed/cyberpunk-girl/1920/1080?grayscale')`,
          filter: 'contrast(200%) brightness(40%)'
        }}
      />

      {/* Dither Overlay Animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, #00f3ff 1px, transparent 1px)`,
          backgroundSize: '3px 3px',
        }}
      />

      {/* Moving Halftone Pattern */}
      <motion.div 
        animate={{ 
          backgroundPosition: ['0px 0px', '100px 100px'],
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px]" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,black_100%)] opacity-60" />
    </div>
  );
};
