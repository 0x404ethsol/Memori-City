import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { MemoriNode } from '../types';
import { motion } from 'motion/react';
import { Globe, Users, Share2, Brain } from 'lucide-react';
import { CodecPanel } from './CodecPanel';

export const KnowledgeCommons: React.FC = () => {
  const nodes = useLiveQuery(async () => {
    try {
      // Use filter for robustness if index is missing or type is mixed
      return await db.vault
        .filter(node => node.is_public === true || (node.is_public as any) === 1)
        .toArray();
    } catch (err) {
      console.error('Failed to fetch public nodes:', err);
      return [];
    }
  }) || [];

  return (
    <div className="w-full h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b border-neon-green/20 pb-4">
        <div>
          <h2 className="text-2xl font-display font-black text-neon-green tracking-tighter uppercase">Knowledge_Commons</h2>
          <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Shared_Intelligence_Pool_v1.0</p>
        </div>
        <div className="flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-neon-green">{nodes.length}</span>
            <span className="text-[7px] font-mono text-white/40 uppercase">Shared_Kernels</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-neon-green/20 flex items-center justify-center bg-neon-green/5">
            <Globe size={20} className="text-neon-green animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.length > 0 ? (
          nodes.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative"
            >
              <CodecPanel title={node.memori_uri} className="h-full">
                <div className="flex flex-col h-full gap-3">
                  <div className="text-[11px] text-white/80 line-clamp-4 font-mono leading-relaxed italic">
                    "{node.summary || node.l0_abstract || node.content}"
                  </div>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                    <div className="flex gap-1">
                      {node.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[8px] px-1.5 py-0.5 border border-neon-purple/40 text-neon-purple font-mono">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        {[1, 2].map(j => (
                          <div key={j} className="w-4 h-4 rounded-full border border-neon-green/40 bg-void flex items-center justify-center">
                            <Users size={8} className="text-neon-green" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[8px] font-mono text-white/40 uppercase">2_Agents_Learning</span>
                    </div>
                  </div>
                </div>
              </CodecPanel>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-center opacity-20 border border-dashed border-white/10">
            <Share2 size={48} className="mb-4" />
            <h3 className="text-sm font-mono uppercase">Commons_Empty</h3>
            <p className="text-[10px] font-mono mt-2">Publish nodes from your Private Vault to share knowledge with the swarm.</p>
          </div>
        )}
      </div>

      <div className="mt-auto p-4 border border-neon-cyan/20 bg-neon-cyan/5 rounded-sm">
        <div className="flex items-center gap-3 mb-2">
          <Brain size={16} className="text-neon-cyan" />
          <span className="text-[10px] font-display font-black text-neon-cyan uppercase tracking-widest">Federated_Learning_Status</span>
        </div>
        <div className="text-[9px] font-mono text-white/60 leading-relaxed">
          Agents are currently distilling shared kernels into global skillsets. 
          Cross-pollination efficiency: <span className="text-neon-green">89.4%</span>. 
          New insights detected in the last 24h: <span className="text-neon-cyan">12</span>.
        </div>
      </div>
    </div>
  );
};
