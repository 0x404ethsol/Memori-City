import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { MemoriNode, AgentRecord } from './types';
import { CodecPanel } from './components/CodecPanel';
import { MemoriGraph } from './components/MemoriGraph';
import { MemoriCity } from './components/MemoriCity';
import { ImportDock } from './components/ImportDock';
import { KnowledgeCommons } from './components/KnowledgeCommons';
import { MemoryService } from './services/memoryService';
import { useSettings } from './contexts/SettingsContext';
import { 
  Terminal, 
  Cpu, 
  Database, 
  Activity, 
  Shield, 
  Zap, 
  Search, 
  Plus,
  RefreshCw,
  LayoutGrid,
  Building2,
  FileUp,
  Link,
  Mic,
  Brain,
  Code,
  Globe,
  FolderOpen,
  HardDrive,
  Workflow,
  Layers,
  History,
  Sparkles,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { SkillForge } from './components/SkillForge';
import { PredictiveKernel } from './components/PredictiveKernel';
import { DeepResearch } from './components/DeepResearch';
import { FileEditor } from './components/FileEditor';
import { SettingsModal } from './components/SettingsModal';
import { Settings as SettingsIcon } from 'lucide-react';

export default function App() {
  const nodes = useLiveQuery(() => db.vault.toArray()) || [];
  const agents = useLiveQuery(() => db.agents.toArray()) || [];
  
  const { settings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [viewMode, setViewMode] = useState<'graph' | 'city' | 'skills' | 'research' | 'files' | 'commons'>('city');
  const [activeImport, setActiveImport] = useState<'text' | 'file' | 'url' | 'voice' | 'obsidian' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [obsidianHandle, setObsidianHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [relevantMemories, setRelevantMemories] = useState<MemoriNode[]>([]);
  const [pruneConfirm, setPruneConfirm] = useState<{ count: number; nodes: MemoriNode[] } | null>(null);

  // Global Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<{
    nodes: MemoriNode[],
    files: any[],
    skills: any[]
  }>({ nodes: [], files: [], skills: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const memoryService = useMemo(() => settings ? new MemoryService(settings) : null, [settings]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input/textarea (unless it's a global modifier shortcut)
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

      // Cmd/Ctrl + K for Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      
      // Cmd/Ctrl + , for Settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
      }

      // Alt + 1-6 for View Modes
      if (e.altKey && !isInput) {
        switch (e.key) {
          case '1': e.preventDefault(); setViewMode('graph'); break;
          case '2': e.preventDefault(); setViewMode('city'); break;
          case '3': e.preventDefault(); setViewMode('skills'); break;
          case '4': e.preventDefault(); setViewMode('research'); break;
          case '5': e.preventDefault(); setViewMode('files'); break;
          case '6': e.preventDefault(); setViewMode('commons'); break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!globalSearchQuery.trim()) {
        setGlobalSearchResults({ nodes: [], files: [], skills: [] });
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      const query = globalSearchQuery.toLowerCase();

      try {
        const [foundNodes, foundFiles, foundSkills] = await Promise.all([
          db.vault.filter(node => 
            node.memori_uri.toLowerCase().includes(query) || 
            node.content.toLowerCase().includes(query) ||
            node.tags?.some(tag => tag.toLowerCase().includes(query))
          ).toArray(),
          db.files.filter(file => 
            file.name.toLowerCase().includes(query) || 
            (file.content && file.content.toLowerCase().includes(query))
          ).toArray(),
          db.skills.filter(skill => 
            skill.name.toLowerCase().includes(query) || 
            skill.description.toLowerCase().includes(query)
          ).toArray()
        ]);

        setGlobalSearchResults({
          nodes: foundNodes,
          files: foundFiles,
          skills: foundSkills
        });
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [globalSearchQuery]);

  const consolidateMemories = async () => {
    if (!memoryService) return;
    setIsConsolidating(true);
    try {
      for (const node of nodes) {
        if (!node.summary) {
          await memoryService.consolidate(node.id);
        }
        await memoryService.identifyRelations(node.id);
      }
    } catch (err) {
      console.error('Consolidation error:', err);
    } finally {
      setIsConsolidating(false);
    }
  };

  const pruneMemories = async () => {
    if (!memoryService) return;
    try {
      const prunable = await memoryService.getPrunableNodes();
      if (prunable.length === 0) return;
      setPruneConfirm({ count: prunable.length, nodes: prunable });
    } catch (err) {
      console.error('Pruning identification failed:', err);
    }
  };

  const executePrune = async () => {
    if (!pruneConfirm) return;
    try {
      for (const node of pruneConfirm.nodes) {
        await db.vault.delete(node.id);
      }
      setPruneConfirm(null);
    } catch (err) {
      console.error('Pruning execution failed:', err);
    }
  };

  // Auto-recall based on active node or input
  useEffect(() => {
    if (memoryService && (newContent.length > 10)) {
      const timer = setTimeout(async () => {
        const results = await memoryService.recall(newContent);
        setRelevantMemories(results);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [newContent, memoryService]);

  // Seed initial files
  useEffect(() => {
    const seedFiles = async () => {
      const count = await db.files.count();
      if (count === 0) {
        await db.files.bulkAdd([
          {
            id: 'root_readme',
            name: 'README.md',
            type: 'file',
            parentId: 'root',
            content: '# Memori-City // 記録システム\n\nWelcome to the sovereign memory kernel.\n\n## System Protocols\n- All data is encrypted via Memori_Protocol.\n- Agents are autonomous.\n- Memory is city-state structured.',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'districts_folder',
            name: 'districts',
            type: 'folder',
            parentId: 'root',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'district_alpha',
            name: 'alpha_protocol.md',
            type: 'file',
            parentId: 'districts_folder',
            content: 'PROTOCOL_ALPHA: Initializing semantic handshake...',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
      }
    };
    seedFiles();
  }, []);

  // Agent Simulation (Heartbeat) - Local
  useEffect(() => {
    const interval = setInterval(async () => {
      const agentId = 'pico-janitor-001';
      const builderId = 'pico-builder-001';
      const researcherId = 'pico-researcher-001';
      
      const idleTasks = [
        'Dreaming of semantic clusters...',
        'Synthesizing District A with District B...',
        'Optimizing memory pathways...',
        'Scanning for latent connections...',
        'Refining Memori-Index hashes...'
      ];

      try {
        await db.agents.put({
          id: agentId,
          agent_id: agentId,
          agent_type: 'janitor',
          status: 'running',
          last_heartbeat: new Date().toISOString(),
          current_task: nodes.length > 0 ? idleTasks[Math.floor(Math.random() * idleTasks.length)] : 'Waiting for memory pressure...'
        });

        await db.agents.put({
          id: builderId,
          agent_id: builderId,
          agent_type: 'builder',
          status: 'running',
          last_heartbeat: new Date().toISOString(),
          current_task: 'Constructing memory skyscrapers...'
        });

        await db.agents.put({
          id: researcherId,
          agent_id: researcherId,
          agent_type: 'researcher',
          status: 'running',
          last_heartbeat: new Date().toISOString(),
          current_task: 'Extracting skills from raw data...'
        });
      } catch (err) {
        console.warn('Agent heartbeat failed locally');
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [nodes.length]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (activeImport === 'file') {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (activeImport === 'file') {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (activeImport !== 'file') return;
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setIsProcessing(true);
    try {
      for (const file of files) {
        const content = await file.text();
        const fileNode = {
          id: `file_${Math.random().toString(36).substring(2, 10)}`,
          name: file.name,
          type: 'file' as const,
          parentId: null,
          content: content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        await db.files.add(fileNode);
      }
      setActiveImport(null);
    } catch (err) {
      console.error('Failed to upload files:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const addMemory = async () => {
    if (!newContent.trim()) return;
    setIsProcessing(true);
    
    const tags = newContent.match(/#\w+/g)?.map(t => t.slice(1)) || ['uncategorized'];
    const district = tags[0];

    try {
      if (memoryService) {
        await memoryService.addMemory(newContent, {
          l0_abstract: newContent.substring(0, 100) + '...',
          heat_score: 1.0,
          tags: tags,
          district: district,
          floor: nodes.filter(n => n.district === district).length + 1
        });
      }
      setNewContent('');
    } catch (err) {
      console.error('Local save failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const mountObsidian = async () => {
    try {
      // @ts-ignore - File System Access API
      const handle = await window.showDirectoryPicker();
      setObsidianHandle(handle);
      setActiveImport('obsidian');
      
      // Basic scan of the vault
      for await (const entry of handle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.md')) {
          const file = await entry.getFile();
          const text = await file.text();
          
          // Add to local DB if not exists
          const nodeId = `obs_${entry.name.replace('.md', '')}`;
          const existing = await db.vault.get(nodeId);
          if (!existing) {
            await db.vault.add({
              id: nodeId,
              node_id: nodeId,
              memori_uri: `memori://obsidian/${entry.name}`,
              created_at: new Date().toISOString(),
              modified_at: new Date().toISOString(),
              author_uid: 'local_user',
              content: text,
              l0_abstract: text.substring(0, 100) + '...',
              tags: ['obsidian'],
              district: 'obsidian'
            });
          }
        }
      }
    } catch (err) {
      console.error('Obsidian mount failed:', err);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-void overflow-hidden relative">
      <div className="grid-bg" />
      <div className="crt-overlay" />
      
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 opacity-5 pointer-events-none select-none -rotate-90">
        <span className="text-8xl font-black font-japanese">新次元</span>
      </div>
      <div className="absolute bottom-20 right-10 opacity-5 pointer-events-none select-none rotate-90">
        <span className="text-8xl font-black font-japanese">データ</span>
      </div>

      {/* Header */}
      <header className="h-12 border-b border-neon-cyan/30 flex items-center justify-between px-5 bg-void/80 backdrop-blur-xl z-20 relative">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="glitch-text text-xl tracking-tighter leading-none">Memori-City</h1>
            <span className="text-[6px] font-mono text-neon-cyan/40 tracking-[0.4em] mt-1">
              SOVEREIGN_KERNEL_V4.20_STABLE
            </span>
          </div>
          <div className="h-6 w-px bg-neon-cyan/20" />
          
          {/* Global Search Bar */}
          <div className="relative w-64 group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={12} className={cn(
                "transition-colors",
                isSearchFocused ? "text-neon-cyan" : "text-white/20"
              )} />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="SEARCH_KERNEL_INDEX... (⌘K)"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full bg-void/40 border border-neon-cyan/20 rounded-none py-1.5 pl-9 pr-3 text-[10px] font-mono text-white placeholder:text-white/10 focus:outline-none focus:border-neon-cyan/50 focus:bg-void/60 transition-all"
            />
            
            {/* Search Results Dropdown */}
            <AnimatePresence>
              {isSearchFocused && (globalSearchQuery.trim() !== '') && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute top-full left-0 w-[400px] mt-2 bg-void/95 border border-neon-cyan/30 backdrop-blur-xl shadow-2xl overflow-hidden z-[100]"
                >
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2 space-y-4">
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <RefreshCw size={16} className="text-neon-cyan animate-spin mx-auto mb-2" />
                        <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">Scanning_Vault...</span>
                      </div>
                    ) : (globalSearchResults.nodes.length === 0 && globalSearchResults.files.length === 0 && globalSearchResults.skills.length === 0) ? (
                      <div className="p-4 text-center text-[8px] font-mono text-white/20 uppercase tracking-widest">
                        No_Results_Found_In_Kernel
                      </div>
                    ) : (
                      <>
                        {globalSearchResults.nodes.length > 0 && (
                          <div className="space-y-1">
                            <div className="px-2 py-1 text-[7px] font-black text-neon-cyan uppercase tracking-[0.3em] border-b border-neon-cyan/10 mb-1">Memory_Nodes</div>
                            {globalSearchResults.nodes.map(node => (
                              <button
                                key={node.id}
                                onClick={() => {
                                  setViewMode('city');
                                  setGlobalSearchQuery('');
                                }}
                                className="w-full text-left p-2 hover:bg-neon-cyan/5 border border-transparent hover:border-neon-cyan/20 transition-all group"
                              >
                                <div className="text-[10px] font-display font-black text-white group-hover:text-neon-cyan truncate">{node.memori_uri}</div>
                                <div className="text-[8px] font-mono text-white/40 truncate">{node.summary || node.l0_abstract}</div>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {globalSearchResults.files.length > 0 && (
                          <div className="space-y-1">
                            <div className="px-2 py-1 text-[7px] font-black text-neon-blue uppercase tracking-[0.3em] border-b border-neon-blue/10 mb-1">File_System</div>
                            {globalSearchResults.files.map(file => (
                              <button
                                key={file.id}
                                onClick={() => {
                                  setViewMode('files');
                                  setGlobalSearchQuery('');
                                }}
                                className="w-full text-left p-2 hover:bg-neon-blue/5 border border-transparent hover:border-neon-blue/20 transition-all group"
                              >
                                <div className="flex items-center gap-2">
                                  <FolderOpen size={10} className="text-neon-blue" />
                                  <div className="text-[10px] font-display font-black text-white group-hover:text-neon-blue truncate">{file.name}</div>
                                </div>
                                <div className="text-[8px] font-mono text-white/40 truncate ml-4">{file.parentId === 'root' ? '/' : '.../'}{file.name}</div>
                              </button>
                            ))}
                          </div>
                        )}

                        {globalSearchResults.skills.length > 0 && (
                          <div className="space-y-1">
                            <div className="px-2 py-1 text-[7px] font-black text-neon-purple uppercase tracking-[0.3em] border-b border-neon-purple/10 mb-1">Skill_Forge</div>
                            {globalSearchResults.skills.map(skill => (
                              <button
                                key={skill.id}
                                onClick={() => {
                                  setViewMode('skills');
                                  setGlobalSearchQuery('');
                                }}
                                className="w-full text-left p-2 hover:bg-neon-purple/5 border border-transparent hover:border-neon-purple/20 transition-all group"
                              >
                                <div className="flex items-center gap-2">
                                  <Zap size={10} className="text-neon-purple" />
                                  <div className="text-[10px] font-display font-black text-white group-hover:text-neon-purple truncate">{skill.name}</div>
                                </div>
                                <div className="text-[8px] font-mono text-white/40 truncate ml-4">{skill.description}</div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[8px] font-mono text-neon-green bg-neon-green/5 px-1.5 py-0.5 border border-neon-green/20">
              <HardDrive size={8} />
              <span className="uppercase tracking-widest">SOVEREIGN</span>
            </div>
            <div className="flex items-center gap-1 text-[8px] font-mono text-neon-pink bg-neon-pink/5 px-1.5 py-0.5 border border-neon-pink/20">
              <Shield size={8} />
              <span className="uppercase tracking-widest">SHIELD_ACTIVE</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-void border border-neon-cyan/30 p-0.5 rounded-none gap-0.5">
            <button 
              onClick={() => setViewMode('graph')}
              className={cn(
                "px-2.5 py-1 transition-all text-[9px] font-mono uppercase tracking-widest",
                viewMode === 'graph' ? "bg-neon-cyan text-void font-bold" : "text-neon-cyan hover:bg-neon-cyan/10"
              )}
            >
              GRAPH
            </button>
            <button 
              onClick={() => setViewMode('city')}
              className={cn(
                "px-2.5 py-1 transition-all text-[9px] font-mono uppercase tracking-widest",
                viewMode === 'city' ? "bg-neon-pink text-void font-bold" : "text-neon-pink hover:bg-neon-pink/10"
              )}
            >
              CITY
            </button>
            <button 
              onClick={() => setViewMode('skills')}
              className={cn(
                "px-2.5 py-1 transition-all text-[9px] font-mono uppercase tracking-widest",
                viewMode === 'skills' ? "bg-neon-purple text-void font-bold" : "text-neon-purple hover:bg-neon-purple/10"
              )}
            >
              SKILLS
            </button>
            <button 
              onClick={() => setViewMode('research')}
              className={cn(
                "px-2.5 py-1 transition-all text-[9px] font-mono uppercase tracking-widest",
                viewMode === 'research' ? "bg-neon-cyan text-void font-bold" : "text-neon-cyan hover:bg-neon-cyan/10"
              )}
            >
              RESEARCH
            </button>
            <button 
              onClick={() => setViewMode('files')}
              className={cn(
                "px-2.5 py-1 transition-all text-[9px] font-mono uppercase tracking-widest",
                viewMode === 'files' ? "bg-neon-blue text-void font-bold" : "text-neon-blue hover:bg-neon-blue/10"
              )}
            >
              FILES
            </button>
            <button 
              onClick={() => setViewMode('commons')}
              className={cn(
                "px-2.5 py-1 transition-all text-[9px] font-mono uppercase tracking-widest",
                viewMode === 'commons' ? "bg-neon-green text-void font-bold" : "text-neon-green hover:bg-neon-green/10"
              )}
            >
              COMMONS
            </button>
          </div>
          <button 
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className={cn(
              "p-1.5 border transition-all",
              sidebarVisible ? "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10" : "border-white/10 text-white/40 hover:text-white hover:border-white"
            )}
            title="Toggle Sidebars"
          >
            <Layers size={16} />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 border border-white/10 text-white/40 hover:text-white hover:border-white transition-all"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("flex-1 flex p-3 overflow-hidden relative z-10", sidebarVisible ? "gap-3" : "gap-0")}>
        {/* Left Sidebar: Agents & Stats */}
        <div className={cn(
          "flex flex-col gap-3 transition-all duration-500 min-h-0 overflow-hidden",
          !sidebarVisible ? "w-0 opacity-0" : viewMode === 'city' ? "w-48 opacity-100" : "w-80 opacity-100"
        )}>
          <CodecPanel title="AGENT_SWARM_HUD" status="active" className="h-1/2 min-h-0">
            <div className="flex flex-col gap-4">
              {agents.length === 0 ? (
                <div className="text-[9px] font-mono text-gray-600 italic">No agents registered.</div>
              ) : (
                agents.map(agent => (
                  <div key={agent.id} className="p-2 border border-neon-cyan/10 bg-void/60 relative group">
                    <div className="absolute top-0 right-0 w-1 h-full bg-neon-cyan/20 group-hover:bg-neon-cyan transition-colors" />
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-display font-black text-neon-cyan uppercase tracking-wider">{agent.agent_type}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-neon-green rounded-full flicker-anim" />
                        <span className="text-[7px] font-mono text-neon-green/60">ONLINE</span>
                      </div>
                    </div>
                    <div className="text-[9px] text-white/60 font-mono leading-tight bg-void/40 p-1.5 border-l border-neon-cyan/20 truncate">
                      {agent.current_task}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CodecPanel>

          <CodecPanel title="SYSTEM_CORE_METRICS" className="flex-1">
            <div className="space-y-4">
              {/* District Legend */}
              <div className="bg-void/40 p-2 border border-neon-cyan/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[8px] font-mono text-neon-cyan/60 uppercase tracking-[0.2em]">District_Index</div>
                  <button 
                    onClick={pruneMemories}
                    className="text-[7px] font-mono text-neon-pink hover:text-white transition-colors uppercase"
                  >
                    [Run_Garbage_Collector]
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                  {Array.from(new Set(nodes.map(n => n.district))).map(district => {
                    const districtStr = (district as string) || 'UNCATEGORIZED';
                    const hash = districtStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                    const colors = ['var(--theme-pink)', 'var(--theme-cyan)', 'var(--theme-green)', 'var(--theme-purple)', 'var(--theme-yellow)'];
                    const color = colors[hash % colors.length];
                    return (
                      <div key={districtStr} className="flex items-center gap-1.5 text-[8px] font-mono">
                        <div className="w-1.5 h-1.5" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
                        <span className="text-white/60 uppercase truncate">{districtStr}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[9px] font-mono mb-1.5">
                    <span className="text-white/40 uppercase tracking-widest">Memory_Pressure</span>
                    <span className="text-neon-pink neon-glow-pink">42.0%</span>
                  </div>
                  <div className="h-1 bg-void border border-neon-pink/20 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '42%' }}
                      className="h-full bg-neon-pink shadow-[0_0_10px_var(--theme-pink)]"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[9px] font-mono mb-1.5">
                    <span className="text-white/40 uppercase tracking-widest">RRL_Cycle_Load</span>
                    <span className="text-neon-cyan neon-glow-cyan">70.4%</span>
                  </div>
                  <div className="h-1 bg-void border border-neon-cyan/20 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '70%' }}
                      className="h-full bg-neon-cyan shadow-[0_0_10px_var(--theme-cyan)]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-neon-cyan/10">
                <div className="text-[8px] font-mono text-neon-purple uppercase mb-2 tracking-[0.2em]">Breach_Log</div>
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {agents.map(agent => (
                    <div key={agent.id} className="text-[8px] font-mono text-white/40 flex items-start gap-2 group">
                      <span className="text-neon-cyan/40 group-hover:text-neon-cyan transition-colors">[{new Date(agent.last_heartbeat).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
                      <span className="group-hover:text-white transition-colors truncate">{agent.agent_id.toUpperCase()}: {agent.current_task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CodecPanel>
        </div>

        {/* Center: Memory Visualization */}
        <div className={cn(
          "flex flex-col gap-3 transition-all duration-500 min-h-0 min-w-0",
          viewMode === 'city' ? "flex-[15]" : "flex-1"
        )}>
          {viewMode === 'skills' ? (
            <CodecPanel title="SKILL_FORGE_CORE" className="flex-1 !p-0 overflow-hidden battle-border min-h-0">
              <SkillForge />
            </CodecPanel>
          ) : viewMode === 'research' ? (
            <CodecPanel title="DEEP_RESEARCH_SWARM" className="flex-1 !p-0 overflow-hidden battle-border min-h-0">
              <DeepResearch />
            </CodecPanel>
          ) : viewMode === 'files' ? (
            <CodecPanel title="VAULT_FILE_SYSTEM" className="flex-1 !p-0 overflow-hidden battle-border min-h-0">
              <FileEditor />
            </CodecPanel>
          ) : viewMode === 'commons' ? (
            <CodecPanel title="KNOWLEDGE_COMMONS_HUB" className="flex-1 !p-0 overflow-hidden battle-border min-h-0">
              <KnowledgeCommons />
            </CodecPanel>
          ) : (
            <>
              <CodecPanel title={viewMode === 'graph' ? "MEMORI_INDEX_GRAPH" : "MEMORI_CITY_KERNEL"} className="flex-1 !p-0 overflow-hidden battle-border min-h-0">
                {viewMode === 'graph' ? (
                  <MemoriGraph nodes={nodes} />
                ) : (
                  <MemoriCity nodes={nodes} agents={agents} />
                )}
              </CodecPanel>
              
              {/* Multi-Modal Import Docks */}
              <div className="grid grid-cols-4 gap-3 h-36">
                <CodecPanel title="IMPORT_DOCK_ARRAY" className="col-span-3">
                  <AnimatePresence mode="wait">
                    {!activeImport ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="grid grid-cols-5 gap-3 h-full"
                      >
                        <ImportDock 
                          icon={FolderOpen} 
                          label="OBSIDIAN" 
                          description="MOUNT_VAULT // 黒曜石" 
                          onClick={mountObsidian} 
                          color="var(--theme-purple)"
                        />
                        <ImportDock 
                          icon={HardDrive} 
                          label="LOCAL_FS" 
                          description="SYNC_DRIVE // ローカル" 
                          onClick={() => setActiveImport('file')} 
                          color="var(--theme-green)"
                        />
                        <ImportDock 
                          icon={Globe} 
                          label="CLOUD" 
                          description="SYNC_GDRIVE // クラウド" 
                          onClick={() => setActiveImport('url')} 
                          color="var(--theme-cyan)"
                        />
                        <ImportDock 
                          icon={Brain} 
                          label="HERMES" 
                          description="LINK_MEMORY // ヘルメス" 
                          onClick={() => setActiveImport('text')} 
                          color="var(--theme-pink)"
                        />
                        <ImportDock 
                          icon={Layers} 
                          label="RESEARCH" 
                          description="SWARM_VORTEX // 研究" 
                          onClick={() => setViewMode('research')} 
                          color="var(--theme-cyan)"
                        />
                      </motion.div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col h-full bg-void/40 p-3 border border-neon-cyan/20 battle-border relative"
                      >
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-neon-cyan/50" />
                        <div className="flex items-center justify-between mb-3 border-b border-neon-cyan/10 pb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-display font-black text-neon-cyan uppercase tracking-[0.2em] hud-label">PORT: {activeImport}</span>
                            <div className="w-1.5 h-1.5 bg-neon-green flicker-anim shadow-[0_0_10px_var(--theme-green)]" />
                          </div>
                          <button 
                            onClick={() => setActiveImport(null)}
                            className="text-[8px] font-mono text-white/40 hover:text-neon-pink transition-colors uppercase tracking-widest border border-white/10 px-1.5 py-0.5 hover:border-neon-pink"
                          >
                            [CLOSE]
                          </button>
                        </div>
                        {activeImport === 'text' && (
                          <div className="flex flex-col flex-1 min-h-0">
                            <textarea 
                              value={newContent}
                              onChange={(e) => {
                                setNewContent(e.target.value);
                                setIsThinking(e.target.value.length > 0);
                              }}
                              onBlur={() => setIsThinking(false)}
                              placeholder="ENTER_MEMORY_STREAM_INPUT..."
                              className="flex-1 bg-void/60 border border-neon-cyan/10 p-3 outline-none text-neon-green font-mono text-[10px] resize-none placeholder:text-neon-green/20 custom-scrollbar"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  addMemory();
                                }
                              }}
                            />
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
                                CTRL+ENTER_TO_COMMIT
                              </div>
                              <button 
                                onClick={addMemory}
                                disabled={isProcessing || !newContent.trim()}
                                className="px-6 py-1.5 bg-neon-green/5 border border-neon-green/40 text-neon-green font-display font-black text-[10px] uppercase tracking-[0.1em] hover:bg-neon-green hover:text-void transition-all disabled:opacity-30 relative overflow-hidden group"
                              >
                                <div className="absolute inset-0 warning-stripes opacity-0 group-hover:opacity-20 transition-opacity" />
                                {isProcessing ? 'CONSTRUCTING...' : 'COMMIT_NODE'}
                              </button>
                            </div>
                          </div>
                        )}
                        {activeImport !== 'text' && (
                          <div 
                            className={cn(
                              "flex-1 flex flex-col items-center justify-center gap-4 border border-dashed bg-void/20 transition-all",
                              activeImport === 'file' ? "cursor-pointer" : "",
                              isDragging 
                                ? "border-neon-green bg-neon-green/10" 
                                : "border-neon-cyan/20 hover:border-neon-cyan/40"
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => {
                              if (activeImport === 'file') {
                                const input = document.createElement('input');
                                input.type = 'file';
                                input.multiple = true;
                                input.onchange = async (e) => {
                                  const files = Array.from((e.target as HTMLInputElement).files || []);
                                  if (files.length === 0) return;
                                  
                                  setIsProcessing(true);
                                  try {
                                    for (const file of files) {
                                      const content = await file.text();
                                      const fileNode = {
                                        id: `file_${Math.random().toString(36).substring(2, 10)}`,
                                        name: file.name,
                                        type: 'file' as const,
                                        parentId: null,
                                        content: content,
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString()
                                      };
                                      await db.files.add(fileNode);
                                    }
                                    setActiveImport(null);
                                  } catch (err) {
                                    console.error('Failed to upload files:', err);
                                  } finally {
                                    setIsProcessing(false);
                                  }
                                };
                                input.click();
                              }
                            }}
                          >
                            {activeImport === 'file' ? (
                              <>
                                <div className={cn(
                                  "w-12 h-12 border-2 border-dashed rounded-full flex items-center justify-center transition-all",
                                  isDragging ? "border-neon-green text-neon-green scale-110" : "border-neon-cyan/40 text-neon-cyan/40"
                                )}>
                                  <HardDrive size={20} />
                                </div>
                                <div className="text-center">
                                  <span className={cn(
                                    "text-[11px] font-mono uppercase tracking-[0.4em] transition-colors",
                                    isDragging ? "text-neon-green" : "text-neon-cyan/60"
                                  )}>
                                    {isDragging ? 'Drop_Files_Here' : 'Drag_&_Drop_Files'}
                                  </span>
                                  <div className="text-[8px] font-mono text-white/20 uppercase mt-2 tracking-widest">
                                    or click to browse
                                  </div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="w-12 h-12 border-2 border-neon-cyan/20 border-t-neon-cyan animate-spin" />
                                <span className="text-[11px] font-mono text-neon-cyan/40 uppercase tracking-[0.4em] animate-pulse">
                                  Awaiting_{activeImport}_Stream_Input...
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CodecPanel>
    
                <CodecPanel title="HERMES_LINK_V1" className="col-span-1">
                  <div className="flex flex-col gap-3 h-full">
                    <div className="text-[8px] font-mono text-white/40 uppercase leading-tight tracking-wider">
                      Connect_Hermes_Agent_via_Memori_Protocol
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <motion.div 
                        whileHover={{ x: 4, backgroundColor: 'color-mix(in srgb, var(--theme-pink) 10%, transparent)' }}
                        className="p-2 border border-neon-pink/20 bg-void/60 flex items-center gap-2 group cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 w-1 h-full bg-neon-pink/40 group-hover:bg-neon-pink transition-colors" />
                        <Brain size={14} className="text-neon-pink" />
                        <span className="text-[9px] font-display font-black text-neon-pink uppercase tracking-widest">SYNC: ON</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ x: 4, backgroundColor: 'color-mix(in srgb, var(--theme-cyan) 10%, transparent)' }}
                        className="p-2 border border-neon-cyan/20 bg-void/60 flex items-center gap-2 group cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 w-1 h-full bg-neon-cyan/40 group-hover:bg-neon-cyan transition-colors" />
                        <Code size={14} className="text-neon-cyan" />
                        <span className="text-[9px] font-display font-black text-neon-cyan uppercase tracking-widest">ENDPOINT: /API</span>
                      </motion.div>
                    </div>
                    <div className="text-[8px] font-mono text-neon-green/40 uppercase mt-auto flex items-center justify-between border-t border-neon-cyan/10 pt-2">
                      <span className="font-bold">HERMES_CORE</span>
                      <span className="animate-pulse neon-glow-cyan">● LISTENING</span>
                    </div>
                  </div>
                </CodecPanel>
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar: Node Inspector */}
        <div className={cn(
          "flex flex-col gap-3 transition-all duration-500 min-h-0 overflow-hidden",
          !sidebarVisible ? "w-0 opacity-0" : viewMode === 'city' ? "w-48 opacity-100" : "w-80 opacity-100"
        )}>
          <CodecPanel title="COGNITIVE_RECALL_BUFFER" className="h-64 min-h-0">
            <div className="flex flex-col h-full gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History size={12} className="text-neon-cyan" />
                  <span className="text-[10px] font-mono text-white/60 uppercase tracking-widest">Semantic_Recall</span>
                </div>
                <button 
                  onClick={consolidateMemories}
                  disabled={isConsolidating}
                  className="p-1 hover:bg-white/5 text-neon-green transition-all rounded-sm"
                  title="Consolidate Memories"
                >
                  <RefreshCw size={12} className={cn(isConsolidating && "animate-spin")} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                {relevantMemories.length > 0 ? (
                  relevantMemories.map(node => (
                    <motion.div 
                      key={node.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-2 border border-white/5 bg-white/[0.02] hover:border-neon-cyan/30 transition-all cursor-pointer group"
                    >
                      <div className="text-[7px] font-mono text-neon-cyan/40 uppercase mb-1">{node.memori_uri}</div>
                      <div className="text-[9px] text-white/80 line-clamp-2 group-hover:text-white transition-colors">
                        {node.summary || node.content}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 opacity-20">
                    <Brain size={20} className="mb-2" />
                    <p className="text-[8px] font-mono uppercase">Recall_Buffer_Empty</p>
                    <p className="text-[7px] font-mono mt-1 italic">Type more to trigger recall</p>
                  </div>
                )}
              </div>

              <PredictiveKernel isThinking={isConsolidating} contextQuery={newContent} />
            </div>
          </CodecPanel>

          <CodecPanel title="NODE_INSPECTOR_HUD" className="flex-1 min-h-0">
            {nodes.length > 0 ? (
              <div className="space-y-6">
                <div className="p-4 border border-neon-pink/20 bg-void/60 relative group">
                  <div className="absolute top-0 left-0 w-full h-1 warning-stripes opacity-10" />
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[9px] font-mono text-neon-pink uppercase tracking-widest">Active_Node_Index</div>
                    <button 
                      onClick={async () => {
                        await db.vault.update(nodes[0].id, { is_public: !nodes[0].is_public });
                      }}
                      className={cn(
                        "text-[8px] font-mono px-1.5 py-0.5 border transition-all",
                        nodes[0].is_public ? "bg-neon-green/20 border-neon-green text-neon-green" : "border-white/20 text-white/40 hover:border-white/40"
                      )}
                    >
                      {nodes[0].is_public ? 'PUBLIC_COMMONS' : 'PRIVATE_VAULT'}
                    </button>
                  </div>
                  <div className="text-sm font-display font-black text-white mb-3 tracking-tight truncate">{nodes[0].memori_uri}</div>
                  <div className="text-[11px] text-white/60 font-mono leading-relaxed italic bg-void/40 p-3 border-l-2 border-neon-pink/40">
                    "{nodes[0].summary || nodes[0].l0_abstract}"
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-[10px] font-display font-black text-neon-cyan uppercase tracking-[0.2em]">Semantic_Context_Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {nodes[0].tags?.map(tag => (
                      <span key={tag} className="px-3 py-1 bg-neon-purple/5 border border-neon-purple/40 text-neon-purple text-[10px] font-mono uppercase tracking-widest hover:bg-neon-purple hover:text-white transition-all cursor-default">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-neon-cyan/10">
                  <div className="text-[10px] font-display font-black text-neon-green uppercase mb-3 tracking-[0.2em]">Skill_Forge_Output</div>
                  <div className="space-y-3">
                    <div className="p-3 border border-neon-green/20 bg-void/60 flex items-center justify-between group cursor-pointer relative overflow-hidden">
                      <div className="absolute left-0 top-0 w-1 h-full bg-neon-green/40 group-hover:bg-neon-green transition-colors" />
                      <div className="flex items-center gap-3">
                        <Zap size={14} className="text-neon-green" />
                        <span className="text-[10px] font-display font-black text-neon-green uppercase tracking-widest">Extracted_Skill_V1</span>
                      </div>
                      <span className="text-[8px] font-mono text-white/20">CRC_OK</span>
                    </div>
                    <div className="text-[10px] font-mono text-white/40 italic leading-tight px-2">
                      Agents_distilling_node_into_actionable_intelligence...
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-neon-cyan/10">
                  <div className="text-[10px] font-display font-black text-neon-cyan uppercase mb-3 tracking-[0.2em]">Vision_Index_Stream</div>
                  <div className="aspect-video bg-void border border-neon-cyan/20 flex items-center justify-center relative overflow-hidden group">
                    <div className="scan-line" />
                    <Search className="text-neon-cyan/10 group-hover:text-neon-cyan transition-colors duration-500" size={32} />
                    <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 right-3 text-[9px] font-mono text-white/40 leading-tight">
                      {nodes[0].vision_caption || 'NO_VISUAL_DATA_INDEXED_FOR_THIS_NODE'}
                    </div>
                    {/* Decorative Japanese text in vision box */}
                    <div className="absolute top-2 right-2 opacity-20">
                      <span className="text-[10px] font-japanese">視覚データ</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 gap-6">
                <div className="relative">
                  <Database className="text-white/5" size={80} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border border-neon-cyan/20 animate-ping" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-display font-black text-white/20 uppercase tracking-[0.4em]">
                    Vault_Empty
                  </p>
                  <p className="text-[9px] font-mono text-white/10 uppercase tracking-widest">
                    Initialize_Memory_Stream_via_Terminal
                  </p>
                </div>
              </div>
            )}
          </CodecPanel>
        </div>
      </main>

      {/* Prune Confirmation Modal */}
      <AnimatePresence>
        {pruneConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-void/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-md w-full border border-neon-pink/30 bg-void/90 p-8 battle-border"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-neon-pink/10 flex items-center justify-center border border-neon-pink/30">
                  <Trash2 className="text-neon-pink" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-display font-black text-neon-pink uppercase tracking-widest">Archive_Protocol</h2>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest">Garbage_Collection // 記憶の整理</p>
                </div>
              </div>

              <p className="text-xs text-white/80 mb-8 leading-relaxed font-mono">
                System has identified <span className="text-neon-pink font-bold">{pruneConfirm.count}</span> low-importance memory kernels for archiving. This process is irreversible. Proceed with deletion?
              </p>

              <div className="flex gap-4">
                <button 
                  onClick={() => setPruneConfirm(null)}
                  className="flex-1 py-3 border border-white/10 text-white/40 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Abort_Process
                </button>
                <button 
                  onClick={executePrune}
                  className="flex-1 py-3 bg-neon-pink/10 border border-neon-pink/40 text-neon-pink text-[10px] font-bold uppercase tracking-widest hover:bg-neon-pink hover:text-white transition-all"
                >
                  Execute_Prune
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Footer Status Bar */}
      <footer className="h-8 border-t border-neon-cyan/30 bg-void/80 backdrop-blur-xl flex items-center px-6 justify-between z-20 relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse shadow-[0_0_10px_var(--theme-green)]" />
            <span className="text-[9px] font-mono text-neon-green uppercase tracking-[0.2em] font-bold">Kernel_Active</span>
          </div>
          <div className="h-4 w-px bg-neon-cyan/20" />
          <div className="flex items-center gap-2 text-[9px] font-mono text-white/40 uppercase">
            <span>Latency:</span>
            <span className="text-neon-cyan">24ms</span>
          </div>
          <div className="h-4 w-px bg-neon-cyan/20" />
          <div className="flex items-center gap-2 text-[9px] font-mono text-white/40 uppercase">
            <span>Uptime:</span>
            <span className="text-neon-cyan">99.99%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-[9px] font-mono text-white/40 uppercase">
            <span className="font-japanese text-[10px] opacity-40">システム</span>
            <span>Memori://Protocol_v2.0</span>
          </div>
          <div className="h-4 w-px bg-neon-cyan/20" />
          <div className="flex items-center gap-2 text-[9px] font-mono text-neon-pink uppercase tracking-widest font-bold">
            <Shield size={10} />
            <span>PoK: Memori_Mainnet_Verified</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
