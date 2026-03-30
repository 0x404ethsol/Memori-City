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
import { OrchestratorService } from './services/orchestratorService';
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
  Trash2,
  Network,
  Settings2,
  Map,
  Binary,
  Eye,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { SkillForge } from './components/SkillForge';
import { PredictiveKernel } from './components/PredictiveKernel';
import { DeepResearch } from './components/DeepResearch';
import { FileEditor } from './components/FileEditor';
import { SettingsModal } from './components/SettingsModal';
import { MobileView } from './components/MobileView';
import { SkillManagerModal } from './components/SkillManagerModal';
import { HermesImportModal } from './components/HermesImportModal';
import { MusicPlayer } from './components/MusicPlayer';
import { GlitchText } from './components/GlitchText';
import { NeuralPulse } from './components/NeuralPulse';
import { VaporwaveAnimeOverlay } from './components/VaporwaveAnimeOverlay';
import { WireframeGlobe } from './components/WireframeGlobe';
import { SystemWarning } from './components/SystemWarning';
import { AgentTicker } from './components/AgentTicker';
import { DitherBackground } from './components/DitherBackground';
import { MissionControl } from './components/MissionControl';
import { collaborationService } from './services/CollaborationService';

const SidebarHandle = ({ isVisible, onClick, side }: { isVisible: boolean, onClick: () => void, side: 'left' | 'right' }) => (
  <button 
    onClick={onClick}
    className={cn(
      "absolute top-1/2 -translate-y-1/2 w-1.5 h-20 bg-neon-cyan/10 border border-neon-cyan/30 hover:bg-neon-cyan/30 transition-all z-50 flex items-center justify-center group",
      side === 'left' ? "left-0 rounded-r" : "right-0 rounded-l"
    )}
  >
    <div className={cn(
      "w-0.5 h-8 bg-neon-cyan/40 group-hover:bg-neon-cyan transition-colors",
      isVisible ? "opacity-100" : "opacity-40"
    )} />
    <div className={cn(
      "absolute bg-void/90 border border-neon-cyan/40 px-2 py-1 text-[8px] font-mono text-neon-cyan uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none z-[60] backdrop-blur-sm",
      side === 'left' ? "left-4 translate-x-[-10px] group-hover:translate-x-0" : "right-4 translate-x-[10px] group-hover:translate-x-0"
    )}>
      {isVisible ? `[COLLAPSE_${side.toUpperCase()}]` : `[EXPAND_${side.toUpperCase()}]`}
    </div>
  </button>
);

export default function App() {
  const nodes = useLiveQuery(() => db.vault.toArray()) || [];
  const agents = useLiveQuery(() => db.agents.toArray()) || [];
  
  const { settings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [viewMode, setViewMode] = useState<'graph' | 'city' | 'skills' | 'research' | 'files' | 'commons' | 'mission-control'>('mission-control');
  const [activeImport, setActiveImport] = useState<'text' | 'file' | 'url' | 'voice' | 'obsidian' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [obsidianHandle, setObsidianHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [relevantMemories, setRelevantMemories] = useState<MemoriNode[]>([]);
  const [pruneConfirm, setPruneConfirm] = useState<{ count: number; nodes: MemoriNode[] } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [skillManagerAgent, setSkillManagerAgent] = useState<AgentRecord | null>(null);
  const [isHermesImportOpen, setIsHermesImportOpen] = useState(false);
  const [isArchOpen, setIsArchOpen] = useState(false);
  const [isDistrictManagerOpen, setIsDistrictManagerOpen] = useState(false);
  const [isSwarmVisible, setIsSwarmVisible] = useState(true);
  const [isMetricsVisible, setIsMetricsVisible] = useState(true);
  const [isGlitching, setIsGlitching] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [swarmRoomId, setSwarmRoomId] = useState<string | null>(null);
  const [swarmPresence, setSwarmPresence] = useState(0);
  const [isSwarmModalOpen, setIsSwarmModalOpen] = useState(false);
  const [tempRoomId, setTempRoomId] = useState('');

  // Global Search State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<{
    nodes: MemoriNode[];
    files: any[];
    skills: any[];
  }>({ nodes: [], files: [], skills: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const memoryService = useMemo(() => settings ? new MemoryService(settings) : null, [settings]);

  useEffect(() => {
    collaborationService.connect();
    collaborationService.setPresenceCallback(setSwarmPresence);
    return () => collaborationService.disconnect();
  }, []);

  const joinSwarm = (roomId: string) => {
    if (!roomId.trim()) return;
    collaborationService.joinRoom(roomId);
    setSwarmRoomId(roomId);
    setIsSwarmModalOpen(false);
  };

  const leaveSwarm = () => {
    collaborationService.disconnect();
    collaborationService.connect(); // Reconnect but don't join room
    setSwarmRoomId(null);
    setSwarmPresence(0);
  };
  const orchestrator = useMemo(() => settings ? new OrchestratorService(settings) : null, [settings]);

  // Mobile Detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Bootstrap Hermes Skill
  useEffect(() => {
    const bootstrapHermes = async () => {
      const hermesSkill = await db.skills.where('name').equals('Hermes_Memory_Import').first();
      if (!hermesSkill) {
        await db.skills.add({
          id: 'skill_hermes_import',
          name: 'Hermes_Memory_Import',
          description: 'Automatically connect and import memory files from local storage or cloud gateways.',
          category: 'automation',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          code: `
# Skill: Hermes_Memory_Import

## Operational Protocol
1. **Discovery**: Scan target directories for .md files.
2. **HITL (Human-in-the-Loop)**: Generate an Import_Manifest and request user confirmation.
3. **Ingestion**: Read confirmed files and convert to MemoriNodes.
4. **Linkage**: Search for semantic relations and integrate into the city graph.

## Security
- Local-first processing.
- No shadow synchronization without consent.
          `
        });
      }
    };
    bootstrapHermes();
  }, []);

  const handleOrchestrate = async () => {
    if (!orchestrator) return;
    setIsOrchestrating(true);
    try {
      await orchestrator.orchestrate();
    } catch (err) {
      console.error('Orchestration failed:', err);
    } finally {
      setIsOrchestrating(false);
    }
  };

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

      // Alt + 0-6 for View Modes
      if (e.altKey && !isInput) {
        switch (e.key) {
          case '0': e.preventDefault(); setViewMode('mission-control'); break;
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
  }, [globalSearchQuery, viewMode]);

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
        if (swarmRoomId) {
          collaborationService.broadcastMemoryDeleted(node.id);
        }
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

  const handleImportSelect = (type: 'text' | 'file' | 'url' | 'voice' | 'obsidian') => {
    setActiveImport(type);
    setImportError(null);
  };

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
        const node = await memoryService.addMemory(newContent, {
          l0_abstract: newContent.substring(0, 100) + '...',
          heat_score: 1.0,
          tags: tags,
          district: district,
          floor: nodes.filter(n => n.district === district).length + 1
        });
        
        // Broadcast to Swarm
        if (swarmRoomId) {
          collaborationService.broadcastMemoryAdded(node);
        }
      }
      setNewContent('');
    } catch (err) {
      console.error('Local save failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const mountObsidian = async () => {
    setActiveImport('obsidian');
    setImportError(null);
    try {
      // @ts-ignore - File System Access API
      const handle = await window.showDirectoryPicker();
      setObsidianHandle(handle);
      setIsProcessing(true);
      await syncObsidian(handle);
      setActiveImport(null);
    } catch (err: any) {
      console.error('Failed to mount Obsidian vault:', err);
      if (err.name === 'SecurityError' || err.message.includes('Cross origin sub frames')) {
        setImportError("SECURITY_RESTRICTION: File System Access is blocked in the preview iframe. Please open the application in a new tab to link your Obsidian vault.");
      } else if (err.name !== 'AbortError') {
        setImportError(`MOUNT_FAILED: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const syncObsidian = async (handle: FileSystemDirectoryHandle) => {
    setIsProcessing(true);
    try {
      // Recursive sync function
      const syncDirectory = async (dirHandle: FileSystemDirectoryHandle, parentId: string | null = 'root') => {
        // @ts-ignore - File System Access API
        for await (const entry of dirHandle.values()) {
          if (entry.kind === 'directory') {
            // Check if folder exists
            let folder = await db.files.where('name').equals(entry.name).and(f => f.parentId === parentId && f.type === 'folder').first();
            if (!folder) {
              const folderId = `folder_${Math.random().toString(36).substring(2, 10)}`;
              folder = {
                id: folderId,
                name: entry.name,
                type: 'folder',
                parentId: parentId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              await db.files.add(folder);
            }
            // @ts-ignore
            await syncDirectory(entry, folder.id);
          } else if (entry.kind === 'file' && entry.name.endsWith('.md')) {
            // @ts-ignore
            const file = await entry.getFile();
            const content = await file.text();
            
            // Check if file exists in this parent
            const existing = await db.files.where('name').equals(entry.name).and(f => f.parentId === parentId).first();
            
            if (existing) {
              if (existing.content !== content) {
                await db.files.update(existing.id, {
                  content,
                  updated_at: new Date(file.lastModified).toISOString()
                });
              }
            } else {
              const fileId = `file_${Math.random().toString(36).substring(2, 10)}`;
              await db.files.add({
                id: fileId,
                name: entry.name,
                type: 'file',
                parentId: parentId,
                content,
                created_at: new Date(file.lastModified).toISOString(),
                updated_at: new Date(file.lastModified).toISOString()
              });
              
              // Also add to vault (memori_nodes) if it's a new memory-worthy file
              const nodeUri = `memori://obsidian/${entry.name.replace('.md', '')}`;
              const nodeExists = await db.vault.where('memori_uri').equals(nodeUri).first();
              if (!nodeExists) {
                const nodeId = `node_${Math.random().toString(36).substring(2, 10)}`;
                await db.vault.add({
                  id: nodeId,
                  node_id: nodeId,
                  memori_uri: nodeUri,
                  created_at: new Date(file.lastModified).toISOString(),
                  modified_at: new Date(file.lastModified).toISOString(),
                  author_uid: 'local_user',
                  content,
                  l0_abstract: content.substring(0, 200) + '...',
                  tags: ['obsidian', 'imported'],
                  district: 'obsidian'
                });
              }
            }
          }
        }
      };

      await syncDirectory(handle);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isMobile) {
    return (
      <div className="h-screen w-screen bg-void">
        <MobileView 
          nodes={nodes} 
          agents={agents} 
          onOpenSettings={() => setIsSettingsOpen(true)} 
          onMountObsidian={mountObsidian}
          onSetActiveImport={setActiveImport}
          activeImport={activeImport}
          onSetViewMode={setViewMode}
          onOpenSkillManager={(agent) => setSkillManagerAgent(agent)}
          onOpenHermesImport={() => setIsHermesImportOpen(true)}
          globalSearchQuery={globalSearchQuery}
          onSetGlobalSearchQuery={setGlobalSearchQuery}
          globalSearchResults={globalSearchResults}
        />
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-void overflow-hidden relative">
      <DitherBackground />
      <NeuralPulse />
      <VaporwaveAnimeOverlay />
      <WireframeGlobe />
      <SystemWarning isOpen={isConsolidating} message="ORCHESTRATING_SWARM" />
      <div className="grid-bg" />
      <div className="crt-overlay" />
      
      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-10 opacity-5 pointer-events-none select-none -rotate-90">
        <span className="text-8xl font-black font-japanese">新次元</span>
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 pointer-events-none select-none rotate-90 overflow-hidden group">
        <div className="absolute inset-0 bg-cover bg-center grayscale contrast-200 brightness-50 opacity-40 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `url('https://picsum.photos/seed/cyberpunk-girl/1080/1080?grayscale')` }} />
        <span className="text-8xl font-black font-japanese relative z-10 mix-blend-overlay">データ</span>
        {/* Dither Animation on the targeted element */}
        <motion.div 
          animate={{ x: [-10, 10, -10], y: [-10, 10, -10] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #00f3ff 1px, transparent 1px)`,
            backgroundSize: '4px 4px',
          }}
        />
      </div>

      {/* Header */}
      <header className="h-12 border-b border-neon-cyan/30 flex items-center justify-between px-5 bg-void/80 backdrop-blur-xl z-20 relative">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-display font-black italic tracking-tighter text-white leading-none">
              <GlitchText text="MEMORI-CITY" />
            </h1>
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
                        {[
                          { 
                            id: 'nodes', 
                            render: () => (
                              globalSearchResults.nodes.length > 0 && (
                                <div className="space-y-1">
                                  <div className="px-2 py-1 text-[7px] font-black text-neon-cyan uppercase tracking-[0.3em] border-b border-neon-cyan/10 mb-1 flex justify-between items-center">
                                    <span>Memory_Nodes</span>
                                    {(viewMode === 'city' || viewMode === 'graph' || viewMode === 'commons' || viewMode === 'research') && (
                                      <span className="text-[6px] text-neon-cyan/40">[PRIORITY_LINK]</span>
                                    )}
                                  </div>
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
                              )
                            )
                          },
                          { 
                            id: 'files', 
                            render: () => (
                              globalSearchResults.files.length > 0 && (
                                <div className="space-y-1">
                                  <div className="px-2 py-1 text-[7px] font-black text-neon-blue uppercase tracking-[0.3em] border-b border-neon-blue/10 mb-1 flex justify-between items-center">
                                    <span>File_System</span>
                                    {viewMode === 'files' && (
                                      <span className="text-[6px] text-neon-blue/40">[PRIORITY_LINK]</span>
                                    )}
                                  </div>
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
                              )
                            )
                          },
                          { 
                            id: 'skills', 
                            render: () => (
                              globalSearchResults.skills.length > 0 && (
                                <div className="space-y-1">
                                  <div className="px-2 py-1 text-[7px] font-black text-neon-purple uppercase tracking-[0.3em] border-b border-neon-purple/10 mb-1 flex justify-between items-center">
                                    <span>Skill_Forge</span>
                                    {viewMode === 'skills' && (
                                      <span className="text-[6px] text-neon-purple/40">[PRIORITY_LINK]</span>
                                    )}
                                  </div>
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
                              )
                            )
                          }
                        ].sort((a, b) => {
                          if (viewMode === 'files') {
                            if (a.id === 'files') return -1;
                            if (b.id === 'files') return 1;
                          } else if (viewMode === 'skills') {
                            if (a.id === 'skills') return -1;
                            if (b.id === 'skills') return 1;
                          } else {
                            if (a.id === 'nodes') return -1;
                            if (b.id === 'nodes') return 1;
                          }
                          return 0;
                        }).map(section => (
                          <React.Fragment key={section.id}>
                            {section.render()}
                          </React.Fragment>
                        ))}
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
              onClick={() => setViewMode('mission-control')}
              className={cn(
                "px-2.5 py-1 transition-all text-[9px] font-mono uppercase tracking-widest",
                viewMode === 'mission-control' ? "bg-neon-cyan text-void font-bold" : "text-neon-cyan hover:bg-neon-cyan/10"
              )}
            >
              MISSION
            </button>
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
            <button 
              onClick={() => setIsHermesImportOpen(true)}
              className="px-2.5 py-1 transition-all text-[9px] font-mono uppercase tracking-widest text-neon-pink hover:bg-neon-pink/10 border border-neon-pink/20 ml-2"
            >
              HERMES
            </button>
          </div>
          <button 
            onClick={() => setIsSwarmModalOpen(true)}
            className={cn(
              "p-1.5 border transition-all flex items-center gap-2",
              swarmRoomId ? "border-neon-green/50 text-neon-green bg-neon-green/10" : "border-white/10 text-white/40 hover:text-white hover:border-white"
            )}
            title="Swarm Collaboration"
          >
            <Network size={16} />
            {swarmPresence > 0 && <span className="text-[9px] font-mono">{swarmPresence}</span>}
          </button>
          <button 
            onClick={() => setIsSwarmVisible(!isSwarmVisible)}
            className={cn(
              "p-1.5 border transition-all flex items-center gap-2",
              isSwarmVisible ? "border-neon-pink/50 text-neon-pink bg-neon-pink/10" : "border-white/10 text-white/40 hover:text-white hover:border-white"
            )}
            title="Toggle Agent Swarm"
          >
            <Cpu size={16} />
          </button>
          <button 
            onClick={() => setIsMetricsVisible(!isMetricsVisible)}
            className={cn(
              "p-1.5 border transition-all flex items-center gap-2",
              isMetricsVisible ? "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10" : "border-white/10 text-white/40 hover:text-white hover:border-white"
            )}
            title="Toggle System Metrics"
          >
            <Activity size={16} />
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 border border-white/10 text-white/40 hover:text-white hover:border-white transition-all"
          >
            <Settings2 size={16} />
          </button>
        </div>
      </header>
      
      {/* Agent Activity Ticker Removed */}
      
      {/* Main Content */}
      <main className={cn("flex-1 flex p-2 overflow-hidden relative z-10", (isSwarmVisible || isMetricsVisible) ? "gap-2" : "gap-0")}>
        {/* Left Sidebar Handle */}
        <SidebarHandle 
          side="left" 
          isVisible={isSwarmVisible || isMetricsVisible} 
          onClick={() => {
            const target = !(isSwarmVisible || isMetricsVisible);
            setIsSwarmVisible(target);
            setIsMetricsVisible(target);
          }} 
        />

        {/* Left Sidebar: Agents & Stats */}
        <div className={cn(
          "flex flex-col gap-2 transition-all duration-500 min-h-0",
          (!isSwarmVisible && !isMetricsVisible) ? "w-0" : viewMode === 'city' ? "w-48" : "w-72"
        )}>
          <AnimatePresence mode="popLayout">
            {isSwarmVisible && (
              <motion.div
                key="swarm-hud"
                initial={{ x: -400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -400, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className={cn("min-h-0", isMetricsVisible ? "h-1/2" : "flex-1")}
              >
                <CodecPanel 
                  title="AGENT_SWARM_HUD" 
                  status="active" 
                  className="h-full"
                  onClose={() => setIsSwarmVisible(false)}
                >
                  <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar h-full pr-1">
                    {agents.length === 0 ? (
                      <div className="text-[9px] font-mono text-gray-600 italic">No agents registered.</div>
                    ) : (
                      agents.map(agent => (
                        <div key={agent.id} className="p-2 border border-neon-cyan/10 bg-void/60 relative group hover:border-neon-cyan/40 transition-all">
                          <div className="absolute top-0 right-0 w-1 h-full bg-neon-cyan/20 group-hover:bg-neon-cyan transition-colors" />
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Cpu size={10} className={cn(agent.status === 'running' ? "text-neon-green" : "text-white/20")} />
                              <span className="text-[9px] font-display font-black text-neon-cyan uppercase tracking-wider truncate">{agent.agent_type}</span>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <div className={cn("w-1 h-1 rounded-full", agent.status === 'running' ? "bg-neon-green flicker-anim" : "bg-white/20")} />
                              <span className={cn("text-[6px] font-mono uppercase", agent.status === 'running' ? "text-neon-green/60" : "text-white/20")}>
                                {agent.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-[8px] text-white/60 font-mono leading-tight bg-void/40 p-1.5 border-l border-neon-cyan/20 mb-2 italic max-h-10 overflow-y-auto custom-scrollbar">
                            {agent.current_task || 'IDLE_WAITING_FOR_TASK'}
                          </div>
                          
                          {/* Interactive Controls */}
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setSkillManagerAgent(agent);
                              }}
                              className="flex-1 py-0.5 bg-neon-cyan/10 border border-neon-cyan/30 text-[6px] font-mono text-neon-cyan uppercase hover:bg-neon-cyan hover:text-void transition-all"
                            >
                              Skills
                            </button>
                            <button 
                              onClick={async () => {
                                const newStatus = agent.status === 'running' ? 'sleeping' : 'running';
                                await db.agents.update(agent.id, { status: newStatus });
                              }}
                              className="flex-1 py-0.5 bg-neon-purple/10 border border-neon-purple/30 text-[6px] font-mono text-neon-purple uppercase hover:bg-neon-purple hover:text-white transition-all"
                            >
                              {agent.status === 'running' ? 'Sleep' : 'Wake'}
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm(`Terminate agent ${agent.agent_id}?`)) {
                                  await db.agents.delete(agent.id);
                                }
                              }}
                              className="px-1.5 py-0.5 bg-neon-pink/10 border border-neon-pink/30 text-[6px] font-mono text-neon-pink uppercase hover:bg-neon-pink hover:text-white transition-all"
                            >
                              Kill
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
              </CodecPanel>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {isMetricsVisible && (
            <motion.div
              key="metrics-hud"
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="flex-1 min-h-0"
            >
              <CodecPanel 
                title="SYSTEM_CORE_METRICS" 
                className="h-full"
                onClose={() => setIsMetricsVisible(false)}
              >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Center: Memory Visualization */}
        <div className={cn(
          "flex flex-col gap-2 transition-all duration-500 min-h-0 min-w-0",
          viewMode === 'city' ? "flex-[15]" : "flex-1"
        )}>
          {viewMode === 'mission-control' ? (
            <CodecPanel title="MISSION_CONTROL_DASHBOARD" className="flex-1 !p-0 overflow-hidden battle-border min-h-0">
              <MissionControl setViewMode={setViewMode} />
            </CodecPanel>
          ) : viewMode === 'skills' ? (
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
              <div className="grid grid-cols-6 gap-2 h-40">
                <CodecPanel title="IMPORT_DOCK_ARRAY" className="col-span-4">
                  <AnimatePresence mode="wait">
                    {!activeImport ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="grid grid-cols-4 gap-2 h-full"
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
                          onClick={() => handleImportSelect('file')} 
                          color="var(--theme-green)"
                        />
                        <ImportDock 
                          icon={Globe} 
                          label="CLOUD" 
                          description="SYNC_GDRIVE // クラウド" 
                          onClick={() => handleImportSelect('url')} 
                          color="var(--theme-cyan)"
                        />
                        <ImportDock 
                          icon={Brain} 
                          label="HERMES" 
                          description="LINK_MEMORY // ヘルメス" 
                          onClick={() => setIsHermesImportOpen(true)} 
                          color="var(--theme-pink)"
                        />
                        <ImportDock 
                          icon={Plus} 
                          label="QUICK_NOTE" 
                          description="NEW_MEMORY // メモ" 
                          onClick={() => handleImportSelect('text')} 
                          color="var(--theme-green)"
                        />
                        <ImportDock 
                          icon={Mic} 
                          label="NEURAL_LINK" 
                          description="VOICE_STREAM // 音声" 
                          onClick={() => handleImportSelect('voice')} 
                          color="var(--theme-cyan)"
                        />
                        <ImportDock 
                          icon={Map} 
                          label="DISTRICTS" 
                          description="REZONE_CITY // 地区" 
                          onClick={() => setIsDistrictManagerOpen(true)} 
                          color="var(--theme-yellow)"
                        />
                        <ImportDock 
                          icon={Binary} 
                          label="ARCH" 
                          description="SYS_BLUEPRINT // 建築" 
                          onClick={() => setIsArchOpen(true)} 
                          color="var(--theme-purple)"
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
                        {activeImport === 'obsidian' && (
                          <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                            <div className="relative">
                              <div className={cn(
                                "w-20 h-20 border-2 rounded-xl flex items-center justify-center rotate-45 group-hover:rotate-90 transition-all duration-700",
                                obsidianHandle ? "border-neon-green/40 bg-neon-green/5" : "border-neon-purple/40"
                              )}>
                                <div className="-rotate-45 group-hover:-rotate-90 transition-transform duration-700">
                                  <HardDrive size={32} className={obsidianHandle ? "text-neon-green" : "text-neon-purple"} />
                                </div>
                              </div>
                              <div className={cn(
                                "absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full animate-pulse",
                                obsidianHandle ? "bg-neon-green" : "bg-neon-purple"
                              )}>
                                {obsidianHandle ? <RefreshCw size={14} className="text-void" /> : <Plus size={14} className="text-void" />}
                              </div>
                            </div>
                            
                            <div className="text-center space-y-2">
                              <h3 className={cn(
                                "text-sm font-display font-black uppercase tracking-[0.3em]",
                                obsidianHandle ? "text-neon-green" : "text-neon-purple"
                              )}>
                                {obsidianHandle ? 'Vault_Linked' : 'Obsidian_Vault_Sync'}
                              </h3>
                              <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest leading-relaxed max-w-[240px]">
                                {obsidianHandle 
                                  ? `Currently linked to: ${obsidianHandle.name}. Synchronize to update the Memori-City grid with the latest markdown nodes.`
                                  : "Establish a neural link with your local Obsidian vault. All markdown nodes will be indexed into the Memori-City grid."}
                              </p>
                              
                              {importError && (
                                <div className="mt-4 p-3 border border-neon-pink/40 bg-neon-pink/5 text-neon-pink font-mono text-[9px] uppercase tracking-widest leading-relaxed">
                                  {importError}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-3 w-full max-w-[240px]">
                              <button 
                                onClick={obsidianHandle ? () => syncObsidian(obsidianHandle) : mountObsidian}
                                disabled={isProcessing}
                                className={cn(
                                  "w-full py-2 border font-display font-black text-[11px] uppercase tracking-[0.2em] transition-all relative group overflow-hidden",
                                  obsidianHandle 
                                    ? "bg-neon-green/10 border-neon-green/40 text-neon-green hover:bg-neon-green hover:text-void"
                                    : "bg-neon-purple/10 border-neon-purple/40 text-neon-purple hover:bg-neon-purple hover:text-void"
                                )}
                              >
                                <div className="absolute inset-0 warning-stripes opacity-0 group-hover:opacity-20 transition-opacity" />
                                {isProcessing ? 'SYNCHRONIZING...' : obsidianHandle ? '[RUN_SYNC_CYCLE]' : '[SELECT_VAULT_DIRECTORY]'}
                              </button>

                              {obsidianHandle && (
                                <button 
                                  onClick={mountObsidian}
                                  disabled={isProcessing}
                                  className="w-full py-1.5 border border-white/10 text-white/40 hover:text-white hover:border-white/20 font-mono text-[9px] uppercase tracking-widest transition-all"
                                >
                                  Change_Vault_Handle
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-[7px] font-mono text-white/20 uppercase tracking-tighter">
                              <span>Recursive_Scan: ENABLED</span>
                              <span>•</span>
                              <span>Auto_Node_Generation: ACTIVE</span>
                            </div>
                          </div>
                        )}
                        {activeImport === 'url' && (
                          <div className="flex flex-col flex-1 min-h-0 gap-4 p-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-[8px] font-mono text-neon-cyan uppercase tracking-widest">Cloud_Resource_URL</label>
                              <div className="flex gap-2">
                                <input 
                                  type="text"
                                  placeholder="https://cloud.memori.city/stream/..."
                                  className="flex-1 bg-void/60 border border-neon-cyan/20 p-2 outline-none text-neon-cyan font-mono text-[10px] placeholder:text-neon-cyan/20"
                                />
                                <button className="px-4 py-1 bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan font-display font-black text-[10px] uppercase tracking-widest hover:bg-neon-cyan hover:text-void transition-all">
                                  Sync
                                </button>
                              </div>
                            </div>
                            <div className="flex-1 border border-dashed border-neon-cyan/10 flex flex-col items-center justify-center gap-2 opacity-40">
                              <Globe size={24} className="text-neon-cyan" />
                              <span className="text-[8px] font-mono uppercase tracking-widest">Awaiting_Cloud_Handshake...</span>
                            </div>
                          </div>
                        )}
                        {activeImport === 'voice' && (
                          <div className="flex flex-col flex-1 min-h-0 items-center justify-center p-8 gap-6">
                            <motion.div 
                              animate={{ 
                                scale: [1, 1.1, 1],
                                borderColor: ['rgba(0, 243, 255, 0.2)', 'rgba(0, 243, 255, 0.6)', 'rgba(0, 243, 255, 0.2)']
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="w-24 h-24 rounded-full border-2 flex items-center justify-center relative"
                            >
                              <Mic size={32} className="text-neon-cyan" />
                              <div className="absolute inset-0 rounded-full bg-neon-cyan/5 animate-ping" />
                            </motion.div>
                            <div className="text-center space-y-2">
                              <h3 className="text-sm font-display font-black text-neon-cyan uppercase tracking-[0.3em]">Neural_Link_Active</h3>
                              <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest leading-relaxed">
                                Streaming auditory data directly to the kernel. <br />
                                Semantic extraction in progress...
                              </p>
                            </div>
                            <div className="w-full max-w-[200px] h-1 bg-void border border-neon-cyan/10 overflow-hidden">
                              <motion.div 
                                animate={{ x: ['-100%', '100%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="w-1/2 h-full bg-neon-cyan shadow-[0_0_10px_var(--theme-cyan)]"
                              />
                            </div>
                          </div>
                        )}
                        {activeImport !== 'text' && activeImport !== 'obsidian' && activeImport !== 'url' && activeImport !== 'voice' && (
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
    
                <CodecPanel 
                  title="ORCHESTRATOR_V1" 
                  className="col-span-1"
                  ascii={`
  [ORCH]
   |--|
   |--|
                  `}
                >
                  <div className="flex flex-col gap-3 h-full">
                    <div className="text-[8px] font-mono text-white/40 uppercase leading-tight tracking-wider flex justify-between">
                      <span>Autonomous_City_Management_Core</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleOrchestrate}
                        disabled={isOrchestrating}
                        className={cn(
                          "w-full flex-1 border font-display font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 relative overflow-hidden",
                          isOrchestrating 
                            ? "bg-neon-cyan/5 border-neon-cyan/20 text-neon-cyan/40 cursor-wait" 
                            : "bg-neon-cyan/10 border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan hover:text-void"
                        )}
                      >
                        {isOrchestrating ? (
                          <>
                            <RefreshCw size={14} className="animate-spin" />
                            Thinking...
                          </>
                        ) : (
                          <>
                            <Workflow size={14} />
                            Run_Orchestration
                          </>
                        )}
                        {isOrchestrating && (
                          <motion.div 
                            className="absolute bottom-0 left-0 h-0.5 bg-neon-cyan"
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 5, ease: "linear" }}
                          />
                        )}
                      </motion.button>

                      <div className="p-1.5 bg-void/40 border border-white/5 rounded space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[7px] font-mono text-white/40 uppercase">Active_Agents</span>
                          <span className="text-[7px] font-mono text-neon-cyan">{agents.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[7px] font-mono text-white/40 uppercase">Sub_Agents</span>
                          <span className="text-[7px] font-mono text-neon-purple">{agents.filter(a => a.id.startsWith('pico-')).length}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[8px] font-mono text-neon-cyan/40 uppercase mt-auto flex items-center justify-between border-t border-neon-cyan/10 pt-2">
                      <span className="font-bold">ORCHESTRATOR_CORE</span>
                      <span className={cn("neon-glow-cyan", isOrchestrating ? "animate-pulse" : "")}>
                        {isOrchestrating ? '● EXECUTING' : '● READY'}
                      </span>
                    </div>
                  </div>
                </CodecPanel>

                <CodecPanel 
                  title="HERMES_LINK_V1" 
                  className="col-span-1"
                  ascii={`
  [HERM]
   /--\\
   \\--/
                  `}
                >
                  <div className="flex flex-col gap-3 h-full">
                    <div className="text-[8px] font-mono text-white/40 uppercase leading-tight tracking-wider">
                      Connect_Hermes_Agent_via_Memori_Protocol
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <motion.div 
                        whileHover={{ x: 4, backgroundColor: 'color-mix(in srgb, var(--theme-pink) 10%, transparent)' }}
                        onClick={() => setIsHermesImportOpen(true)}
                        className="p-2 border border-neon-pink/20 bg-void/60 flex items-center gap-2 group cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 w-1 h-full bg-neon-pink/40 group-hover:bg-neon-pink transition-colors" />
                        <Brain size={14} className="text-neon-pink" />
                        <span className="text-[9px] font-display font-black text-neon-pink uppercase tracking-widest">SYNC: ON</span>
                      </motion.div>
                      <motion.div 
                        whileHover={{ x: 4, backgroundColor: 'color-mix(in srgb, var(--theme-cyan) 10%, transparent)' }}
                        onClick={() => setIsArchOpen(true)}
                        className="p-2 border border-neon-cyan/20 bg-void/60 flex items-center gap-2 group cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 w-1 h-full bg-neon-cyan/40 group-hover:bg-neon-cyan transition-colors" />
                        <Code size={14} className="text-neon-cyan" />
                        <span className="text-[9px] font-display font-black text-neon-cyan uppercase tracking-widest">ARCH: VIEW</span>
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
          "flex flex-col gap-3 transition-all duration-500 min-h-0",
          !sidebarVisible ? "w-0" : viewMode === 'city' ? "w-48" : "w-80"
        )}>
          <AnimatePresence mode="popLayout">
            {sidebarVisible && (
              <motion.div
                key="right-sidebar"
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="flex flex-col gap-3 h-full"
              >
          <CodecPanel 
            title="COGNITIVE_RECALL_BUFFER" 
            className="h-64 min-h-0"
            onClose={() => setSidebarVisible(false)}
          >
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

          <CodecPanel 
            title="NODE_INSPECTOR_HUD" 
            className="flex-1 min-h-0"
            onClose={() => setSidebarVisible(false)}
          >
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
        </motion.div>
      )}
    </AnimatePresence>
  </div>

        {/* Right Sidebar Handle */}
        <SidebarHandle 
          side="right" 
          isVisible={sidebarVisible} 
          onClick={() => setSidebarVisible(!sidebarVisible)} 
        />
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

      {/* Swarm Collaboration Modal */}
      <AnimatePresence>
        {isSwarmModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSwarmModalOpen(false)}
              className="absolute inset-0 bg-void/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-black border border-neon-cyan/30 p-8 shadow-[0_0_50px_rgba(0,243,255,0.1)]"
            >
              <div className="dither-overlay opacity-5" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Network className="text-neon-cyan" size={24} />
                  <h2 className="text-xl font-display font-black text-neon-cyan uppercase tracking-[0.3em]">Swarm_Link</h2>
                </div>
                <button 
                  onClick={() => setIsSwarmModalOpen(false)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <Plus className="rotate-45" size={20} />
                </button>
              </div>

              {swarmRoomId ? (
                <div className="space-y-6">
                  <div className="p-4 border border-neon-green/20 bg-neon-green/5">
                    <div className="text-[10px] font-mono text-neon-green/60 uppercase mb-1">Active_Swarm_Room</div>
                    <div className="text-lg font-mono text-neon-green uppercase tracking-widest">{swarmRoomId}</div>
                    <div className="mt-2 flex items-center gap-2 text-[9px] font-mono text-white/40">
                      <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                      <span>{swarmPresence} NODES_CONNECTED</span>
                    </div>
                  </div>
                  <button 
                    onClick={leaveSwarm}
                    className="w-full py-3 border border-neon-pink/40 text-neon-pink font-display font-black uppercase tracking-[0.2em] hover:bg-neon-pink hover:text-white transition-all"
                  >
                    Disconnect_From_Swarm
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-[10px] font-mono text-white/40 uppercase leading-relaxed">
                    Establish a real-time neural link with other kernels. Build a shared memory base for collaboration or business intelligence.
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono text-neon-cyan/60 uppercase tracking-widest">Swarm_Room_ID</label>
                    <input 
                      type="text"
                      value={tempRoomId}
                      onChange={(e) => setTempRoomId(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && joinSwarm(tempRoomId)}
                      placeholder="ENTER_SWARM_ID..."
                      className="w-full bg-void/60 border border-neon-cyan/20 p-3 outline-none text-neon-cyan font-mono text-sm placeholder:text-neon-cyan/20"
                      autoFocus
                    />
                  </div>

                  <button 
                    onClick={() => joinSwarm(tempRoomId)}
                    disabled={!tempRoomId.trim()}
                    className="w-full py-3 bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan font-display font-black uppercase tracking-[0.2em] hover:bg-neon-cyan hover:text-void transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Establish_Link
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Skill Manager Modal */}
      <SkillManagerModal 
        agent={skillManagerAgent} 
        isOpen={!!skillManagerAgent} 
        onClose={() => setSkillManagerAgent(null)} 
      />

      {/* Hermes Import Modal */}
      <HermesImportModal 
        isOpen={isHermesImportOpen} 
        onClose={() => setIsHermesImportOpen(false)} 
      />

      {/* Music Player */}
      <MusicPlayer />

      {/* Glitch Overlay */}
      <AnimatePresence>
        {isGlitching && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] pointer-events-none mix-blend-difference"
          >
            <div className="absolute inset-0 bg-neon-cyan/10 animate-pulse" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.1)_2px,rgba(0,255,255,0.1)_4px)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Architecture Modal */}
      <AnimatePresence>
        {isArchOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsArchOpen(false)}
              className="absolute inset-0 bg-void/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-4xl h-full max-h-[80vh] relative z-10"
            >
              <CodecPanel title="SYSTEM_ARCHITECTURE_BLUEPRINT" className="h-full">
                <div className="flex flex-col h-full gap-6 overflow-auto p-4">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1 space-y-4">
                      <div className="p-4 border border-neon-cyan/40 bg-neon-cyan/5 rounded">
                        <h3 className="text-neon-cyan font-display font-black text-sm mb-2 uppercase tracking-widest">Orchestrator</h3>
                        <p className="text-[10px] text-white/60 leading-relaxed font-mono">
                          The central intelligence core. Analyzes city state, manages memory clusters, and delegates tasks to specialized sub-agents.
                        </p>
                      </div>
                      <div className="flex justify-center">
                        <div className="w-0.5 h-8 bg-neon-cyan/20" />
                      </div>
                      <div className="p-4 border border-neon-purple/40 bg-neon-purple/5 rounded">
                        <h3 className="text-neon-purple font-display font-black text-sm mb-2 uppercase tracking-widest">Sub-Agents</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                            <span className="text-[9px] font-mono text-white/80">JANITOR: Cleanup & Optimization</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
                            <span className="text-[9px] font-mono text-white/80">LINKER: Semantic Relationship Mapping</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-neon-pink" />
                            <span className="text-[9px] font-mono text-white/80">BUILDER: Node Generation & Structuring</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 space-y-6">
                      <div className="border border-white/10 bg-void/40 p-6 rounded relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                          <Network size={48} />
                        </div>
                        <h2 className="text-white font-display font-black text-xl mb-4 uppercase tracking-tighter italic">NEURAL_CITY_TOPOLOGY</h2>
                        <div className="space-y-4 font-mono text-[11px] text-white/40">
                          <p>Memori-City operates on a decentralized graph architecture where every piece of information is a node in a multi-dimensional space.</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <div className="text-neon-cyan uppercase text-[9px]">Memory_Layer</div>
                              <div className="h-1 w-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-neon-cyan w-3/4" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-neon-purple uppercase text-[9px]">Agent_Swarm</div>
                              <div className="h-1 w-full bg-white/5 overflow-hidden">
                                <div className="h-full bg-neon-purple w-1/2" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3 bg-white/5 border border-white/10 rounded font-mono text-[9px] leading-relaxed">
                            <span className="text-neon-green">SYSTEM_LOG:</span> Orchestrator initialized. Sub-agents deployed to District 7. Memory pruning in progress. Semantic link density at 84%.
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-white/10 bg-void/40 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Database size={14} className="text-neon-cyan" />
                            <span className="text-[10px] font-display font-black text-white uppercase">Data_Persistence</span>
                          </div>
                          <p className="text-[9px] text-white/40 font-mono">IndexedDB via Dexie.js ensures low-latency local storage for millions of nodes.</p>
                        </div>
                        <div className="p-4 border border-white/10 bg-void/40 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <Zap size={14} className="text-neon-yellow" />
                            <span className="text-[10px] font-display font-black text-white uppercase">Real-time_Sync</span>
                          </div>
                          <p className="text-[9px] text-white/40 font-mono">WebSocket streams provide instantaneous updates across the swarm.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setIsArchOpen(false)}
                    className="mt-auto w-full py-3 bg-white/5 border border-white/10 text-[10px] font-display font-black text-white/40 uppercase tracking-[0.5em] hover:text-white hover:bg-white/10 transition-all"
                  >
                    [CLOSE_BLUEPRINT]
                  </button>
                </div>
              </CodecPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* District Manager Modal */}
      <AnimatePresence>
        {isDistrictManagerOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDistrictManagerOpen(false)}
              className="absolute inset-0 bg-void/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl h-full max-h-[60vh] relative z-10"
            >
              <CodecPanel title="DISTRICT_MANAGER_V1" className="h-full">
                <div className="flex flex-col h-full gap-4 overflow-auto p-4">
                  <div className="space-y-4">
                    {[
                      { id: 'D1', name: 'CENTRAL_HUB', status: 'STABLE', load: 45, color: 'neon-cyan' },
                      { id: 'D2', name: 'NEURAL_NETWORKS', status: 'ACTIVE', load: 82, color: 'neon-purple' },
                      { id: 'D3', name: 'DATA_ARCHIVES', status: 'IDLE', load: 12, color: 'neon-green' },
                      { id: 'D4', name: 'VOID_SECTOR', status: 'WARNING', load: 94, color: 'neon-pink' },
                    ].map((district) => (
                      <div key={district.id} className="p-3 border border-white/10 bg-white/5 rounded flex items-center justify-between group hover:border-white/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 border border-${district.color}/40 flex items-center justify-center font-display font-black text-xs text-${district.color}`}>
                            {district.id}
                          </div>
                          <div>
                            <div className="text-[11px] font-display font-black text-white uppercase tracking-widest">{district.name}</div>
                            <div className="text-[8px] font-mono text-white/40 uppercase tracking-widest">STATUS: {district.status}</div>
                          </div>
                        </div>
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[7px] font-mono text-white/40 uppercase">
                            <span>LOAD</span>
                            <span>{district.load}%</span>
                          </div>
                          <div className="h-1 w-full bg-white/5 overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${district.load}%` }}
                              className={`h-full bg-${district.color}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setIsDistrictManagerOpen(false)}
                    className="mt-auto w-full py-3 bg-white/5 border border-white/10 text-[10px] font-display font-black text-white/40 uppercase tracking-[0.5em] hover:text-white hover:bg-white/10 transition-all"
                  >
                    [EXIT_DISTRICT_MANAGER]
                  </button>
                </div>
              </CodecPanel>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
