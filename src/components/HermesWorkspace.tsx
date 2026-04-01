import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Terminal as TerminalIcon, 
  Zap, 
  Database, 
  Send, 
  Cpu, 
  Activity, 
  Shield, 
  Layers, 
  Search, 
  Settings, 
  ChevronRight, 
  Play, 
  Square,
  RefreshCw,
  Eye,
  Code,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { cn } from '../lib/utils';
import { CodecPanel } from './CodecPanel';

interface Message {
  id: string;
  role: 'user' | 'hermes';
  content: string;
  timestamp: string;
}

export const HermesWorkspace: React.FC<{ hideHeader?: boolean }> = ({ hideHeader = false }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'terminal' | 'skills' | 'memory' | 'inspector'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'hermes', content: 'Hermes Protocol Initialized. Awaiting orchestration commands.', timestamp: new Date().toISOString() }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[SYSTEM]: Hermes Kernel v4.2.0-stable initialized.',
    '[AUTH]: Commander authenticated via Neural-Link.',
    '[NETWORK]: Connected to Memori-Swarm-Mesh.',
    '[AGENT]: H-01 Hermes Agent online and standing by.'
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const agents = useLiveQuery(() => db.agents.toArray()) || [];
  const nodes = useLiveQuery(() => db.vault.toArray()) || [];
  const skills = useLiveQuery(() => db.skills.toArray()) || [];

  const hermesAgent = agents.find(a => a.agent_type === 'hermes' || a.agent_id.includes('hermes'));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const handleSendMessage = async () => {
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setTerminalLogs(prev => [...prev, `[USER_INPUT]: ${input}`]);
    setInput('');
    setIsProcessing(true);

    // Simulate Hermes response
    setTimeout(() => {
      const hermesMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'hermes',
        content: `Acknowledged. Processing request via Hermes-Thinking Swarm. Analyzing ${nodes.length} memory nodes and ${skills.length} active skills.`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, hermesMsg]);
      setTerminalLogs(prev => [...prev, `[HERMES_EXEC]: Processing command...`, `[SYSTEM]: Found ${nodes.length} nodes in vault.`, `[SYSTEM]: ${skills.length} skills available.`]);
      setIsProcessing(false);
    }, 1500);
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageSquare, color: 'text-neon-pink' },
    { id: 'terminal', label: 'Terminal', icon: TerminalIcon, color: 'text-neon-cyan' },
    { id: 'skills', label: 'Skills', icon: Zap, color: 'text-neon-yellow' },
    { id: 'memory', label: 'Memory', icon: Database, color: 'text-neon-purple' },
    { id: 'inspector', label: 'Inspector', icon: Eye, color: 'text-neon-blue' },
  ];

  return (
    <div className="flex flex-col h-full bg-void overflow-hidden">
      {/* Workspace Header */}
      {!hideHeader && (
        <div className="p-4 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between bg-neon-pink/5 relative overflow-hidden gap-4">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-neon-pink/30" />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 battle-border bg-void flex items-center justify-center group">
              <Bot className="w-6 h-6 text-neon-pink group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h2 className="text-sm font-display font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                HERMES_WORKSPACE_V1
                <span className="text-[8px] font-mono text-neon-pink bg-neon-pink/10 px-1.5 py-0.5 rounded border border-neon-pink/20">
                  ACTIVE_KERNEL
                </span>
              </h2>
              <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
                Native Orchestration Environment // エージェントワークスペース
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 justify-between md:justify-end">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-[8px] font-mono text-white/40 uppercase">Agent_Status</p>
                <p className={cn("text-[10px] font-mono font-bold uppercase", hermesAgent?.status === 'running' ? "text-neon-green" : "text-neon-yellow")}>
                  {hermesAgent?.status || 'OFFLINE'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[8px] font-mono text-white/40 uppercase">Neural_Sync</p>
                <p className="text-[10px] font-mono font-bold text-neon-cyan uppercase">98.4%</p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10 hidden md:block" />
            <div className="flex gap-1">
              {/* Desktop Tabs */}
              <div className="hidden md:flex gap-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "px-4 py-2 flex items-center gap-2 transition-all border-b-2",
                      activeTab === tab.id 
                        ? "border-neon-pink bg-neon-pink/10 text-white" 
                        : "border-transparent text-white/40 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <tab.icon size={14} className={activeTab === tab.id ? tab.color : ''} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tabs (Scrollable or Icon-only) */}
      <div className="md:hidden flex border-b border-white/10 bg-void/50 overflow-x-auto custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 min-w-[70px] py-3 flex flex-col items-center gap-1 transition-all border-b-2",
              activeTab === tab.id 
                ? "border-neon-pink bg-neon-pink/10 text-white" 
                : "border-transparent text-white/40"
            )}
          >
            <tab.icon size={16} className={activeTab === tab.id ? tab.color : ''} />
            <span className="text-[8px] font-mono uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col h-full p-4 gap-4"
            >
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[80%] gap-1",
                      msg.role === 'user' ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className="flex items-center gap-2 px-2">
                      <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
                        {msg.role === 'hermes' ? 'HERMES_AGENT' : 'COMMANDER'}
                      </span>
                      <span className="text-[8px] font-mono text-white/10">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className={cn(
                      "p-3 rounded-lg border font-mono text-xs leading-relaxed",
                      msg.role === 'hermes' 
                        ? "bg-neon-pink/5 border-neon-pink/20 text-white/90" 
                        : "bg-white/5 border-white/10 text-neon-cyan"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-neon-pink animate-pulse">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-mono uppercase tracking-widest">Hermes is thinking...</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2 p-2 bg-void/50 border border-white/10 rounded-xl">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Enter command or query for Hermes..."
                  className="flex-1 bg-transparent border-none outline-none text-white font-mono text-xs px-2"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isProcessing}
                  className="p-2 bg-neon-pink text-void rounded-lg hover:bg-white transition-all disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'terminal' && (
            <motion.div 
              key="terminal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-4 flex flex-col gap-4"
            >
              <div className="flex-1 glass-panel p-4 border-white/10 bg-void/50 font-mono text-[11px] overflow-y-auto custom-scrollbar">
                {terminalLogs.map((log, i) => (
                  <div key={i} className={cn(
                    "mb-1",
                    log.startsWith('[SYSTEM]') ? "text-neon-green" :
                    log.startsWith('[AUTH]') ? "text-neon-yellow" :
                    log.startsWith('[USER_INPUT]') ? "text-neon-cyan" :
                    log.startsWith('[HERMES_EXEC]') ? "text-neon-pink" :
                    "text-white/60"
                  )}>
                    {log}
                  </div>
                ))}
                <div ref={terminalEndRef} />
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-neon-pink tracking-widest">HERMES_OS:</span>
                  <input 
                    type="text" 
                    className="flex-1 bg-transparent border-none outline-none text-white"
                    placeholder="Enter system command..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value;
                        if (val.trim()) {
                          setTerminalLogs(prev => [...prev, `[USER_INPUT]: ${val}`]);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div 
              key="skills"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-4 overflow-y-auto custom-scrollbar"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map(skill => (
                  <div key={skill.id} className="glass-panel p-4 border-white/10 hover:border-neon-yellow/30 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded bg-neon-yellow/10 flex items-center justify-center text-neon-yellow border border-neon-yellow/20">
                        <Zap size={16} />
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase",
                        skill.is_active ? "bg-neon-green/20 text-neon-green" : "bg-white/10 text-white/40"
                      )}>
                        {skill.is_active ? 'Active' : 'Disabled'}
                      </div>
                    </div>
                    <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">{skill.name}</h4>
                    <p className="text-[10px] text-white/40 font-mono leading-relaxed mb-4 line-clamp-2">{skill.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <span className="text-[8px] font-mono text-white/20 uppercase">Category: {skill.category}</span>
                      <button className="text-[8px] font-mono text-neon-cyan hover:underline uppercase tracking-widest">Configure</button>
                    </div>
                  </div>
                ))}
                <button className="glass-panel p-4 border-dashed border-white/20 flex flex-col items-center justify-center gap-2 hover:border-neon-pink/50 hover:bg-neon-pink/5 transition-all group">
                  <div className="w-10 h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center group-hover:border-neon-pink transition-all">
                    <Sparkles className="w-5 h-5 text-white/20 group-hover:text-neon-pink" />
                  </div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Forge_New_Skill</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'memory' && (
            <motion.div 
              key="memory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-4 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-neon-purple" />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Memory_Index</h3>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div className="flex items-center gap-2 text-[10px] font-mono text-white/40">
                    <Search size={12} />
                    <input type="text" placeholder="Search memory nodes..." className="bg-transparent border-none outline-none text-white" />
                  </div>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-mono text-neon-cyan hover:text-white transition-colors">
                  <RefreshCw size={12} />
                  REFRESH_INDEX
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {nodes.slice(0, 20).map(node => (
                  <div key={node.id} className="p-3 bg-white/[0.02] border border-white/5 hover:border-neon-purple/30 transition-all group flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded bg-neon-purple/10 flex items-center justify-center text-neon-purple border border-neon-purple/20">
                        <Layers size={14} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono font-bold text-white uppercase">{node.node_id}</span>
                          <span className="text-[8px] font-mono text-neon-cyan bg-neon-cyan/10 px-1 rounded uppercase tracking-widest">{node.district}</span>
                        </div>
                        <p className="text-[9px] font-mono text-white/40 uppercase truncate max-w-md">{node.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[8px] font-mono text-white/20 uppercase">Last_Sync</p>
                        <p className="text-[8px] font-mono text-white/40">{new Date(node.modified_at).toLocaleDateString()}</p>
                      </div>
                      <button className="p-2 text-white/20 hover:text-neon-cyan transition-colors">
                        <Eye size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'inspector' && (
            <motion.div 
              key="inspector"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 p-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 border-neon-blue/20 bg-neon-blue/5">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Bot size={16} className="text-neon-blue" />
                    Agent_Core_Config
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Agent_ID', value: hermesAgent?.agent_id || 'H-01' },
                      { label: 'Agent_Type', value: 'HERMES_ORCHESTRATOR' },
                      { label: 'Neural_Model', value: 'GEMINI-3.1-PRO' },
                      { label: 'Memory_Context', value: '128K_TOKENS' },
                      { label: 'Thinking_Level', value: 'HIGH_REASONING' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                        <span className="text-[10px] font-mono text-white/40 uppercase">{item.label}</span>
                        <span className="text-[10px] font-mono text-white font-bold uppercase">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6 border-neon-pink/20 bg-neon-pink/5">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Activity size={16} className="text-neon-pink" />
                    Live_Telemetry
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-[10px] font-mono mb-2">
                        <span className="text-white/40 uppercase">Cognitive_Load</span>
                        <span className="text-neon-pink">24%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-pink w-[24%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-mono mb-2">
                        <span className="text-white/40 uppercase">Task_Efficiency</span>
                        <span className="text-neon-cyan">92%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-cyan w-[92%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-mono mb-2">
                        <span className="text-white/40 uppercase">Memory_Recall_Speed</span>
                        <span className="text-neon-yellow">12ms</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-neon-yellow w-[78%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-6 border-white/10 bg-void/30">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Code size={16} className="text-neon-purple" />
                  Internal_State_JSON
                </h3>
                <pre className="text-[10px] font-mono text-white/60 bg-void/50 p-4 rounded border border-white/5 overflow-x-auto">
                  {JSON.stringify({
                    agent: {
                      id: hermesAgent?.agent_id || 'H-01',
                      status: hermesAgent?.status || 'sleeping',
                      last_sync: new Date().toISOString(),
                      active_tasks: 0,
                      neural_mesh: 'connected'
                    },
                    environment: {
                      district: 'CORE',
                      nodes_indexed: nodes.length,
                      skills_active: skills.filter(s => s.is_active).length
                    }
                  }, null, 2)}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sidebar Info (Optional) */}
      <div className="w-64 border-l border-white/10 bg-void/30 p-4 hidden xl:block">
        <div className="space-y-6">
          <div>
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield size={12} className="text-neon-cyan" />
              Security_Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/40 uppercase">Kernel_Lock</span>
                <span className="text-[9px] font-mono text-neon-green uppercase">Engaged</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/40 uppercase">Sandbox_Mode</span>
                <span className="text-[9px] font-mono text-neon-green uppercase">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono text-white/40 uppercase">Data_Exfil_Guard</span>
                <span className="text-[9px] font-mono text-neon-green uppercase">Enabled</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <Cpu size={12} className="text-neon-purple" />
              Resource_Usage
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[8px] font-mono mb-1">
                  <span className="text-white/40 uppercase">Neural_Load</span>
                  <span className="text-neon-cyan">42%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-cyan w-[42%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[8px] font-mono mb-1">
                  <span className="text-white/40 uppercase">Memory_Pressure</span>
                  <span className="text-neon-purple">18%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-neon-purple w-[18%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="p-3 bg-neon-pink/5 border border-neon-pink/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={12} className="text-neon-pink" />
                <span className="text-[9px] font-mono text-neon-pink font-bold uppercase tracking-widest">Hermes_Insight</span>
              </div>
              <p className="text-[9px] font-mono text-white/60 leading-relaxed italic">
                "Semantic density in the RESEARCH district has increased by 12% following the last import protocol."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
