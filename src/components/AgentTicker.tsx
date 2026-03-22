import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

const AGENT_LOGS = [
  "SWARM_LINK: SYNCING_NODE_0x42",
  "KERNEL: OPTIMIZING_GRAPH_WEIGHTS",
  "VAULT: ENCRYPTING_RECALL_BUFFER",
  "HERMES: SCANNING_EXTERNAL_STREAMS",
  "CORE: STABILIZING_NEURAL_FABRIC",
  "AGENT_01: MAPPING_SEMANTIC_CLUSTERS",
  "SYSTEM: REFRESHING_DISTRICT_MANAGER",
  "KERNEL: ALLOCATING_COGNITIVE_RESOURCES",
  "SWARM: BROADCASTING_PULSE_SIGNAL",
  "VAULT: PRUNING_REDUNDANT_NODES"
];

export const AgentTicker: React.FC = () => {
  const nodes = useLiveQuery(() => db.vault.toArray()) || [];
  
  return (
    <div className="h-6 bg-void/80 border-b border-neon-cyan/10 flex items-center relative z-20">
      <div className="flex items-center gap-2 px-4 border-r border-neon-cyan/20 bg-neon-cyan/5 h-full">
        <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
        <span className="text-[8px] font-mono text-neon-cyan uppercase tracking-widest">System_Status</span>
      </div>
      
      <div className="flex-1 flex items-center px-4 gap-8 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-mono text-white/20 uppercase">Nodes:</span>
          <span className="text-[8px] font-mono text-white/60">{nodes.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-mono text-white/20 uppercase">Memory_Load:</span>
          <span className="text-[8px] font-mono text-white/60">{Math.min(100, nodes.length * 0.5).toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-mono text-white/20 uppercase">Swarm_Sync:</span>
          <span className="text-[8px] font-mono text-neon-green/60">ACTIVE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-mono text-white/20 uppercase">Kernel_Mode:</span>
          <span className="text-[8px] font-mono text-neon-cyan/60">SOVEREIGN</span>
        </div>
      </div>
      
      <div className="px-4 border-l border-neon-cyan/20 bg-void/60 h-full flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-mono text-white/20 uppercase">Latency:</span>
          <span className="text-[8px] font-mono text-white/60">12ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-mono text-white/20 uppercase">Uptime:</span>
          <span className="text-[8px] font-mono text-white/60">99.9%</span>
        </div>
      </div>
    </div>
  );
};
