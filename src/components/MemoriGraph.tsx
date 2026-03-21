import React, { useMemo, useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge,
  Handle,
  Position,
  NodeProps,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MemoriNode } from '../types';
import { db } from '../db';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

const MemoriNodeComponent = ({ data }: NodeProps<MemoriNode>) => {
  const heat = data.heat_score || 0;
  const importance = data.importance || 0.5;
  const glowColor = heat > 0.7 ? 'color-mix(in srgb, var(--theme-pink) 40%, transparent)' : 'color-mix(in srgb, var(--theme-cyan) 20%, transparent)';
  
  return (
    <div 
      className="p-3 rounded-sm border border-neon-blue/30 bg-void/80 backdrop-blur-md min-w-[150px] relative"
      style={{ 
        boxShadow: `0 0 ${10 + importance * 10}px ${glowColor}`,
        borderColor: heat > 0.7 ? 'var(--theme-pink)' : 'var(--theme-cyan)',
        transform: `scale(${0.8 + importance * 0.4})`
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-neon-blue !w-3 !h-3" />
      <div className="text-[8px] font-mono text-neon-blue/60 mb-1 uppercase tracking-tighter flex justify-between">
        <span>{data.memori_uri}</span>
        {data.summary && <span className="text-neon-green">CONSOLIDATED</span>}
      </div>
      <div className="text-xs font-medium text-white line-clamp-2">
        {data.summary || data.l0_abstract || data.content}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-1">
          {data.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-[7px] px-1 border border-neon-purple/40 text-neon-purple">
              #{tag}
            </span>
          ))}
        </div>
        <div className="text-[8px] font-mono text-neon-green">
          IMP: {(importance * 100).toFixed(0)}%
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-neon-pink !w-3 !h-3" />
    </div>
  );
};

const nodeTypes = {
  memori: MemoriNodeComponent,
};

interface MemoriGraphProps {
  nodes: MemoriNode[];
}

export const MemoriGraph: React.FC<MemoriGraphProps> = ({ nodes }) => {
  const [flowNodes, setNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setEdges, onEdgesChange] = useEdgesState([]);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

  useEffect(() => {
    setNodes(nodes.map((n, i) => ({
      id: n.id,
      type: 'memori',
      data: n,
      position: { x: (i % 3) * 300, y: Math.floor(i / 3) * 200 },
    })));

    const edges: Edge[] = [];
    nodes.forEach(node => {
      node.relations?.forEach(rel => {
        edges.push({
          id: `e-${node.id}-${rel.target_id}`,
          source: node.id,
          target: rel.target_id,
          label: rel.type.toUpperCase(),
          labelStyle: { fill: 'var(--theme-cyan)', fontSize: 10, fontWeight: 700, fontStyle: 'italic' },
          animated: rel.type === 'context_for' || rel.type === 'derived_from',
          style: { 
            stroke: rel.type === 'contradicts' ? 'var(--theme-pink)' : 'var(--theme-cyan)', 
            strokeWidth: 1 + rel.weight * 2, 
            opacity: 0.3 + rel.weight * 0.4 
          },
        });
      });
    });

    if (edges.length === 0) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const commonTags = nodes[i].tags?.filter(t => nodes[j].tags?.includes(t));
          if (commonTags && commonTags.length > 0) {
            edges.push({
              id: `e-tag-${nodes[i].id}-${nodes[j].id}`,
              source: nodes[i].id,
              target: nodes[j].id,
              animated: true,
              style: { stroke: 'var(--theme-purple)', strokeWidth: 1, opacity: 0.4 },
            });
          }
        }
      }
    }
    setEdges(edges);
  }, [nodes, setNodes, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    setPendingConnection(params);
  }, []);

  const handleCreateRelation = async (type: 'references' | 'contradicts' | 'supports' | 'derived_from' | 'context_for') => {
    if (!pendingConnection || !pendingConnection.source || !pendingConnection.target) return;
    
    const sourceNode = nodes.find(n => n.id === pendingConnection.source);
    if (sourceNode) {
      const currentRelations = sourceNode.relations || [];
      // Check if relation already exists
      const exists = currentRelations.find(r => r.target_id === pendingConnection.target && r.type === type);
      
      if (!exists) {
        const newRelations = [...currentRelations, {
          target_id: pendingConnection.target,
          type,
          weight: 0.8 // Default weight for manual connections
        }];
        
        await db.vault.update(sourceNode.id, { relations: newRelations });
      }
    }
    setPendingConnection(null);
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
      >
        <Background color="var(--theme-cyan)" gap={40} size={1} />
        <Controls className="!bg-void !border-neon-blue/20 !fill-neon-blue" />
      </ReactFlow>

      <AnimatePresence>
        {pendingConnection && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-void/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-void border border-neon-cyan/40 p-6 rounded-sm shadow-[0_0_30px_color-mix(in_srgb,var(--theme-cyan)_20%,transparent)] max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-neon-cyan font-display font-black uppercase tracking-widest text-lg">Define_Relationship</h3>
                <button onClick={() => setPendingConnection(null)} className="text-white/40 hover:text-neon-pink transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                <p className="text-[10px] font-mono text-white/60 mb-4">Select the semantic relationship between these nodes:</p>
                
                {[
                  { type: 'supports', color: 'neon-green', desc: 'Source provides evidence for target' },
                  { type: 'contradicts', color: 'neon-pink', desc: 'Source opposes or refutes target' },
                  { type: 'references', color: 'neon-blue', desc: 'Source mentions or links to target' },
                  { type: 'derived_from', color: 'neon-purple', desc: 'Source was created based on target' },
                  { type: 'context_for', color: 'neon-cyan', desc: 'Source provides background for target' }
                ].map((rel) => (
                  <button
                    key={rel.type}
                    onClick={() => handleCreateRelation(rel.type as any)}
                    className={`w-full flex flex-col items-start p-3 border border-${rel.color}/20 hover:border-${rel.color} hover:bg-${rel.color}/10 transition-all group`}
                  >
                    <span className={`text-[12px] font-bold text-${rel.color} uppercase tracking-widest`}>{rel.type}</span>
                    <span className="text-[9px] font-mono text-white/40 group-hover:text-white/80 transition-colors">{rel.desc}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
