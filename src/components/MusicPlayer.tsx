import React, { useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { Music, Volume2, VolumeX, Play, Pause, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [player, setPlayer] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    event.target.setVolume(volume);
    setIsReady(true);
    // Autoplay attempt
    event.target.playVideo();
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1 is playing
    if (event.data === 1) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
    }
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!player) return;
    if (isMuted) {
      player.unMute();
      player.setVolume(volume);
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      loop: 1,
      playlist: '7OqQpKss6Mk', // Required for loop
    },
  };

  return (
    <div className="fixed bottom-24 right-4 md:bottom-12 md:right-6 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-64 bg-void/90 border border-neon-cyan/30 backdrop-blur-xl p-4 shadow-[0_0_30px_rgba(0,255,255,0.1)] relative overflow-hidden"
          >
            {/* Dither Overlay */}
            <div className="dither-overlay opacity-5" />
            
            {/* Scanline */}
            <div className="scan-line opacity-10" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_10px_var(--theme-cyan)]",
                    isPlaying && "animate-pulse"
                  )} />
                  <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-widest font-bold">Audio_Stream_Active</span>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <Minimize2 size={14} />
                </button>
              </div>

              <div className="mb-4">
                <div className="text-[11px] font-display font-black text-white uppercase tracking-tighter mb-1 truncate">
                  Memori_City_Ambience
                </div>
                <div className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                  Source: Protocol_7OqQpKss6Mk
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center text-neon-cyan hover:bg-neon-cyan hover:text-void transition-all group"
                >
                  {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
                </button>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <button onClick={toggleMute} className="text-white/40 hover:text-neon-cyan transition-colors">
                      {isMuted || volume === 0 ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                    <span className="text-[9px] font-mono text-white/40">{volume}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={volume} 
                    onChange={handleVolumeChange}
                    className="w-full h-1 bg-white/10 appearance-none cursor-pointer accent-neon-cyan rounded-full"
                  />
                </div>
              </div>

              <div className="h-px bg-neon-cyan/10 w-full mb-3" />
              
              <div className="flex justify-center">
                <div className="flex gap-1">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        height: isPlaying ? [4, 12, 6, 10, 4] : 4
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        delay: i * 0.1
                      }}
                      className="w-1 bg-neon-cyan/40 rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center transition-all relative group",
          isExpanded 
            ? "bg-neon-cyan text-void shadow-[0_0_20px_var(--theme-cyan)]" 
            : isPlaying
              ? "bg-void/80 border border-neon-cyan/30 text-neon-cyan hover:border-neon-cyan hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]"
              : "bg-void/80 border border-neon-pink/30 text-neon-pink hover:border-neon-pink hover:shadow-[0_0_15px_rgba(255,0,255,0.2)]"
        )}
      >
        {isPlaying ? (
          <div className="flex gap-0.5 items-center">
            <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-0.5 bg-current rounded-full" />
            <motion.div animate={{ height: [6, 12, 6] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-0.5 bg-current rounded-full" />
            <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-0.5 bg-current rounded-full" />
          </div>
        ) : (
          <div className="relative">
            <Music size={20} />
            {isReady && <Play size={8} className="absolute -bottom-1 -right-1 fill-current" />}
          </div>
        )}
        
        {!isExpanded && (
          <div className="absolute right-full mr-3 px-2 py-1 bg-void border border-neon-cyan/30 text-[8px] font-mono text-neon-cyan uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {isPlaying ? 'Audio_Active' : isReady ? 'Audio_Paused' : 'Audio_Loading...'}
          </div>
        )}
      </button>

      <div className="absolute w-0 h-0 overflow-hidden pointer-events-none opacity-0">
        <YouTube videoId="7OqQpKss6Mk" opts={opts} onReady={onPlayerReady} onStateChange={onPlayerStateChange} />
      </div>
    </div>
  );
};
