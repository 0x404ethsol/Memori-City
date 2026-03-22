import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { AgentRecord, Skill } from '../types';
import { 
  X, 
  Zap, 
  Plus, 
  Trash2, 
  Search, 
  Cpu, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  Workflow,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SkillManagerModalProps {
  agent: AgentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SkillManagerModal: React.FC<SkillManagerModalProps> = ({ agent, isOpen, onClose }) => {
  const allSkills = useLiveQuery(() => db.skills.toArray()) || [];
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !agent) return null;

  const equippedSkills = allSkills.filter(s => agent.equipped_skills?.includes(s.id));
  const availableSkills = allSkills.filter(s => 
    !agent.equipped_skills?.includes(s.id) && 
    (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleSkill = async (skillId: string) => {
    const currentSkills = agent.equipped_skills || [];
    const isEquipped = currentSkills.includes(skillId);
    
    const nextSkills = isEquipped
      ? currentSkills.filter(id => id !== skillId)
      : [...currentSkills, skillId];
    
    await db.agents.update(agent.id, { equipped_skills: nextSkills });
  };

  const moveSkill = async (index: number, direction: 'up' | 'down') => {
    const currentSkills = [...(agent.equipped_skills || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= currentSkills.length) return;
    
    [currentSkills[index], currentSkills[targetIndex]] = [currentSkills[targetIndex], currentSkills[index]];
    
    await db.agents.update(agent.id, { equipped_skills: currentSkills });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-void/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="max-w-4xl w-full h-[80vh] border border-neon-cyan/30 bg-void/90 flex flex-col battle-border overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-neon-cyan/10 flex items-center justify-center text-neon-cyan border border-neon-cyan/20">
              <Cpu size={24} />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
                Agent_Skill_Interface
                <span className="text-[10px] font-mono text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded border border-neon-cyan/20">
                  {agent.agent_type}
                </span>
              </h2>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                Managing capabilities for {agent.agent_id} // スキル管理
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Left: Equipped Skills */}
          <div className="w-1/2 border-r border-white/10 flex flex-col bg-void/40">
            <div className="p-4 border-b border-white/5 bg-white/[0.01] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-neon-green" />
                <span className="text-[10px] font-mono text-white uppercase tracking-widest font-bold">Equipped_Skills</span>
              </div>
              <span className="text-[10px] font-mono text-white/20">{equippedSkills.length} ACTIVE</span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {equippedSkills.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 p-8">
                  <Zap size={32} className="mb-4" />
                  <p className="text-[10px] font-mono uppercase tracking-widest">No skills equipped</p>
                  <p className="text-[8px] font-mono mt-2 italic">Select skills from the armory to enhance agent performance</p>
                </div>
              ) : (
                agent.equipped_skills?.map((skillId, index) => {
                  const skill = allSkills.find(s => s.id === skillId);
                  if (!skill) return null;
                  
                  return (
                    <div key={skill.id} className="p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg group hover:border-neon-cyan/40 transition-all relative">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono font-bold text-white uppercase tracking-tight">{skill.name}</span>
                          <span className="text-[8px] font-mono text-neon-cyan uppercase tracking-widest">{skill.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              disabled={index === 0}
                              onClick={() => moveSkill(index, 'up')}
                              className="p-1 text-white/20 hover:text-neon-cyan disabled:opacity-0"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button 
                              disabled={index === (agent.equipped_skills?.length || 0) - 1}
                              onClick={() => moveSkill(index, 'down')}
                              className="p-1 text-white/20 hover:text-neon-cyan disabled:opacity-0"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>
                          <button 
                            onClick={() => toggleSkill(skill.id)}
                            className="text-white/20 hover:text-neon-pink transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] font-mono text-white/60 leading-relaxed italic">
                        {skill.description}
                      </p>
                      {skill.dependencies && skill.dependencies.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {skill.dependencies.map(depId => (
                            <span key={depId} className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-[7px] font-mono text-white/40 rounded uppercase">
                              REQ: {allSkills.find(s => s.id === depId)?.name || 'UNKNOWN'}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Skill Armory (Available Skills) */}
          <div className="w-1/2 flex flex-col">
            <div className="p-4 border-b border-white/5 bg-white/[0.01] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-neon-pink" />
                  <span className="text-[10px] font-mono text-white uppercase tracking-widest font-bold">Skill_Armory</span>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="SEARCH_FORGE_DATABASE..."
                  className="w-full bg-void border border-white/10 p-2 pl-9 text-[10px] font-mono text-white outline-none focus:border-neon-pink transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {availableSkills.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 p-8">
                  <Workflow size={32} className="mb-4" />
                  <p className="text-[10px] font-mono uppercase tracking-widest">Armory Empty</p>
                  <p className="text-[8px] font-mono mt-2 italic">Refine your search or forge new skills in the Skill Forge</p>
                </div>
              ) : (
                availableSkills.map(skill => (
                  <div key={skill.id} className="p-4 bg-white/5 border border-white/10 rounded-lg group hover:border-white/30 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-bold text-white uppercase tracking-tight">{skill.name}</span>
                        <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{skill.category}</span>
                      </div>
                      <button 
                        onClick={() => toggleSkill(skill.id)}
                        className="w-8 h-8 rounded-full bg-neon-pink/10 border border-neon-pink/30 text-neon-pink flex items-center justify-center hover:bg-neon-pink hover:text-white transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] font-mono text-white/40 leading-relaxed">
                      {skill.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[7px] font-mono text-gray-600 uppercase">Synchronization</span>
              <span className="text-[10px] font-mono text-neon-green">READY</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[7px] font-mono text-gray-600 uppercase">Integrity_Check</span>
              <span className="text-[10px] font-mono text-neon-cyan">PASSED</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-2 bg-white text-black font-display font-black text-[10px] uppercase tracking-widest hover:bg-neon-cyan transition-all"
          >
            Commit_Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};
