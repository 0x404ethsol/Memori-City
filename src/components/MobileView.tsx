import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Database, 
  MessageSquare, 
  Plus, 
  Settings, 
  Zap, 
  Activity,
  FileUp,
  Search,
  ChevronRight,
  User,
  Cpu,
  FolderOpen,
  HardDrive,
  Globe,
  Layers,
  X,
  Mic,
  Share2,
  FlaskConical,
  FileCode,
  Users,
  Menu,
  QrCode,
  Download,
  Wifi,
  Battery,
  Signal,
  LayoutDashboard,
  Bot
} from 'lucide-react';
import { MissionControl } from './MissionControl';
import { HermesWorkspace } from './HermesWorkspace';
import { MemoriNode, AgentRecord } from '../types';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { cn } from '../lib/utils';
import { ImportDock } from './ImportDock';
import { GlitchText } from './GlitchText';
import { haptics } from '../lib/haptics';
import { QRCodeCanvas } from 'qrcode.react';
import { NeuralPulse } from './NeuralPulse';
import { DitherBackground } from './DitherBackground';

interface MobileViewProps {
  nodes: MemoriNode[];
  agents: AgentRecord[];
  onOpenSettings: () => void;
  onMountObsidian: () => void;
  onSetActiveImport: (type: 'text' | 'file' | 'url' | 'voice' | 'obsidian' | null) => void;
  activeImport: 'text' | 'file' | 'url' | 'voice' | 'obsidian' | null;
  onSetViewMode: (mode: 'graph' | 'city' | 'skills' | 'research' | 'files' | 'commons') => void;
  onOpenSkillManager: (agent: AgentRecord) => void;
  onOpenHermesImport: () => void;
  globalSearchQuery: string;
  onSetGlobalSearchQuery: (q: string) => void;
  globalSearchResults: {
    nodes: MemoriNode[];
    files: any[];
    skills: any[];
  };
}

export const MobileView: React.FC<MobileViewProps> = ({ 
  nodes, 
  agents, 
  onOpenSettings,
  onMountObsidian,
  onSetActiveImport,
  activeImport,
  onSetViewMode,
  onOpenSkillManager,
  onOpenHermesImport,
  globalSearchQuery,
  onSetGlobalSearchQuery,
  globalSearchResults
}) => {
  const [activeTab, setActiveTab] = useState<'memory' | 'agents' | 'import' | 'chat' | 'system' | 'mission' | 'hermes'>('mission');
  const [selectedAgent, setSelectedAgent] = useState<AgentRecord | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString());
  const [isBooting, setIsBooting] = useState(true);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [systemLoad, setSystemLoad] = useState(42.8);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 150);
      }
    }, 2000);
    return () => clearInterval(glitchInterval);
  }, []);

  useEffect(() => {
    const logs = [
      'INITIALIZING_KERNEL_V4.2...',
      'ESTABLISHING_NEURAL_LINK...',
      'SYNCING_MEMORY_VAULT...',
      'ENCRYPTING_CHANNELS...',
      'SWARM_INTELLIGENCE_ONLINE',
      'WELCOME_OPERATOR'
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < logs.length) {
        setBootLogs(prev => [...prev, logs[i]]);
        haptics.light();
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsBooting(false), 500);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString());
      setSystemLoad(prev => {
        const delta = (Math.random() - 0.5) * 2;
        return Math.min(Math.max(prev + delta, 30), 80);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTabChange = (tab: any) => {
    haptics.double();
    setActiveTab(tab);
  };

  const handleAction = (action: () => void) => {
    haptics.medium();
    action();
  };

  const appUrl = window.location.href;

  return (
    <div className={cn(
      "fixed inset-0 bg-void flex flex-col text-white overflow-hidden font-sans select-none transition-all duration-75",
      isGlitching && "skew-x-1 scale-[1.01] brightness-125 contrast-150"
    )}>
      <DitherBackground />
      <NeuralPulse />
      {/* Boot Sequence Overlay */}
      <AnimatePresence>
        {isBooting && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-void flex flex-col items-center justify-center p-8 font-mono"
          >
            <div className="w-full max-w-xs space-y-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 border-2 border-neon-cyan flex items-center justify-center animate-pulse">
                  <Brain size={32} className="text-neon-cyan" />
                </div>
                <div>
                  <h1 className="text-lg font-display font-black italic text-white tracking-tighter">MEMORI_CITY</h1>
                  <div className="text-[8px] text-neon-cyan/60 tracking-[0.3em]">MOBILE_KERNEL_V4.2</div>
                </div>
              </div>
              <div className="space-y-1">
                {bootLogs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] text-neon-cyan/80 flex items-center gap-2"
                  >
                    <span className="text-neon-cyan/40">{'>'}</span>
                    {log}
                  </motion.div>
                ))}
              </div>
              <div className="mt-8 h-1 w-full bg-white/5 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="h-full bg-neon-cyan shadow-[0_0_15px_var(--theme-cyan)]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRT & Scanline Overlays */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.02] animate-pulse bg-[radial-gradient(circle,transparent_50%,black_100%)]" />

      {/* Top Status Bar (Agentic Feel) */}
      <div className="h-6 px-4 flex items-center justify-between bg-black/40 border-b border-white/5 text-[8px] font-mono tracking-widest text-white/40 z-40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Signal size={8} className="text-neon-cyan animate-pulse" />
            <span className="animate-pulse">LINK_ESTABLISHED</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi size={8} className="text-neon-green" />
            <span>ENCRYPTED_CH_04</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Activity size={8} className="text-neon-pink" />
            <span>LOAD: {systemLoad.toFixed(1)}%</span>
          </div>
          <span>{systemTime}</span>
          <div className="flex items-center gap-1">
            <Battery size={8} className="text-neon-yellow" />
            <span>98%</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="h-14 border-b border-neon-cyan/20 flex items-center justify-between px-4 bg-void/80 backdrop-blur-md z-30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent" />
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center relative group overflow-hidden">
            <div className="absolute inset-0 bg-neon-cyan/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Brain size={18} className="text-neon-cyan relative z-10" />
          </div>
          <div>
            <h1 className="text-sm leading-none">
              <GlitchText text="MemoriCity" className="text-white" />
            </h1>
            <div className="text-[7px] font-mono text-neon-cyan/60 uppercase tracking-[0.3em] mt-1">
              Mobile_Kernel_v4.2
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleAction(() => setIsSearchOpen(true))}
            className="p-2 text-white/40 hover:text-neon-cyan active:scale-90 transition-all"
          >
            <Search size={18} />
          </button>
          <button 
            onClick={() => handleAction(() => setIsQRModalOpen(true))}
            className="p-2 text-white/40 hover:text-neon-purple active:scale-90 transition-all"
          >
            <QrCode size={18} />
          </button>
          <button 
            onClick={() => handleAction(onOpenSettings)}
            className="p-2 text-white/40 hover:text-neon-pink active:scale-90 transition-all"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Agent Activity Ticker Removed */}
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 relative">
        <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {activeTab === 'mission' && (
            <motion.div
              key="mission"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-1 h-full overflow-y-auto"
            >
              <MissionControl setViewMode={(mode) => {
                onSetViewMode(mode);
                if (mode === 'city' || mode === 'graph') setActiveTab('memory');
                if (mode === 'skills') setActiveTab('agents');
                if (mode === 'files') setActiveTab('system');
                if (mode === 'hermes') setActiveTab('hermes');
              }} />
            </motion.div>
          )}

          {activeTab === 'memory' && (
            <motion.div
              key="memory"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 space-y-6"
            >
              <div className="flex items-center justify-between border-l-2 border-neon-cyan pl-3">
                <div>
                  <h2 className="text-xs font-mono text-neon-cyan uppercase tracking-[0.2em]">Memory_Vault</h2>
                  <div className="text-[7px] font-mono text-white/20 uppercase">Local_Storage_Sync_Active</div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleAction(() => setActiveTab('import'))}
                    className="w-8 h-8 bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan active:bg-neon-cyan active:text-void transition-all"
                  >
                    <Plus size={16} />
                  </button>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-white/60">{nodes.length}</div>
                    <div className="text-[6px] font-mono text-white/20 uppercase tracking-tighter">Kernels</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {nodes.slice(0, 15).map((node, i) => (
                  <motion.div 
                    key={node.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 bg-white/[0.02] border border-white/5 hover:border-neon-cyan/30 transition-all relative group active:bg-white/[0.05]"
                  >
                    <div className="absolute top-0 right-0 w-16 h-16 bg-neon-cyan/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-2 relative z-10">
                      <span className="text-[8px] font-mono text-neon-cyan/40 uppercase tracking-widest">{node.memori_uri}</span>
                      <div className="flex gap-1">
                        <span className={cn(
                          "text-[6px] font-mono px-1 border uppercase tracking-tighter",
                          node.is_public ? "border-neon-green/40 text-neon-green" : "border-neon-pink/40 text-neon-pink"
                        )}>
                          {node.is_public ? 'PUB' : 'PRV'}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-white/70 line-clamp-2 leading-relaxed font-sans relative z-10">
                      {node.summary || node.content}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1 relative z-10">
                      {node.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[7px] font-mono text-white/20 uppercase bg-white/5 px-1">#{tag}</span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'agents' && (
            <motion.div
              key="agents"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-4 space-y-6"
            >
              <div className="flex items-center justify-between border-l-2 border-neon-pink pl-3">
                <div>
                  <h2 className="text-xs font-mono text-neon-pink uppercase tracking-[0.2em]">Agent_Swarm</h2>
                  <div className="text-[7px] font-mono text-white/20 uppercase">Neural_Network_Online</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-neon-pink">{agents.length}</div>
                  <div className="text-[6px] font-mono text-white/20 uppercase tracking-tighter">Active_Nodes</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {agents.map((agent, i) => (
                  <motion.div 
                    key={agent.id} 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => handleAction(() => {
                      setSelectedAgent(agent);
                      setActiveTab('chat');
                    })}
                    className="p-4 bg-void border border-neon-pink/20 relative overflow-hidden group active:bg-neon-pink/5 transition-all"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-neon-pink/40" />
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Cpu size={64} className="text-neon-pink" />
                    </div>
                    
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 flex items-center justify-center border transition-all",
                          agent.status === 'running' ? "border-neon-green/40 bg-neon-green/5 shadow-[0_0_10px_rgba(0,255,0,0.1)]" : "border-white/10"
                        )}>
                          <Cpu size={20} className={agent.status === 'running' ? "text-neon-green" : "text-white/20"} />
                        </div>
                        <div>
                          <div className="text-[10px] font-display font-black text-white uppercase tracking-widest">{agent.agent_type}</div>
                          <div className="text-[8px] font-mono text-white/40 uppercase">{agent.agent_id}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={cn(
                          "text-[8px] font-mono uppercase flex items-center gap-1 justify-end",
                          agent.status === 'running' ? "text-neon-green" : "text-white/20"
                        )}>
                          <div className={cn("w-1 h-1 rounded-full", agent.status === 'running' ? "bg-neon-green animate-pulse" : "bg-white/20")} />
                          {agent.status}
                        </div>
                        {agent.current_task && (
                          <div className="text-[7px] font-mono text-neon-yellow uppercase mt-1 max-w-[100px] truncate">
                            {agent.current_task}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div
              key="system"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-4 space-y-6"
            >
              <div className="flex items-center justify-between border-l-2 border-neon-cyan pl-3">
                <div>
                  <h2 className="text-xs font-mono text-neon-cyan uppercase tracking-[0.2em]">System_Core</h2>
                  <div className="text-[7px] font-mono text-white/20 uppercase">Architecture_Manager</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white/[0.02] border border-white/5 flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[8px] font-mono text-white/40 uppercase">Memory_Pressure</div>
                  <div className="text-xl font-display font-black text-neon-cyan">{systemLoad.toFixed(1)}%</div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: `${systemLoad}%` }}
                      className="h-full bg-neon-cyan shadow-[0_0_10px_var(--theme-cyan)]" 
                    />
                  </div>
                </div>
                <div className="p-4 bg-white/[0.02] border border-white/5 flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[8px] font-mono text-white/40 uppercase">Cycle_Load</div>
                  <div className="text-xl font-display font-black text-neon-purple">1.2ms</div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      animate={{ width: '65%' }}
                      className="h-full bg-neon-purple shadow-[0_0_10px_var(--theme-purple)]" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[9px] font-mono text-white/40 uppercase tracking-widest">System_Architecture</h3>
                <div className="p-4 bg-white/[0.02] border border-white/5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon-cyan animate-pulse" />
                      <span className="text-[10px] font-mono text-neon-cyan uppercase">Core_Kernel</span>
                    </div>
                    <span className="text-[8px] font-mono text-white/20">V_4.2.0_STABLE</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-full h-[1px] bg-neon-cyan/10" />
                      <div className="h-full w-[1px] bg-neon-cyan/10" />
                    </div>
                    <div className="p-2 border border-neon-cyan/20 bg-void flex flex-col items-center gap-1 relative z-10">
                      <Database size={12} className="text-neon-cyan" />
                      <span className="text-[6px] font-mono uppercase">Vault</span>
                    </div>
                    <div className="p-2 border border-neon-pink/20 bg-void flex flex-col items-center gap-1 relative z-10">
                      <Cpu size={12} className="text-neon-pink" />
                      <span className="text-[6px] font-mono uppercase">Swarm</span>
                    </div>
                    <div className="p-2 border border-neon-purple/20 bg-void flex flex-col items-center gap-1 relative z-10">
                      <Globe size={12} className="text-neon-purple" />
                      <span className="text-[6px] font-mono uppercase">City</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Quick_Access</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleAction(() => onSetViewMode('graph'))}
                    className="p-4 bg-void border border-neon-cyan/20 flex flex-col items-center gap-2 active:bg-neon-cyan/5 transition-all"
                  >
                    <Layers size={20} className="text-neon-cyan" />
                    <span className="text-[8px] font-mono uppercase">Architecture</span>
                  </button>
                  <button 
                    onClick={() => handleAction(() => onSetViewMode('city'))}
                    className="p-4 bg-void border border-neon-purple/20 flex flex-col items-center gap-2 active:bg-neon-purple/5 transition-all"
                  >
                    <Globe size={20} className="text-neon-purple" />
                    <span className="text-[8px] font-mono uppercase">Districts</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-neon-cyan/5 border border-neon-cyan/20 font-mono text-[8px] leading-relaxed text-neon-cyan/80">
                <pre className="whitespace-pre-wrap">
{`[SYSTEM_LOG]
> Initializing Neural Link...
> Syncing Memory Vault...
> Swarm Intelligence Active
> All Systems Nominal`}
                </pre>
              </div>
            </motion.div>
          )}

          {activeTab === 'import' && (
            <motion.div
              key="import"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-4 space-y-6 flex-1 overflow-y-auto"
            >
              <div className="flex items-center justify-between border-l-2 border-neon-green pl-3">
                <div>
                  <h2 className="text-xs font-mono text-neon-green uppercase tracking-[0.2em]">Data_Ingress</h2>
                  <div className="text-[7px] font-mono text-white/20 uppercase">External_Link_Gateway</div>
                </div>
                {activeImport && (
                  <button 
                    onClick={() => onSetActiveImport(null)}
                    className="text-[8px] font-mono text-neon-pink uppercase tracking-widest border border-neon-pink/20 px-2 py-1"
                  >
                    [CLOSE]
                  </button>
                )}
              </div>

              {activeImport ? (
                <div className="bg-void/60 border border-neon-cyan/20 p-4 min-h-[200px] flex flex-col">
                  <div className="text-[10px] font-mono text-neon-cyan uppercase mb-4 border-b border-neon-cyan/10 pb-2">
                    PORT: {activeImport}
                  </div>
                  
                  {activeImport === 'text' && (
                    <div className="flex flex-col gap-3">
                      <textarea 
                        placeholder="Enter neural data..."
                        className="w-full h-32 bg-void/40 border border-neon-cyan/10 p-3 text-[11px] font-mono text-white outline-none focus:border-neon-cyan/40"
                      />
                      <button className="w-full py-2 bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan font-display font-black text-[10px] uppercase tracking-widest">
                        Commit_Memory
                      </button>
                    </div>
                  )}

                  {activeImport === 'url' && (
                    <div className="flex flex-col gap-3">
                      <input 
                        type="text"
                        placeholder="https://..."
                        className="w-full bg-void/40 border border-neon-cyan/10 p-3 text-[11px] font-mono text-white outline-none focus:border-neon-cyan/40"
                      />
                      <button className="w-full py-2 bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan font-display font-black text-[10px] uppercase tracking-widest">
                        Sync_Cloud
                      </button>
                    </div>
                  )}

                  {activeImport === 'voice' && (
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                      <div className="w-16 h-16 rounded-full border-2 border-neon-cyan/20 flex items-center justify-center animate-pulse">
                        <Mic size={24} className="text-neon-cyan" />
                      </div>
                      <span className="text-[8px] font-mono text-neon-cyan uppercase tracking-widest">Listening...</span>
                    </div>
                  )}

                  {activeImport === 'file' && (
                    <div className="flex flex-col items-center justify-center gap-4 py-8 border border-dashed border-neon-cyan/20">
                      <FileUp size={24} className="text-neon-cyan opacity-40" />
                      <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Awaiting_File_Stream</span>
                      <button className="px-4 py-1 bg-neon-cyan/10 border border-neon-cyan/40 text-[8px] font-mono text-neon-cyan uppercase">
                        Select_File
                      </button>
                    </div>
                  )}

                  {activeImport === 'obsidian' && (
                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                      <FolderOpen size={24} className="text-neon-purple opacity-40" />
                      <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Obsidian_Vault_Link</span>
                      <button 
                        onClick={onMountObsidian}
                        className="px-4 py-1 bg-neon-purple/10 border border-neon-purple/40 text-[8px] font-mono text-neon-purple uppercase"
                      >
                        Mount_Vault
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <ImportDock 
                    icon={FolderOpen} 
                    label="OBSIDIAN" 
                    description="MOUNT_VAULT" 
                    onClick={() => handleAction(onMountObsidian)} 
                    color="var(--theme-purple)"
                  />
                  <ImportDock 
                    icon={HardDrive} 
                    label="LOCAL_FS" 
                    description="SYNC_DRIVE" 
                    onClick={() => handleAction(() => onSetActiveImport('file'))} 
                    color="var(--theme-green)"
                  />
                  <ImportDock 
                    icon={Globe} 
                    label="CLOUD" 
                    description="SYNC_GDRIVE" 
                    onClick={() => handleAction(() => onSetActiveImport('url'))} 
                    color="var(--theme-cyan)"
                  />
                  <ImportDock 
                    icon={Brain} 
                    label="HERMES" 
                    description="LINK_MEMORY" 
                    onClick={() => handleAction(onOpenHermesImport)} 
                    color="var(--theme-pink)"
                  />
                  <ImportDock 
                    icon={Plus} 
                    label="QUICK_NOTE" 
                    description="NEW_MEMORY" 
                    onClick={() => handleAction(() => onSetActiveImport('text'))} 
                    color="var(--theme-green)"
                  />
                  <ImportDock 
                    icon={Mic} 
                    label="NEURAL_LINK" 
                    description="VOICE_STREAM" 
                    onClick={() => handleAction(() => onSetActiveImport('voice'))} 
                    color="var(--theme-cyan)"
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'hermes' && (
            <motion.div
              key="hermes"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col"
            >
              <HermesWorkspace hideHeader />
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="h-full flex flex-col p-4"
            >
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4 justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleAction(() => setActiveTab('agents'))} className="p-1 text-white/40 active:scale-90 transition-all">
                    <ChevronRight className="rotate-180" size={20} />
                  </button>
                  <div>
                    <h2 className="text-xs font-mono text-neon-cyan uppercase tracking-[0.2em]">
                      {selectedAgent ? `Link: ${selectedAgent.agent_type}` : 'Agent_Gateway'}
                    </h2>
                    <div className="text-[7px] font-mono text-neon-green uppercase flex items-center gap-1">
                      <div className="w-1 h-1 bg-neon-green rounded-full animate-pulse" />
                      Secure_Channel_Active
                    </div>
                  </div>
                </div>
                {selectedAgent && (
                  <button 
                    onClick={() => handleAction(() => onOpenSkillManager(selectedAgent))}
                    className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/40 text-[8px] font-mono text-neon-cyan uppercase tracking-widest active:bg-neon-cyan active:text-void transition-all"
                  >
                    Skills
                  </button>
                )}
              </div>

              <div className="flex-1 bg-white/[0.02] border border-white/5 p-4 overflow-y-auto space-y-4 mb-4 min-h-[300px] font-mono text-[11px] relative">
                <div className="absolute top-0 right-0 p-2 text-[6px] text-neon-cyan/20 uppercase tracking-widest">
                  ENCRYPTED_LINK_ACTIVE
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center shrink-0">
                    <Cpu size={12} className="text-neon-cyan" />
                  </div>
                  <div className="bg-void border border-neon-cyan/20 p-3 leading-relaxed text-white/80 relative">
                    <div className="absolute -left-1 top-2 w-2 h-2 bg-void border-l border-t border-neon-cyan/20 rotate-45" />
                    <span className="text-neon-cyan">SYSTEM_READY:</span> Direct communication channel open with {selectedAgent?.agent_type || 'Orchestrator'}. How can I assist with your memory city today?
                  </div>
                </div>
                
                {chatMessage && (
                  <div className="flex gap-3 justify-end">
                    <div className="bg-neon-cyan/5 border border-neon-cyan/20 p-3 leading-relaxed text-white/80 relative">
                      <div className="absolute -right-1 top-2 w-2 h-2 bg-neon-cyan/5 border-r border-t border-neon-cyan/20 rotate-45" />
                      {chatMessage}
                    </div>
                    <div className="w-6 h-6 bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center shrink-0">
                      <User size={12} className="text-neon-cyan" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Enter command..."
                  className="flex-1 bg-void border border-white/10 px-4 py-3 text-xs font-mono outline-none focus:border-neon-cyan transition-all placeholder:text-white/10"
                />
                <button className="w-12 h-12 bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center text-neon-cyan active:bg-neon-cyan active:text-void transition-all shadow-[0_0_15px_rgba(0,255,255,0.1)]">
                  <Zap size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="h-20 border-t border-neon-cyan/20 bg-void/90 backdrop-blur-xl flex items-center justify-around px-2 z-30 fixed bottom-0 left-0 right-0">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-cyan/30 to-transparent" />
        
        <NavButton 
          active={activeTab === 'mission'} 
          onClick={() => handleTabChange('mission')} 
          icon={<LayoutDashboard size={20} />} 
          label="Mission"
        />
        <NavButton 
          active={activeTab === 'memory'} 
          onClick={() => handleTabChange('memory')} 
          icon={<Database size={20} />} 
          label="Vault"
        />
        <NavButton 
          active={activeTab === 'agents'} 
          onClick={() => handleTabChange('agents')} 
          icon={<Cpu size={20} />} 
          label="Swarm"
        />
        <NavButton 
          active={activeTab === 'hermes'} 
          onClick={() => handleTabChange('hermes')} 
          icon={<Bot size={20} />} 
          label="Hermes"
        />
        <div className="relative -top-6">
          <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-full animate-pulse" />
          <button 
            onClick={() => handleTabChange('import')}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(1,205,254,0.3)] transition-all relative z-10",
              activeTab === 'import' ? "bg-neon-cyan text-void scale-110" : "bg-void border-2 border-neon-cyan text-neon-cyan"
            )}
          >
            <Plus size={28} />
          </button>
        </div>
        <NavButton 
          active={activeTab === 'system'} 
          onClick={() => handleTabChange('system')} 
          icon={<Activity size={20} />} 
          label="System"
        />
        <NavButton 
          active={false} 
          onClick={() => handleAction(() => setIsMoreMenuOpen(true))} 
          icon={<Menu size={20} />} 
          label="More"
        />
      </nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[100] bg-void/95 backdrop-blur-2xl p-6 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-cyan" size={18} />
                <input 
                  autoFocus
                  type="text"
                  value={globalSearchQuery}
                  onChange={(e) => onSetGlobalSearchQuery(e.target.value)}
                  placeholder="SEARCH_SYSTEM_VAULT..."
                  className="w-full bg-void border border-neon-cyan/40 pl-12 pr-4 py-4 text-sm font-mono text-white outline-none focus:border-neon-cyan transition-all"
                />
              </div>
              <button onClick={() => handleAction(() => { setIsSearchOpen(false); onSetGlobalSearchQuery(''); })} className="p-2 text-white/40">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pb-12">
              {globalSearchQuery && (
                <>
                  {globalSearchResults.nodes.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-mono text-neon-cyan uppercase tracking-widest border-b border-neon-cyan/20 pb-1">Memory_Nodes</h3>
                      {globalSearchResults.nodes.map(node => (
                        <button 
                          key={node.id}
                          onClick={() => handleAction(() => { setActiveTab('memory'); setIsSearchOpen(false); onSetGlobalSearchQuery(''); })}
                          className="w-full text-left p-3 bg-white/[0.02] border border-white/5 hover:border-neon-cyan/30 transition-all"
                        >
                          <div className="text-[10px] font-display font-black text-white">{node.memori_uri}</div>
                          <div className="text-[8px] font-mono text-white/40 truncate mt-1">{node.summary || node.content}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {/* ... other results ... */}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* More Menu Overlay */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="fixed inset-0 z-[100] bg-void/95 backdrop-blur-xl p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-xl font-display font-black italic tracking-tighter text-white uppercase">System_Apps</h2>
              <button onClick={() => handleAction(() => setIsMoreMenuOpen(false))} className="p-2 text-white/40">
                <X size={24} />
              </button>
            </div>

              <div className="grid grid-cols-2 gap-4">
                <AppGridButton 
                  icon={Share2} 
                  color="text-neon-cyan"
                  label="Graph_View" 
                  onClick={() => handleAction(() => { onSetViewMode('graph'); setIsMoreMenuOpen(false); })} 
                />
                <AppGridButton 
                  icon={Cpu} 
                  color="text-neon-pink"
                  label="Agent_Swarm" 
                  onClick={() => handleAction(() => { setActiveTab('agents'); setIsMoreMenuOpen(false); })} 
                />
                <AppGridButton 
                  icon={MessageSquare} 
                  color="text-neon-cyan"
                  label="Direct_Chat" 
                  onClick={() => handleAction(() => { setActiveTab('chat'); setIsMoreMenuOpen(false); })} 
                />
                <AppGridButton 
                  icon={FlaskConical} 
                  color="text-neon-purple"
                  label="Deep_Research" 
                  onClick={() => handleAction(() => { onSetViewMode('research'); setIsMoreMenuOpen(false); })} 
                />
                <AppGridButton 
                  icon={FileCode} 
                  color="text-neon-blue"
                  label="File_Editor" 
                  onClick={() => handleAction(() => { onSetViewMode('files'); setIsMoreMenuOpen(false); })} 
                />
                <AppGridButton 
                  icon={Users} 
                  color="text-neon-green"
                  label="Commons" 
                  onClick={() => handleAction(() => { onSetViewMode('commons'); setIsMoreMenuOpen(false); })} 
                />
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {isQRModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-void/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm bg-void border border-neon-purple/40 p-8 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-neon-purple" />
              <div className="absolute -right-12 -top-12 w-24 h-24 bg-neon-purple/10 blur-3xl rounded-full" />
              
              <button 
                onClick={() => handleAction(() => setIsQRModalOpen(false))}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="mb-6">
                <h3 className="text-lg font-display font-black italic tracking-tighter text-white uppercase mb-2">Deploy_Mobile_Link</h3>
                <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest leading-relaxed">
                  Scan to install the Memori-City kernel as a standalone webapp on your device.
                </p>
              </div>

              <div className="p-4 bg-white rounded-xl mb-6 shadow-[0_0_30px_rgba(255,0,255,0.2)] relative group">
                <div className="absolute inset-0 bg-neon-purple/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <QRCodeCanvas 
                  value={appUrl} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "https://picsum.photos/seed/memori/128/128",
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }}
                />
              </div>

              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2 justify-center text-[10px] font-mono text-neon-purple uppercase">
                  <Wifi size={12} className="animate-pulse" />
                  <span>Secure_Protocol_Active</span>
                </div>
                <button 
                  onClick={() => handleAction(() => {
                    haptics.success();
                    // Trigger PWA install prompt if available
                    alert('To install: Tap the share button in your browser and select "Add to Home Screen"');
                  })}
                  className="w-full py-4 bg-neon-purple/10 border border-neon-purple/40 text-neon-purple text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-neon-purple hover:text-void transition-all active:scale-95"
                >
                  <Download size={16} />
                  Install_Kernel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AppGridButton = ({ icon: Icon, label, onClick, color }: { icon: any, label: string, onClick: () => void, color?: string }) => (
  <button 
    onClick={onClick}
    className="aspect-square bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center gap-2 active:bg-white/5 transition-all group p-2"
  >
    <div className="p-2 bg-void border border-white/5 rounded-lg group-hover:border-white/20 transition-all">
      <Icon size={18} className={color} />
    </div>
    <span className="text-[8px] font-mono text-white/60 uppercase tracking-widest text-center leading-tight">{label}</span>
  </button>
);

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1 transition-all relative",
      active ? "text-neon-cyan" : "text-white/20"
    )}
  >
    {active && <motion.div layoutId="nav-glow" className="absolute -top-2 w-8 h-[2px] bg-neon-cyan shadow-[0_0_10px_var(--theme-cyan)]" />}
    {icon}
    <span className="text-[8px] font-mono uppercase tracking-widest">{label}</span>
  </button>
);
