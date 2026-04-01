import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Shield, 
  Cpu, 
  Zap, 
  Activity, 
  Globe, 
  Settings, 
  ChevronRight, 
  Edit3, 
  Save, 
  X,
  LayoutDashboard,
  Database,
  Search,
  Terminal,
  Layers,
  Share2,
  Box,
  Map as MapIcon,
  Wind,
  Droplets,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Bot,
  Wand2,
  Rocket
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

interface MissionControlProps {
  setViewMode: (mode: any) => void;
}

export const MissionControl: React.FC<MissionControlProps> = ({ setViewMode }) => {
  const { settings, updateSettings } = useSettings();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<UserProfile>(
    settings.profile || {
      name: 'Commander',
      bio: 'Memori-City Administrator',
      rank: 'Novice',
      joined_at: new Date().toISOString()
    }
  );

  const agents = useLiveQuery(() => db.agents.toArray()) || [];
  const nodes = useLiveQuery(() => db.vault.toArray()) || [];
  const files = useLiveQuery(() => db.files.toArray()) || [];
  const skills = useLiveQuery(() => db.skills.toArray()) || [];

  const handleSaveProfile = async () => {
    await updateSettings({ profile: profileForm });
    setIsEditingProfile(false);
  };

  const stats = [
    { label: 'Active Agents', value: agents.length, icon: Cpu, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/20' },
    { label: 'Memory Nodes', value: nodes.length, icon: Database, color: 'text-neon-pink', bg: 'bg-neon-pink/10', border: 'border-neon-pink/20' },
    { label: 'File Assets', value: files.length, icon: Box, color: 'text-neon-green', bg: 'bg-neon-green/10', border: 'border-neon-green/20' },
    { label: 'Active Skills', value: skills.filter(s => s.is_active).length, icon: Zap, color: 'text-neon-yellow', bg: 'bg-neon-yellow/10', border: 'border-neon-yellow/20' },
  ];

  const navigationItems = [
    { id: 'city', label: 'City View', icon: Globe, description: '3D spatial memory visualization', color: 'text-neon-cyan', glow: 'shadow-neon-cyan/20' },
    { id: 'graph', label: 'Knowledge Graph', icon: Share2, description: 'Semantic relationship mapping', color: 'text-neon-purple', glow: 'shadow-neon-purple/20' },
    { id: 'files', label: 'Vault Explorer', icon: Database, description: 'Local-first file management', color: 'text-neon-green', glow: 'shadow-neon-green/20' },
    { id: 'skills', label: 'Skill Forge', icon: Zap, description: 'Agent tool configuration', color: 'text-neon-yellow', glow: 'shadow-neon-yellow/20' },
    { id: 'research', label: 'Deep Research', icon: Search, description: 'Autonomous knowledge synthesis', color: 'text-neon-pink', glow: 'shadow-neon-pink/20' },
    { id: 'commons', label: 'Knowledge Commons', icon: Layers, description: 'Shared intelligence pool', color: 'text-neon-blue', glow: 'shadow-neon-blue/20' },
    { id: 'hermes', label: 'Hermes Workspace', icon: Bot, description: 'Native agent orchestration', color: 'text-neon-pink', glow: 'shadow-neon-pink/20' },
  ];

  const agentTypes = [
    { type: 'janitor', label: 'Janitor', icon: Wind, color: 'text-neon-cyan', description: 'Cleans and optimizes memory nodes' },
    { type: 'linker', label: 'Linker', icon: Share2, color: 'text-neon-purple', description: 'Discovers semantic relationships' },
    { type: 'researcher', label: 'Researcher', icon: Search, color: 'text-neon-pink', description: 'Synthesizes knowledge from web/files' },
    { type: 'archivist', label: 'Archivist', icon: Database, color: 'text-neon-green', description: 'Organizes and tags incoming data' },
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-void relative p-8 custom-scrollbar">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-cyan/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-purple/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="dither-overlay opacity-5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-1 bg-neon-cyan shadow-[0_0_10px_var(--theme-cyan)]" />
              <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-[0.5em]">System_Status: Operational</span>
            </div>
            <h1 className="text-3xl font-display font-black text-white tracking-tighter chromatic-aberration leading-none">
              MISSION_CONTROL
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Kernel_Uptime</p>
              <p className="text-base font-display font-bold text-white">14:22:09</p>
            </div>
            <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Activity className="w-6 h-6 text-neon-cyan animate-pulse relative z-10" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Profile Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="xl:col-span-8 glass-panel p-8 rounded-3xl border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent"
          >
            <div className="flex items-start gap-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl border-2 border-neon-cyan/30 bg-void overflow-hidden relative transition-all group-hover:border-neon-cyan group-hover:shadow-[0_0_30px_rgba(5,255,255,0.2)]">
                  {settings.profile?.avatar ? (
                    <img src={settings.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neon-cyan/5">
                      <User className="w-10 h-10 text-neon-cyan/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-neon-cyan/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit3 className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-neon-cyan text-void text-[7px] font-black uppercase tracking-[0.2em] rounded-full shadow-[0_0_20px_rgba(5,255,255,0.4)]">
                  {settings.profile?.rank || 'Novice'}
                </div>
              </div>

              <div className="flex-1 pt-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-neon-cyan" />
                    <span className="text-[9px] font-mono text-neon-cyan uppercase tracking-widest">Commander_Profile</span>
                  </div>
                  <button 
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="flex items-center gap-2 text-[9px] font-mono text-white/40 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    {isEditingProfile ? <X size={12} /> : <Edit3 size={12} />}
                    {isEditingProfile ? 'Cancel' : 'Edit_Profile'}
                  </button>
                </div>

                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-mono text-white/40 uppercase mb-1.5 block">Commander_Name</label>
                        <input 
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-neon-cyan outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-white/40 uppercase mb-1.5 block">Rank_Title</label>
                        <input 
                          type="text"
                          value={profileForm.rank}
                          onChange={(e) => setProfileForm({ ...profileForm, rank: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-neon-cyan outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-white/40 uppercase mb-1.5 block">Mission_Bio</label>
                      <textarea 
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-neon-cyan outline-none h-20 resize-none transition-colors"
                      />
                    </div>
                    <button 
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-6 py-3 bg-neon-cyan text-void font-black text-[10px] uppercase tracking-[0.2em] rounded-lg hover:bg-white transition-all shadow-[0_0_20px_rgba(5,255,255,0.2)]"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Commit_Changes
                    </button>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-display font-black text-white mb-2 tracking-tighter">
                      {settings.profile?.name || 'Commander'}
                    </h2>
                    <p className="text-sm text-white/60 font-mono leading-relaxed mb-4 max-w-2xl">
                      {settings.profile?.bio || 'Memori-City Administrator. Managing local-first agentic memory kernels.'}
                    </p>
                    <div className="flex items-center gap-6">
                      <div className="group cursor-default">
                        <p className="text-[9px] font-mono text-white/40 uppercase mb-1 tracking-widest group-hover:text-neon-cyan transition-colors">Joined_At</p>
                        <p className="text-xs font-mono text-white/80">
                          {new Date(settings.profile?.joined_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="group cursor-default">
                        <p className="text-[9px] font-mono text-white/40 uppercase mb-1 tracking-widest group-hover:text-neon-cyan transition-colors">Security_Level</p>
                        <p className="text-xs font-mono text-neon-cyan uppercase font-bold tracking-widest">Level_Alpha_Prime</p>
                      </div>
                      <div className="group cursor-default">
                        <p className="text-[9px] font-mono text-white/40 uppercase mb-1 tracking-widest group-hover:text-neon-cyan transition-colors">Neural_Sync</p>
                        <p className="text-xs font-mono text-neon-green uppercase font-bold tracking-widest">Synchronized</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Column */}
          <div className="xl:col-span-4 grid grid-cols-1 gap-4">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "glass-panel p-5 flex items-center gap-5 group cursor-default hover:bg-white/[0.05] transition-all",
                  stat.border
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg",
                  stat.bg
                )}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <div>
                  <p className="text-xl font-display font-black text-white mb-0.5 tracking-tighter">{stat.value}</p>
                  <p className="text-[8px] font-mono text-white/40 uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6 px-4">
            <LayoutDashboard className="w-4 h-4 text-neon-cyan" />
            <h3 className="text-base font-display font-black text-white uppercase tracking-[0.3em]">
              SYSTEM_NAVIGATION
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {navigationItems.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setViewMode(item.id)}
                className="glass-panel p-6 flex flex-col items-start gap-4 hover:bg-white/[0.05] group text-left transition-all hover:-translate-y-1"
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-current transition-all shadow-xl",
                  item.color,
                  item.glow
                )}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="w-full">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={cn("text-sm font-black uppercase tracking-widest transition-colors", item.color)}>{item.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[10px] text-white/40 font-mono leading-relaxed">{item.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Agent Configuration Section */}
        <div className="mt-12">
          <div className="flex items-center gap-3 mb-6 px-4">
            <Bot className="w-4 h-4 text-neon-purple" />
            <h3 className="text-base font-display font-black text-white uppercase tracking-[0.3em]">
              AGENT_CONFIGURATIONS
            </h3>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {agentTypes.map((agent, i) => (
              <motion.div
                key={agent.type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-6 border-white/5 hover:border-neon-purple/30 transition-all group"
              >
                <div className={cn("w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", agent.color)}>
                  <agent.icon size={20} />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">{agent.label}</h4>
                <p className="text-[9px] text-white/40 font-mono leading-relaxed mb-4">{agent.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-[9px] font-mono text-white/20 uppercase">Status</span>
                  <span className="text-[9px] font-mono text-neon-green uppercase">Ready</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Grid: Checklist & Security */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="glass-panel p-6 border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                <Terminal className="w-3.5 h-3.5 text-neon-cyan" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Setup_Checklist</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Initialize Memory Vault', done: nodes.length > 0, desc: 'Create your first neural node' },
                { label: 'Configure LLM Kernel', done: !!settings.llm.apiKey || settings.llm.provider === 'ollama', desc: 'Connect to intelligence provider' },
                { label: 'Deploy First Pico-Agent', done: agents.length > 0, desc: 'Spawn an autonomous worker' },
                { label: 'Map Semantic District', done: nodes.some(n => n.district), desc: 'Categorize your knowledge base' },
                { label: 'Forge Custom Skill', done: skills.some(s => s.category === 'custom'), desc: 'Extend agent capabilities' }
              ].map((step, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-4 h-4 rounded-full flex items-center justify-center transition-all",
                      step.done ? "bg-neon-green/20 text-neon-green" : "border border-white/20 text-white/20"
                    )}>
                      {step.done ? <CheckCircle2 size={10} /> : <div className="w-1 h-1 rounded-full bg-current" />}
                    </div>
                    <div>
                      <span className={cn("text-[11px] font-bold block mb-0.5 transition-colors", step.done ? 'text-white' : 'text-white/40')}>
                        {step.label}
                      </span>
                      <span className="text-[8px] font-mono text-white/20 uppercase tracking-wider">{step.desc}</span>
                    </div>
                  </div>
                  {!step.done && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neon-yellow/10 border border-neon-yellow/20 rounded-full">
                      <div className="w-1 h-1 rounded-full bg-neon-yellow animate-pulse" />
                      <span className="text-[7px] font-mono text-neon-yellow uppercase font-bold">Required</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 bg-gradient-to-br from-neon-cyan/5 to-transparent border-neon-cyan/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-neon-cyan" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Security_Overview</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-3 group">
                <div className="p-1.5 rounded-xl bg-neon-green/10 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-4 h-4 text-neon-green" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white mb-1 uppercase tracking-widest">Local-First_Encryption</p>
                  <p className="text-[9px] text-white/40 font-mono leading-relaxed">All memory nodes are encrypted using your local kernel secret. No data leaves your machine unless explicitly synced via encrypted channels.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 group">
                <div className="p-1.5 rounded-xl bg-neon-yellow/10 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-4 h-4 text-neon-yellow" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-white mb-1 uppercase tracking-widest">Agent_Sandbox_Active</p>
                  <p className="text-[9px] text-white/40 font-mono leading-relaxed">Pico-agents operate in a restricted sandbox environment. They can only access nodes and files within your vault, preventing unauthorized data exfiltration.</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-neon-green" />
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Kernel_Integrity_Index</span>
                  </div>
                  <span className="text-[10px] font-mono text-neon-green font-bold">99.99%</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '99.99%' }}
                    className="h-full bg-neon-green shadow-[0_0_15px_rgba(5,255,161,0.6)] rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
