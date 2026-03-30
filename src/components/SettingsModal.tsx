import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { 
  Settings, 
  Monitor, 
  Type, 
  FileText, 
  Palette, 
  Keyboard, 
  Key, 
  Puzzle, 
  Users, 
  X,
  Check,
  ChevronRight,
  Info,
  LogOut,
  CreditCard,
  ShieldCheck,
  Globe,
  Bell,
  Cpu,
  Zap,
  LucideIcon,
  Trash2,
  Plus,
  Save,
  Loader2,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSettings } from '../contexts/SettingsContext';
import { LLMConfig } from '../types';
import { LLMService } from '../services/llmService';

interface SettingsCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  section: 'options' | 'core' | 'community';
}

const categories: SettingsCategory[] = [
  { id: 'general', label: 'General', icon: Settings, section: 'options' },
  { id: 'editor', label: 'Editor', icon: Type, section: 'options' },
  { id: 'files', label: 'Files and links', icon: FileText, section: 'options' },
  { id: 'appearance', label: 'Appearance', icon: Palette, section: 'options' },
  { id: 'hotkeys', label: 'Hotkeys', icon: Keyboard, section: 'options' },
  { id: 'keychain', label: 'Keychain', icon: Key, section: 'options' },
  { id: 'deep-research', label: 'Deep Research', icon: Brain, section: 'options' },
  { id: 'armory', label: 'Sub-Agent Armory', icon: ShieldCheck, section: 'options' },
  { id: 'core', label: 'Core plugins', icon: Puzzle, section: 'options' },
  { id: 'community', label: 'Community plugins', icon: Users, section: 'options' },
  // Core plugins
  { id: 'backlinks', label: 'Backlinks', icon: ChevronRight, section: 'core' },
  { id: 'canvas', label: 'Canvas', icon: Monitor, section: 'core' },
  { id: 'command', label: 'Command palette', icon: ChevronRight, section: 'core' },
  { id: 'daily', label: 'Daily notes', icon: ChevronRight, section: 'core' },
  { id: 'recovery', label: 'File recovery', icon: ChevronRight, section: 'core' },
  { id: 'sync', label: 'Sync', icon: Zap, section: 'core' },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, isLoaded } = useSettings();
  const skills = useLiveQuery(() => db.skills.toArray()) || [];
  const [activeCategory, setActiveCategory] = useState('general');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [isUpdatingEncryption, setIsUpdatingEncryption] = useState(false);

  if (!isOpen || !isLoaded) return null;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestError(null);
    try {
      const service = new LLMService(settings.llm);
      // Simple test prompt
      const result = await service.generateText(
        "Respond with 'OK' if you are working.", 
        "You are a system health check agent. Your only task is to confirm connectivity."
      );
      
      if (result) {
        setTestStatus('success');
        setTimeout(() => setTestStatus('idle'), 3000);
      } else {
        throw new Error("Empty response from LLM");
      }
    } catch (err) {
      console.error("LLM Test Failed:", err);
      setTestStatus('error');
      setTestError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const togglePlugin = (id: string) => {
    const newPlugins = new Set(settings.activePlugins);
    if (newPlugins.has(id)) newPlugins.delete(id);
    else newPlugins.add(id);
    updateSettings({ activePlugins: Array.from(newPlugins) });
  };

  const updateLLM = (updates: Partial<LLMConfig>) => {
    updateSettings({ llm: { ...settings.llm, ...updates } });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  const handleUpdateEncryption = async () => {
    setIsUpdatingEncryption(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsUpdatingEncryption(false);
  };

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case 'armory':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
              <h3 className="text-2xl font-serif italic text-white tracking-tight">Sub-Agent Armory</h3>
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Equip your pico-agents with specialized skills</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {(['janitor', 'linker', 'builder', 'researcher', 'archivist', 'notary'] as const).map((type) => (
                <div key={type} className="p-6 bg-white/5 border border-white/10 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neon-blue/10 flex items-center justify-center text-neon-blue border border-neon-blue/20">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">{type}</h4>
                        <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Preset capabilities for {type} agents</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block">Equipped Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(skill => {
                        const isEquipped = settings.subagent_presets?.[type]?.skills?.includes(skill.id);
                        return (
                          <button
                            key={skill.id}
                            onClick={() => {
                              const currentPresets = settings.subagent_presets || {};
                              const currentTypePreset = currentPresets[type] || { skills: [] };
                              const currentSkills = currentTypePreset.skills || [];
                              const nextSkills = isEquipped
                                ? currentSkills.filter(id => id !== skill.id)
                                : [...currentSkills, skill.id];
                              
                              updateSettings({
                                subagent_presets: {
                                  ...currentPresets,
                                  [type]: { skills: nextSkills }
                                }
                              });
                            }}
                            className={cn(
                              "px-3 py-1.5 text-[9px] font-mono border rounded-full transition-all flex items-center gap-2",
                              isEquipped
                                ? "bg-neon-blue border-neon-blue text-void font-bold shadow-[0_0_10px_rgba(0,243,255,0.3)]"
                                : "border-white/10 text-white/40 hover:border-white/30"
                            )}
                          >
                            {skill.name}
                            {isEquipped && <Zap size={8} />}
                          </button>
                        );
                      })}
                      {skills.length === 0 && (
                        <p className="text-[9px] font-mono text-gray-600 italic uppercase">No skills forged yet. Visit the Skill Forge to create some.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'general':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Version 1.12.4</h3>
                  <p className="text-[10px] font-mono text-white/40 uppercase">Installer version: 1.11.7</p>
                  <a href="#" className="text-[10px] font-mono text-neon-cyan underline uppercase">Read the changelog.</a>
                </div>
                <button className="px-4 py-2 bg-neon-purple/10 border border-neon-purple/40 text-neon-purple text-[10px] font-mono uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all">
                  Check for updates
                </button>
              </div>
            </section>

            <div className="h-px bg-white/5" />

            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Automatic updates</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Turn this off to prevent the app from checking for updates.</p>
              </div>
              <button 
                onClick={() => updateSettings({ isAutoUpdate: !settings.isAutoUpdate })}
                className={cn(
                  "w-10 h-5 rounded-full relative transition-colors",
                  settings.isAutoUpdate ? "bg-neon-green" : "bg-white/10"
                )}
              >
                <motion.div 
                  animate={{ x: settings.isAutoUpdate ? 22 : 2 }}
                  className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-lg"
                />
              </button>
            </section>

            <div className="h-px bg-white/5" />

            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Language</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Change the display language.</p>
                <a href="#" className="text-[10px] font-mono text-neon-cyan underline uppercase">Learn how to add a new language to Memori-City.</a>
              </div>
              <select 
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="bg-void border border-white/10 text-white text-[10px] font-mono p-2 outline-none focus:border-neon-cyan uppercase"
              >
                <option>English</option>
                <option>Japanese</option>
                <option>Cyber-Script</option>
              </select>
            </section>

            <div className="h-px bg-white/5" />

            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Help</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Learn how to use Memori-City and get help from the community.</p>
              </div>
              <button className="px-4 py-2 border border-white/10 text-white text-[10px] font-mono uppercase tracking-widest hover:bg-white/5 transition-all">
                Open
              </button>
            </section>

            <div className="pt-8">
              <h2 className="text-lg font-display font-black text-white uppercase tracking-[0.4em] mb-6">Account</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-void/40 border border-white/5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Your account</h3>
                    <p className="text-[10px] font-mono text-white/40 uppercase">You're currently signed in as system_admin (0x404...)</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 border border-white/10 text-white text-[10px] font-mono uppercase tracking-widest hover:bg-white/5 transition-all">Manage</button>
                    <button className="px-4 py-2 border border-neon-pink/40 text-neon-pink text-[10px] font-mono uppercase tracking-widest hover:bg-neon-pink hover:text-white transition-all">Log out</button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-void/40 border border-white/5">
                  <div className="space-y-1">
                    <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Catalyst license</h3>
                    <p className="text-[10px] font-mono text-white/40 uppercase max-w-md">You don't have a Catalyst license. Catalyst is a one-time donation that helps Memori-City remain 100% user-supported.</p>
                    <a href="#" className="text-[10px] font-mono text-neon-cyan underline uppercase">Learn more</a>
                  </div>
                  <button className="px-6 py-2 bg-neon-purple text-white text-[10px] font-display font-black uppercase tracking-widest hover:bg-neon-purple/80 transition-all shadow-[0_0_15px_var(--theme-purple)]">
                    Purchase
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'editor':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Font size</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Adjust the text size in the editor.</p>
              </div>
              <div className="flex items-center gap-4">
                <input 
                  type="range" min="10" max="24" value={settings.fontSize} 
                  onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                  className="w-32 accent-neon-cyan"
                />
                <span className="text-[10px] font-mono text-white w-8">{settings.fontSize}px</span>
              </div>
            </section>
            <div className="h-px bg-white/5" />
            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Readable line length</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Limit the line length to make text easier to read.</p>
              </div>
              <button 
                onClick={() => updateSettings({ lineWrap: !settings.lineWrap })}
                className={cn(
                  "w-10 h-5 rounded-full relative transition-colors",
                  settings.lineWrap ? "bg-neon-cyan" : "bg-white/10"
                )}
              >
                <motion.div 
                  animate={{ x: settings.lineWrap ? 22 : 2 }}
                  className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-lg"
                />
              </button>
            </section>
            <div className="h-px bg-white/5" />
            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Default view mode</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Choose between Editing or Reading by default.</p>
              </div>
              <select className="bg-void border border-white/10 text-white text-[10px] font-mono p-2 outline-none focus:border-neon-cyan uppercase">
                <option>Editing</option>
                <option>Reading</option>
              </select>
            </section>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Visual Theme</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Adjust the overall color palette and background visuals.</p>
              </div>
              <div className="flex flex-wrap gap-1 bg-void border border-white/10 p-1">
                {['cyberpunk', 'scifi', 'minimalist', 'retro-futurism', 'organic-growth', 'deep-sea'].map(t => (
                  <button 
                    key={t}
                    onClick={() => updateSettings({ visualTheme: t as any })}
                    className={cn(
                      "px-3 py-1 text-[9px] font-mono uppercase tracking-widest transition-all whitespace-nowrap",
                      (settings.visualTheme || 'cyberpunk') === t ? "bg-white text-void font-bold" : "text-white/40 hover:text-white"
                    )}
                  >
                    {t.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </section>
            <div className="h-px bg-white/5" />
            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Base color scheme</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Choose between Light, Dark, or System.</p>
              </div>
              <div className="flex bg-void border border-white/10 p-1">
                {['light', 'dark', 'system'].map(t => (
                  <button 
                    key={t}
                    onClick={() => updateSettings({ theme: t as any })}
                    className={cn(
                      "px-3 py-1 text-[9px] font-mono uppercase tracking-widest transition-all",
                      settings.theme === t ? "bg-white text-void font-bold" : "text-white/40 hover:text-white"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>
            <div className="h-px bg-white/5" />
            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Accent color</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Customize the primary UI color.</p>
              </div>
              <div className="flex gap-2">
                {['#00FFFF', '#FF00FF', '#00FF00', '#9D00FF', '#FFFF00'].map(c => (
                  <button 
                    key={c}
                    onClick={() => updateSettings({ accentColor: c })}
                    className={cn(
                      "w-6 h-6 border-2 transition-all",
                      settings.accentColor === c ? "border-white scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </section>
            <div className="h-px bg-white/5" />
            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Interface font</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Change the font used in the UI.</p>
              </div>
              <select className="bg-void border border-white/10 text-white text-[10px] font-mono p-2 outline-none focus:border-neon-cyan uppercase">
                <option>Inter</option>
                <option>JetBrains Mono</option>
                <option>Space Grotesk</option>
              </select>
            </section>
          </div>
        );
      case 'keychain':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">LLM Configuration</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Bring your own keys or connect to local models. Memori-City supports local Ollama instances, OpenAI, Anthropic, and custom OpenAI-compatible endpoints.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-white/40 uppercase">Provider</label>
                  <select 
                    value={settings.llm.provider}
                    onChange={(e) => updateLLM({ provider: e.target.value as any })}
                    className="w-full bg-void border border-white/10 p-2 text-[10px] font-mono text-white outline-none focus:border-neon-cyan uppercase"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="ollama">Ollama (Local)</option>
                    <option value="webgpu">WebGPU (Local Transformers.js)</option>
                    <option value="custom">Custom Endpoint</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-white/40 uppercase">Model Name</label>
                  <input 
                    type="text" 
                    value={settings.llm.modelName}
                    onChange={(e) => updateLLM({ modelName: e.target.value })}
                    className="w-full bg-void border border-white/10 p-2 text-[10px] font-mono text-white outline-none focus:border-neon-cyan uppercase"
                    placeholder="e.g. gemini-3-flash-preview"
                  />
                </div>
              </div>

              {(settings.llm.provider !== 'ollama' && settings.llm.provider !== 'webgpu') && (
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-white/40 uppercase">API Key</label>
                  <input 
                    type="password" 
                    value={settings.llm.apiKey || ''}
                    onChange={(e) => updateLLM({ apiKey: e.target.value })}
                    className="w-full bg-void border border-white/10 p-2 text-[10px] font-mono text-neon-cyan outline-none focus:border-neon-cyan"
                    placeholder="ENTER_API_KEY..."
                  />
                </div>
              )}

              {settings.llm.provider === 'webgpu' && (
                <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-neon-cyan">
                    <Cpu size={14} />
                    <span className="text-[10px] font-display font-black uppercase tracking-widest">WebGPU Acceleration</span>
                  </div>
                  <p className="text-[9px] font-mono text-white/60 uppercase leading-relaxed">
                    This will download the model (approx. 500MB - 1GB) to your browser's cache. 
                    Ensure you have a compatible browser (Chrome 113+, Edge 113+) and hardware.
                  </p>
                </div>
              )}

              {(settings.llm.provider === 'ollama' || settings.llm.provider === 'custom') && (
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-white/40 uppercase">Base URL</label>
                  <input 
                    type="text" 
                    value={settings.llm.baseUrl || ''}
                    onChange={(e) => updateLLM({ baseUrl: e.target.value })}
                    className="w-full bg-void border border-white/10 p-2 text-[10px] font-mono text-white outline-none focus:border-neon-cyan"
                    placeholder={settings.llm.provider === 'ollama' ? "http://localhost:11434" : "https://api.custom.com/v1"}
                  />
                </div>
              )}

              <div className="space-y-2">
                <button 
                  onClick={handleTestConnection}
                  disabled={testStatus === 'testing'}
                  className={cn(
                    "w-full py-3 border font-display font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                    testStatus === 'idle' && "bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan hover:text-void",
                    testStatus === 'testing' && "bg-white/5 border-white/20 text-white/40 cursor-wait",
                    testStatus === 'success' && "bg-neon-green/10 border-neon-green/40 text-neon-green",
                    testStatus === 'error' && "bg-neon-pink/10 border-neon-pink/40 text-neon-pink"
                  )}
                >
                  {testStatus === 'testing' ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Testing_Link...
                    </>
                  ) : testStatus === 'success' ? (
                    <>
                      <Check size={14} />
                      Connection_Established
                    </>
                  ) : testStatus === 'error' ? (
                    <>
                      <X size={14} />
                      Link_Failed
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      Test Connection & Save
                    </>
                  )}
                </button>
                {testError && (
                  <p className="text-[9px] font-mono text-neon-pink uppercase text-center animate-pulse">
                    Error: {testError}
                  </p>
                )}
              </div>
            </section>

            <div className="h-px bg-white/5" />

            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Vault Encryption</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Master secret for Memori_Protocol vault encryption.</p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="password" 
                  value={settings.encryptionSecret || ''}
                  onChange={(e) => updateSettings({ encryptionSecret: e.target.value })}
                  className="flex-1 bg-void border border-white/10 p-2 text-[10px] font-mono text-neon-pink outline-none focus:border-neon-pink"
                  placeholder="ENTER_MASTER_SECRET..."
                />
                <button 
                  onClick={handleUpdateEncryption}
                  disabled={isUpdatingEncryption}
                  className="px-4 py-2 bg-neon-pink text-void font-display font-black text-[10px] uppercase tracking-widest hover:bg-neon-pink/80 transition-all flex items-center gap-2"
                >
                  {isUpdatingEncryption ? <Loader2 size={12} className="animate-spin" /> : null}
                  {isUpdatingEncryption ? 'Updating...' : 'Update'}
                </button>
              </div>
            </section>
          </div>
        );
      case 'deep-research':
        const updateDeepResearch = (updates: Partial<typeof settings.deepResearch>) => {
          if (!settings.deepResearch) return;
          updateSettings({ deepResearch: { ...settings.deepResearch, ...updates } });
        };

        const updateDeepResearchLLM = (updates: Partial<LLMConfig>) => {
          if (!settings.deepResearch?.llm) return;
          updateDeepResearch({ llm: { ...settings.deepResearch.llm, ...updates } });
        };

        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Research Protocol</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Configure the Deep Research agent for autonomous knowledge synthesis.</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-void/40 border border-white/5">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-mono text-white uppercase">Use Local Ollama</h4>
                  <p className="text-[8px] font-mono text-white/20 uppercase">Prioritize local inference for privacy-first research.</p>
                </div>
                <button 
                  onClick={() => updateDeepResearch({ useLocalOllama: !settings.deepResearch?.useLocalOllama })}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    settings.deepResearch?.useLocalOllama ? "bg-neon-cyan" : "bg-white/10"
                  )}
                >
                  <motion.div 
                    animate={{ x: settings.deepResearch?.useLocalOllama ? 22 : 2 }}
                    className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-white/40 uppercase">Research LLM Provider</label>
                  <select 
                    value={settings.deepResearch?.llm?.provider}
                    onChange={(e) => updateDeepResearchLLM({ provider: e.target.value as any })}
                    className="w-full bg-void border border-white/10 text-white text-[10px] font-mono p-2 outline-none focus:border-neon-cyan uppercase"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="ollama">Ollama (Local)</option>
                    <option value="custom">Custom Endpoint</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-white/40 uppercase">Model Name</label>
                  <input 
                    type="text" 
                    value={settings.deepResearch?.llm?.modelName}
                    onChange={(e) => updateDeepResearchLLM({ modelName: e.target.value })}
                    className="w-full bg-void border border-white/10 p-2 text-[10px] font-mono text-white outline-none focus:border-neon-cyan"
                    placeholder="e.g. llama3, gpt-4o, gemini-1.5-pro"
                  />
                </div>

                {(settings.deepResearch?.llm?.provider === 'ollama' || settings.deepResearch?.llm?.provider === 'custom') && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-white/40 uppercase">Base URL</label>
                    <input 
                      type="text" 
                      value={settings.deepResearch?.llm?.baseUrl || ''}
                      onChange={(e) => updateDeepResearchLLM({ baseUrl: e.target.value })}
                      className="w-full bg-void border border-white/10 p-2 text-[10px] font-mono text-white outline-none focus:border-neon-cyan"
                      placeholder={settings.deepResearch?.llm?.provider === 'ollama' ? "http://localhost:11434" : "https://api.custom.com/v1"}
                    />
                  </div>
                )}

                {settings.deepResearch?.llm?.provider !== 'ollama' && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-white/40 uppercase">API Key</label>
                    <input 
                      type="password" 
                      value={settings.deepResearch?.llm?.apiKey || ''}
                      onChange={(e) => updateDeepResearchLLM({ apiKey: e.target.value })}
                      className="w-full bg-void border border-white/10 p-2 text-[10px] font-mono text-neon-cyan outline-none focus:border-neon-cyan"
                      placeholder="ENTER_API_KEY..."
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[9px] font-mono text-white/40 uppercase">Max Iterations ({settings.deepResearch?.maxIterations})</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="20" 
                    value={settings.deepResearch?.maxIterations}
                    onChange={(e) => updateDeepResearch({ maxIterations: parseInt(e.target.value) })}
                    className="w-full accent-neon-cyan"
                  />
                </div>
              </div>
            </section>
          </div>
        );
      case 'core':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {categories.filter(c => c.section === 'core').map(plugin => (
              <div key={plugin.id} className="flex items-center justify-between p-4 bg-void/40 border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 flex items-center justify-center border border-white/10">
                    <plugin.icon size={20} className="text-neon-cyan" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">{plugin.label}</h3>
                    <p className="text-[10px] font-mono text-white/40 uppercase">Core system module for {plugin.label.toLowerCase()} functionality.</p>
                  </div>
                </div>
                <button 
                  onClick={() => togglePlugin(plugin.id)}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    settings.activePlugins.includes(plugin.id) ? "bg-neon-green" : "bg-white/10"
                  )}
                >
                  <motion.div 
                    animate={{ x: settings.activePlugins.includes(plugin.id) ? 22 : 2 }}
                    className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>
            ))}
          </div>
        );
      case 'sync':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="p-6 bg-void/40 border border-neon-cyan/20 flex flex-col items-center text-center gap-4">
              <Zap size={48} className="text-neon-cyan animate-pulse" />
              <div className="space-y-2">
                <h3 className="text-lg font-display font-black text-white uppercase tracking-[0.2em]">Memori_Sync Active</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Your vault is currently synchronized across 3 devices.</p>
              </div>
              <div className="flex gap-3 mt-2">
                <div className="px-3 py-1 bg-neon-green/10 border border-neon-green/40 text-neon-green text-[8px] font-mono uppercase tracking-widest">Status: Encrypted</div>
                <div className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan text-[8px] font-mono uppercase tracking-widest">Last Sync: 2m ago</div>
              </div>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="mt-4 px-8 py-3 bg-neon-cyan text-void font-display font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
              >
                {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                {isSyncing ? 'Synchronizing...' : 'Sync Now'}
              </button>
            </div>
            <section className="space-y-4">
              <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Connected Devices</h3>
              <div className="space-y-2">
                {['SOVEREIGN_MOBILE_01', 'DESKTOP_KERNEL_X', 'TABLET_NODE_V'].map(device => (
                  <div key={device} className="flex items-center justify-between p-3 bg-void border border-white/5">
                    <div className="flex items-center gap-3">
                      <Monitor size={14} className="text-white/40" />
                      <span className="text-[10px] font-mono text-white uppercase">{device}</span>
                    </div>
                    <button className="text-[8px] font-mono text-neon-pink uppercase hover:underline">Disconnect</button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      case 'files':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Default location for new notes</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Where should new memory nodes be created?</p>
              </div>
              <select 
                value={settings.defaultNoteLocation}
                onChange={(e) => updateSettings({ defaultNoteLocation: e.target.value as any })}
                className="w-full bg-void border border-white/10 text-white text-[10px] font-mono p-2 outline-none focus:border-neon-cyan uppercase"
              >
                <option value="root">Vault root</option>
                <option value="current">Same folder as current file</option>
                <option value="folder">Specified folder below</option>
              </select>
            </section>
            <div className="h-px bg-white/5" />
            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Deleted files</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Choose where deleted files go.</p>
              </div>
              <select 
                value={settings.deleteBehavior}
                onChange={(e) => updateSettings({ deleteBehavior: e.target.value as any })}
                className="bg-void border border-white/10 text-white text-[10px] font-mono p-2 outline-none focus:border-neon-cyan uppercase"
              >
                <option value="trash">Move to system trash</option>
                <option value="dot-trash">Move to .trash folder</option>
                <option value="permanent">Permanently delete</option>
              </select>
            </section>
          </div>
        );
      case 'community':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Community Plugins</h3>
              <button className="px-4 py-2 bg-neon-cyan text-void font-display font-black text-[10px] uppercase tracking-widest hover:bg-neon-cyan/80 transition-all">
                Browse
              </button>
            </div>
            <div className="p-4 border border-dashed border-white/10 bg-void/20 text-center space-y-2">
              <Users size={24} className="mx-auto text-white/20" />
              <p className="text-[10px] font-mono text-white/40 uppercase">Safe mode is ON. Turn it off to install community plugins.</p>
              <button className="text-[10px] font-mono text-neon-pink uppercase underline">Turn off safe mode</button>
            </div>
          </div>
        );
      case 'backlinks':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Show backlinks in document</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Automatically display backlinks at the bottom of notes.</p>
              </div>
              <button 
                onClick={() => togglePlugin('backlinks')}
                className={cn(
                  "w-10 h-5 rounded-full relative transition-colors",
                  settings.activePlugins.includes('backlinks') ? "bg-neon-green" : "bg-white/10"
                )}
              >
                <motion.div 
                  animate={{ x: settings.activePlugins.includes('backlinks') ? 22 : 2 }}
                  className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-lg"
                />
              </button>
            </section>
          </div>
        );
      case 'canvas':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Snap to grid</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Align cards and elements to the grid automatically.</p>
              </div>
              <button 
                onClick={() => togglePlugin('canvas')}
                className={cn(
                  "w-10 h-5 rounded-full relative transition-colors",
                  settings.activePlugins.includes('canvas') ? "bg-neon-green" : "bg-white/10"
                )}
              >
                <motion.div 
                  animate={{ x: settings.activePlugins.includes('canvas') ? 22 : 2 }}
                  className="absolute top-1 left-0 w-3 h-3 bg-white rounded-full shadow-lg"
                />
              </button>
            </section>
          </div>
        );
      case 'command':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="space-y-4">
              <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Pinned Commands</h3>
              <div className="p-4 border border-white/5 bg-void/40 text-center">
                <p className="text-[10px] font-mono text-white/20 uppercase">No commands pinned yet.</p>
              </div>
            </section>
          </div>
        );
      case 'daily':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Date format</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">Format for daily note titles.</p>
              </div>
              <input 
                type="text" 
                defaultValue="YYYY-MM-DD"
                className="w-full bg-void border border-white/10 p-2 text-[10px] font-mono text-neon-cyan outline-none focus:border-neon-cyan uppercase"
              />
            </section>
          </div>
        );
      case 'recovery':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <section className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Snapshots</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase">History of file changes for recovery.</p>
              </div>
              <button className="px-4 py-2 border border-white/10 text-white text-[10px] font-mono uppercase tracking-widest hover:bg-white/5 transition-all">
                View
              </button>
            </section>
          </div>
        );
      case 'hotkeys':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="relative">
              <input 
                type="text" 
                placeholder="SEARCH_HOTKEYS..."
                className="w-full bg-void border border-white/10 p-3 text-[10px] font-mono text-white outline-none focus:border-neon-cyan uppercase"
              />
            </div>
            <div className="space-y-1">
              {[
                { cmd: 'CTRL+P', desc: 'OPEN_COMMAND_PALETTE' },
                { cmd: 'CTRL+N', desc: 'CREATE_NEW_MEMORY' },
                { cmd: 'CTRL+G', desc: 'TOGGLE_GRAPH_VIEW' },
                { cmd: 'CTRL+S', desc: 'SAVE_CHANGES' },
                { cmd: 'CTRL+,', desc: 'OPEN_SETTINGS' },
                { cmd: 'CTRL+F', desc: 'SEARCH_VAULT' },
              ].map(hk => (
                <div key={hk.cmd} className="flex items-center justify-between p-3 border-b border-white/5 hover:bg-white/5 transition-all">
                  <span className="text-[10px] font-mono text-white/60 uppercase">{hk.desc}</span>
                  <span className="px-2 py-1 bg-white/10 text-white text-[9px] font-mono rounded">{hk.cmd}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full opacity-20 gap-4">
            <Cpu size={48} />
            <p className="text-sm font-mono uppercase tracking-[0.4em]">Module_Under_Configuration</p>
            <p className="text-[10px] font-mono uppercase tracking-widest">Accessing_Sovereign_Subsystems...</p>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-void/80 backdrop-blur-xl">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl h-full max-h-[600px] bg-void border border-neon-cyan/30 shadow-[0_0_50px_color-mix(in_srgb,var(--theme-cyan)_10%,transparent)] flex overflow-hidden relative"
      >
        <div className="scan-line" />
        
        {/* Sidebar */}
        <div className="w-60 border-r border-white/10 flex flex-col bg-void/40">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-[9px] font-mono text-white/40 uppercase tracking-[0.4em]">System_Settings</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-4">
            <div>
              <h3 className="px-3 text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1.5">Options</h3>
              {categories.filter(c => c.section === 'options').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-tight transition-all",
                    activeCategory === cat.id 
                      ? "bg-white/10 text-white border-l-2 border-neon-cyan" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <cat.icon size={12} />
                  {cat.label}
                </button>
              ))}
            </div>

            <div>
              <h3 className="px-3 text-[8px] font-mono text-white/20 uppercase tracking-widest mb-1.5">Core plugins</h3>
              {categories.filter(c => c.section === 'core').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono uppercase tracking-tight transition-all",
                    activeCategory === cat.id 
                      ? "bg-white/10 text-white border-l-2 border-neon-cyan" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <cat.icon size={12} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[9px] font-mono text-white/20 uppercase">
              <ShieldCheck size={12} className="text-neon-green" />
              <span>Kernel_Secure</span>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-neon-pink transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-void/20">
          <div className="h-14 border-b border-white/10 flex items-center justify-between px-6">
            <h2 className="text-lg font-display font-black text-white uppercase tracking-[0.2em]">
              {categories.find(c => c.id === activeCategory)?.label}
            </h2>
            <button 
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center border border-white/10 text-white/40 hover:text-white hover:border-white transition-all"
            >
              <X size={16} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            {renderCategoryContent()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
