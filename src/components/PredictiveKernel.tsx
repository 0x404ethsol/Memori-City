import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Cpu, Zap, Search, Brain, Network } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { LLMService } from '../services/llmService';

interface PredictiveKernelProps {
  isThinking: boolean;
  contextQuery?: string;
}

export function PredictiveKernel({ isThinking, contextQuery }: PredictiveKernelProps) {
  const { settings } = useSettings();
  const [activeThreads, setActiveThreads] = useState<number>(0);
  const [prefetchedNodes, setPrefetchedNodes] = useState<string[]>([]);

  useEffect(() => {
    if (isThinking) {
      const interval = setInterval(() => {
        setActiveThreads(Math.floor(Math.random() * 12) + 4);
      }, 500);
      
      // Real sub-swarm pre-fetching using LLM
      if (contextQuery && contextQuery.length > 10 && settings) {
        const fetchPredictions = async () => {
          try {
            const llm = new LLMService(settings.llm);
            const systemPrompt = "You are a predictive memory kernel. Based on the user's input, suggest 4 short, technical-sounding memory node identifiers (e.g., DISTRICT_ALPHA, PROTOCOL_77, VAULT_CORE). Return ONLY the identifiers separated by commas.";
            const userPrompt = `Input: ${contextQuery}`;
            
            const response = await llm.generateText(userPrompt, systemPrompt);
            const nodes = response.split(',').map(n => n.trim().toUpperCase()).filter(n => n.length > 0);
            if (nodes.length > 0) {
              setPrefetchedNodes(nodes.slice(0, 4));
            }
          } catch (err) {
            console.warn('Predictive pre-fetch failed:', err);
          }
        };
        fetchPredictions();
      }

      return () => clearInterval(interval);
    } else {
      setActiveThreads(0);
      const timeout = setTimeout(() => setPrefetchedNodes([]), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isThinking, contextQuery, settings]);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-1.5">
          <Activity className={cn("text-neon-green", isThinking && "animate-pulse")} size={10} />
          <span className="text-[8px] font-mono text-neon-green uppercase tracking-widest">Sub-Swarm Activity</span>
        </div>
        <div className="text-[7px] font-mono text-gray-500 uppercase">
          {activeThreads} THREADS
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 h-0.5">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: isThinking && i < activeThreads ? [0.2, 1, 0.2] : 0.1,
              backgroundColor: isThinking && i < activeThreads ? 'var(--theme-green)' : 'var(--theme-void)'
            }}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
            className="h-full rounded-full"
          />
        ))}
      </div>

      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1 space-y-1"
          >
            <div className="flex items-center gap-1.5 text-[7px] font-mono text-neon-blue uppercase">
              <Search size={8} />
              <span>Predictive Pre-fetch:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {prefetchedNodes.map((node, i) => (
                <motion.span
                  key={node + i}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-1 py-0.5 bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-[6px] font-mono rounded-sm"
                >
                  {node}
                </motion.span>
              ))}
              {prefetchedNodes.length === 0 && (
                <span className="text-[6px] font-mono text-gray-600 italic">WARMING_CONTEXT...</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-1 p-1.5 bg-void border border-neon-blue/10 rounded-sm flex items-center gap-2">
        <div className={cn(
          "p-1 rounded-full",
          isThinking ? "bg-neon-green/20 text-neon-green" : "bg-gray-800 text-gray-600"
        )}>
          <Brain size={10} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-mono text-gray-400 uppercase">Alignment</span>
            <span className="text-[7px] font-mono text-neon-blue">98.4%</span>
          </div>
          <div className="w-full h-0.5 bg-gray-800 mt-0.5 overflow-hidden">
            <motion.div 
              animate={{ width: isThinking ? '98.4%' : '0%' }}
              className="h-full bg-neon-blue shadow-[0_0_8px_var(--theme-cyan)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
