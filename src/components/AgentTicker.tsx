import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export const AgentTicker: React.FC = () => {
  const agents = useLiveQuery(() => db.agents.toArray()) || [];

  const agentLogs = useMemo(() => {
    if (agents.length === 0) {
      return [
        "SWARM: STANDBY_MODE",
        "KERNEL: IDLE_RESOURCES",
        "VAULT: MONITORING_INTEGRITY"
      ];
    }

    return agents.map(agent => {
      const type = agent.agent_type.toUpperCase();
      const task = agent.current_task || 'IDLE';
      const priority = agent.current_task_details?.priority?.toUpperCase() || 'NORMAL';
      const queueCount = agent.task_queue?.length || 0;
      
      return `${type}_${agent.agent_id.split('-').pop()?.toUpperCase()}: ${task} [P:${priority}] [Q:${queueCount}]`;
    });
  }, [agents]);

  return (
    <div className="h-6 bg-void/80 border-b border-neon-cyan/10 flex items-center overflow-hidden relative z-20">
      <div className="dither-overlay opacity-5" />
      <div className="flex items-center gap-2 px-4 border-r border-neon-cyan/20 bg-neon-cyan/5 h-full relative z-10">
        <div className={`w-1.5 h-1.5 rounded-full ${agents.length > 0 ? 'bg-neon-green' : 'bg-neon-cyan/20'} animate-pulse`} />
        <span className="text-[8px] font-mono text-neon-cyan uppercase tracking-widest chromatic-aberration">Live_Swarm_Feed</span>
      </div>
      
      <div className="flex-1 relative overflow-hidden h-full flex items-center">
        <motion.div 
          animate={{ x: ['0%', '-50%'] }}
          transition={{ 
            duration: Math.max(20, agentLogs.length * 5), 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="flex gap-12 whitespace-nowrap"
        >
          <div className="flex gap-12">
            {agentLogs.map((log, idx) => (
              <span key={idx} className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em] hover:text-neon-cyan transition-colors cursor-default chromatic-aberration">
                {log}
              </span>
            ))}
          </div>
          <div className="flex gap-12">
            {agentLogs.map((log, idx) => (
              <span key={`dup-${idx}`} className="text-[8px] font-mono text-white/30 uppercase tracking-[0.2em] hover:text-neon-cyan transition-colors cursor-default chromatic-aberration">
                {log}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
      
      <div className="px-4 border-l border-neon-cyan/20 bg-void/60 h-full flex items-center">
        <span className="text-[8px] font-mono text-white/20 uppercase tracking-tighter">Active_Agents: {agents.length}</span>
        <div className="flex items-center gap-3 px-4 border-l border-neon-cyan/20">
          <div className="flex items-end gap-0.5 h-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <motion.div
                key={i}
                animate={{ height: agents.length > 0 ? [2, 12, 4, 10, 2] : [2, 4, 2] }}
                transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                className="w-1 bg-neon-cyan/40"
              />
            ))}
          </div>
          <span className="text-[8px] font-mono text-neon-cyan/40 uppercase tracking-widest">Swarm_Link_Active</span>
        </div>
      </div>
    </div>
  );
};
