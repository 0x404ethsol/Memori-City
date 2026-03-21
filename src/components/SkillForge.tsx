import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Skill } from '../types';
import { CodecPanel } from './CodecPanel';
import { useSettings } from '../contexts/SettingsContext';
import { LLMService } from '../services/llmService';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Play, 
  Code, 
  Settings, 
  CheckCircle2, 
  XCircle,
  Clock,
  Workflow,
  Download,
  Upload,
  Search,
  Activity,
  Cpu,
  Brain,
  Sparkles,
  Layers,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function SkillForge() {
  const { settings } = useSettings();
  const skills = useLiveQuery(() => db.skills.toArray()) || [];
  const [isAdding, setIsAdding] = useState(false);
  const [isForging, setIsForging] = useState(false);
  const [newSkill, setNewSkill] = useState<Partial<Skill & { is_meta?: boolean; sub_skills?: string[] }>>({
    name: '',
    description: '',
    category: 'automation',
    is_active: true,
    is_meta: false,
    sub_skills: [],
    dependencies: []
  });

  const addSkill = async () => {
    if (!newSkill.name || !newSkill.description || !settings) return;
    setIsForging(true);
    
    try {
      const llm = new LLMService(settings.llm);
      const systemPrompt = "You are a senior systems architect for Memori-City. Your goal is to generate a JavaScript 'run' function for a skill based on its description. The function should be asynchronous and take a 'context' object. Return ONLY the code, no markdown formatting.";
      const userPrompt = `Generate a skill function for: ${newSkill.name}. Description: ${newSkill.description}`;
      
      const generatedCode = await llm.generateText(userPrompt, systemPrompt);

      const id = `skill_${Math.random().toString(36).substring(2, 10)}`;
      const skill: any = {
        id,
        name: newSkill.name,
        description: newSkill.description,
        category: newSkill.category as any,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        code: generatedCode || '// Define your skill logic here\nexport async function run(context) {\n  console.log("Executing skill...");\n}',
        schema: {
          type: "object",
          properties: {
            input: { type: "string" }
          }
        },
        is_meta: newSkill.is_meta || false,
        sub_skills: newSkill.sub_skills || [],
        dependencies: newSkill.dependencies || []
      };

      await db.skills.add(skill);
      setIsAdding(false);
      setNewSkill({ name: '', description: '', category: 'automation', is_meta: false, sub_skills: [], dependencies: [] });
    } catch (error) {
      console.error('Skill forging failed:', error);
    } finally {
      setIsForging(false);
    }
  };

  const importSkill = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = JSON.parse(event.target?.result as string);
        const skillsToImport = Array.isArray(content) ? content : [content];
        
        for (const s of skillsToImport) {
          const id = s.id || `skill_${Math.random().toString(36).substring(2, 10)}`;
          await db.skills.put({
            ...s,
            id,
            created_at: s.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Failed to import skill:", err);
      }
    };
    reader.readAsText(file);
  };

  const toggleSkill = async (id: string, currentStatus: boolean) => {
    await db.skills.update(id, { is_active: !currentStatus, updated_at: new Date().toISOString() });
  };

  const deleteSkill = async (id: string) => {
    await db.skills.delete(id);
  };

  return (
    <div className="flex flex-col h-full gap-6 bg-void p-8 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 right-10 text-[60px] font-bold text-white/[0.02] pointer-events-none select-none font-sans italic">
        スキル鍛冶場
      </div>
      <div className="absolute bottom-10 left-10 text-[40px] font-bold text-white/[0.01] pointer-events-none select-none font-sans">
        FORGE_V4.20
      </div>

      {/* Editorial Header (Recipe 2/4) */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6 relative z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-neon-pink">
            <Sparkles size={14} className="animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] hud-label">Advanced_Capabilities // 高度な機能</span>
          </div>
          <h2 className="text-6xl font-serif italic text-white tracking-tighter glitch-text" data-text="Skill Forge">Skill Forge</h2>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em] mt-1">Architecting autonomous intelligence protocols</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 px-6 py-2 border border-white/10 text-white/60 font-mono text-[10px] uppercase tracking-widest hover:border-neon-blue hover:text-neon-blue transition-all cursor-pointer rounded-sm battle-border bg-white/5">
            <Upload size={12} /> Import_Manifest
            <input type="file" className="hidden" onChange={importSkill} accept=".json" />
          </label>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-8 py-2 bg-neon-pink text-white font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all rounded-sm battle-border shadow-[0_0_20px_color-mix(in_srgb,var(--theme-pink)_20%,transparent)]"
          >
            <Plus size={12} /> Forge_New // 新規作成
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {isAdding && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="col-span-1"
              >
                <div className="bg-void border border-white/20 p-6 rounded-sm backdrop-blur-xl battle-border relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50" />
                  <div className="text-[10px] font-mono text-neon-blue uppercase mb-6 flex items-center gap-2 hud-label">
                    <div className="w-1 h-1 bg-neon-blue rounded-full animate-ping" />
                    Initializing_Forge_Protocol // プロトコル初期化
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Skill_Identifier</label>
                      <input 
                        type="text" 
                        value={newSkill.name}
                        onChange={e => setNewSkill({...newSkill, name: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 p-2 text-sm font-mono text-white outline-none focus:border-neon-blue transition-colors"
                        placeholder="E.G. NEURAL_PARSER"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Operational_Brief</label>
                      <textarea 
                        value={newSkill.description}
                        onChange={e => setNewSkill({...newSkill, description: e.target.value})}
                        className="w-full bg-transparent border border-white/10 p-3 text-xs font-mono text-white outline-none focus:border-neon-blue h-24 resize-none rounded-lg"
                        placeholder="DEFINE CORE LOGIC..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Domain</label>
                        <select 
                          value={newSkill.category}
                          onChange={e => setNewSkill({...newSkill, category: e.target.value as any})}
                          className="w-full bg-void border border-white/10 p-2 text-[10px] font-mono text-white outline-none focus:border-neon-blue rounded-md"
                        >
                          <option value="automation">AUTOMATION</option>
                          <option value="research">RESEARCH</option>
                          <option value="utility">UTILITY</option>
                          <option value="custom">CUSTOM</option>
                        </select>
                      </div>
                      <div className="flex flex-col justify-end pb-1">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id="is_meta"
                            checked={newSkill.is_meta}
                            onChange={e => setNewSkill({...newSkill, is_meta: e.target.checked})}
                            className="w-3 h-3 accent-neon-pink"
                          />
                          <label htmlFor="is_meta" className="text-[9px] font-mono text-neon-pink uppercase cursor-pointer tracking-tighter">
                            Meta_Loop
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-3">
                      <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Execution_Dependencies</div>
                      <div className="flex flex-wrap gap-2">
                        {skills.map(s => (
                          <button
                            key={s.id}
                            onClick={() => {
                              const current = newSkill.dependencies || [];
                              const next = current.includes(s.id) 
                                ? current.filter(id => id !== s.id)
                                : [...current, s.id];
                              setNewSkill({...newSkill, dependencies: next});
                            }}
                            className={cn(
                              "px-3 py-1 text-[8px] font-mono border rounded-full transition-all",
                              newSkill.dependencies?.includes(s.id)
                                ? "bg-neon-cyan border-neon-cyan text-void font-bold"
                                : "border-white/10 text-white/40 hover:border-white/30"
                            )}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {newSkill.is_meta && (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-3">
                        <div className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Sub_Skill_Orchestration</div>
                        <div className="flex flex-wrap gap-2">
                          {skills.map(s => (
                            <button
                              key={s.id}
                              onClick={() => {
                                const current = newSkill.sub_skills || [];
                                const next = current.includes(s.id) 
                                  ? current.filter(id => id !== s.id)
                                  : [...current, s.id];
                                setNewSkill({...newSkill, sub_skills: next});
                              }}
                              className={cn(
                                "px-3 py-1 text-[8px] font-mono border rounded-full transition-all",
                                newSkill.sub_skills?.includes(s.id)
                                  ? "bg-neon-pink border-neon-pink text-white"
                                  : "border-white/10 text-white/40 hover:border-white/30"
                              )}
                            >
                              {s.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={addSkill}
                        disabled={isForging}
                        className="flex-1 py-3 bg-neon-blue text-void font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all rounded-xl flex items-center justify-center gap-2"
                      >
                        {isForging ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            FORGING...
                          </>
                        ) : (
                          'Commit_Protocol'
                        )}
                      </button>
                      <button 
                        onClick={() => setIsAdding(false)}
                        className="px-6 py-3 border border-white/10 text-white/40 font-mono text-[10px] uppercase hover:bg-white/5 transition-all rounded-xl"
                      >
                        Abort
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {skills.map(skill => (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-1"
              >
                <div className="bg-white/[0.02] border border-white/10 p-6 rounded-sm hover:bg-white/[0.04] hover:border-neon-blue/40 transition-all group relative overflow-hidden battle-border">
                  {/* Category Badge (Recipe 1) */}
                  <div className="absolute top-0 right-0 px-4 py-1 bg-white/5 border-l border-b border-white/10 text-[8px] font-mono text-gray-500 uppercase tracking-widest hud-label">
                    {skill.category} // カテゴリ
                  </div>

                  <div className="flex flex-col h-full relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-mono font-bold text-white tracking-tighter group-hover:text-neon-blue transition-colors uppercase">
                          {skill.name}
                        </h3>
                        {(skill as any).is_meta && (
                          <div className="flex items-center gap-1.5">
                            <Layers size={10} className="text-neon-pink" />
                            <span className="text-[8px] font-mono text-neon-pink uppercase tracking-[0.2em] hud-label">Meta_Coordination_Loop // メタ調整</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleSkill(skill.id, skill.is_active)}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                            skill.is_active ? "bg-neon-green/10 text-neon-green" : "bg-white/5 text-gray-600"
                          )}
                        >
                          {skill.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        </button>
                        <button 
                          onClick={() => deleteSkill(skill.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-gray-600 hover:text-neon-pink transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-gray-400 font-mono leading-relaxed mb-4 flex-1">
                      {skill.description}
                    </p>

                    {skill.dependencies && skill.dependencies.length > 0 && (
                      <div className="mb-6 space-y-2">
                        <div className="text-[7px] font-mono text-neon-cyan uppercase tracking-widest flex items-center gap-1">
                          <Workflow size={8} /> Dependencies
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {skill.dependencies.map(depId => {
                            const depSkill = skills.find(s => s.id === depId);
                            return (
                              <span key={depId} className="px-2 py-0.5 bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-[8px] font-mono rounded-sm">
                                {depSkill ? depSkill.name : 'UNKNOWN_SKILL'}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[7px] font-mono text-gray-600 uppercase">Alignment</span>
                          <span className="text-[10px] font-mono text-neon-green">98.4%</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[7px] font-mono text-gray-600 uppercase">Last_Sync</span>
                          <span className="text-[10px] font-mono text-white/40">{new Date(skill.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-neon-blue hover:text-white transition-all shadow-lg">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
