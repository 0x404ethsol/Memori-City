import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  AlertCircle, 
  FileText, 
  Database, 
  Zap,
  ChevronRight,
  ShieldCheck,
  Settings,
  Folder,
  Globe,
  Plus,
  Trash2,
  CheckSquare,
  Square
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

interface HermesImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PendingFile {
  id: string;
  name: string;
  size: string;
  district: string;
  heatScore: number;
  selected: boolean;
  sourcePath: string;
}

export const HermesImportModal: React.FC<HermesImportModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'scan' | 'confirm' | 'process' | 'settings'>('scan');
  const [sources, setSources] = useState([
    { id: '1', type: 'local', path: '~/Documents/Notes', active: true },
    { id: '2', type: 'gateway', path: 'IPFS Gateway Alpha', active: true },
  ]);

  const addSource = () => {
    const path = prompt("Enter source path or gateway URL:");
    if (path) {
      setSources(prev => [...prev, { 
        id: uuidv4(), 
        type: path.startsWith('http') ? 'gateway' : 'local', 
        path, 
        active: true 
      }]);
    }
  };

  const removeSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const toggleSource = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([
    { id: '1', name: 'Project_Alpha_Notes.md', size: '12KB', district: 'RESEARCH', heatScore: 85, selected: true, sourcePath: '~/Documents/Notes' },
    { id: '2', name: 'Meeting_Minutes_2024.md', size: '4KB', district: 'ARCHIVE', heatScore: 40, selected: true, sourcePath: '~/Documents/Notes' },
    { id: '3', name: 'Neural_Network_Design.md', size: '45KB', district: 'CORE', heatScore: 92, selected: true, sourcePath: 'IPFS Gateway Alpha' },
    { id: '4', name: 'Personal_Journal_March.md', size: '8KB', district: 'PRIVATE', heatScore: 60, selected: false, sourcePath: '~/Documents/Notes' },
  ]);

  const toggleFile = (id: string) => {
    setPendingFiles(prev => prev.map(f => f.id === id ? { ...f, selected: !f.selected } : f));
  };

  const toggleAll = () => {
    const allSelected = pendingFiles.every(f => f.selected);
    setPendingFiles(prev => prev.map(f => ({ ...f, selected: !allSelected })));
  };

  const handleConfirm = async () => {
    setStep('process');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const selectedFiles = pendingFiles.filter(f => f.selected);
    
    for (const file of selectedFiles) {
      await db.vault.add({
        id: uuidv4(),
        node_id: `node_${uuidv4().slice(0, 8)}`,
        author_uid: 'hermes_agent',
        memori_uri: `hermes://import/${file.name}`,
        content: `# ${file.name}\nImported via Hermes Protocol.\n\nThis is a simulated import of ${file.name} into the ${file.district} district.`,
        summary: `Automated import of ${file.name} with heat score ${file.heatScore}.`,
        l0_abstract: `Imported memory kernel from local source.`,
        tags: ['hermes_import', file.district.toLowerCase()],
        district: file.district,
        is_public: false,
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      });
    }
    
    onClose();
    setStep('scan');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Photo with Pink Tint (Hermes Brand) */}
      <div 
        className="absolute inset-0 bg-cover bg-center grayscale contrast-[1.8] brightness-[0.4]"
        style={{ 
          backgroundImage: `url('https://picsum.photos/seed/cyberpunk-girl/1920/1080?grayscale')`,
        }}
      />
      <div className="absolute inset-0 bg-neon-pink/20 mix-blend-color" />
      <div className="absolute inset-0 bg-void/80 backdrop-blur-xl" />
      <div className="absolute inset-0 grid-bg opacity-10" />
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="max-w-2xl w-full border border-neon-pink/30 bg-void/95 flex flex-col battle-border overflow-hidden relative z-10"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-neon-pink/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-neon-pink/20" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 hermes-logo-container battle-border group">
              <img 
                src="https://picsum.photos/seed/hermes-statue/200/200" 
                alt="Hermes Logo" 
                referrerPolicy="no-referrer"
                className="group-hover:scale-110 transition-transform duration-700"
              />
              <div className="dither-overlay animate-dither" />
              <div className="absolute inset-0 bg-neon-pink/10 mix-blend-color" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-white uppercase tracking-widest flex items-center gap-2">
                Hermes_Import_Protocol
                <span className="text-[10px] font-mono text-neon-pink bg-neon-pink/10 px-2 py-0.5 rounded border border-neon-pink/20">
                  HITL_REQUIRED
                </span>
              </h2>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                Human-in-the-loop verification // 人間の介入
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setStep(step === 'settings' ? 'scan' : 'settings')}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-all border",
                step === 'settings' ? "bg-neon-pink text-void border-neon-pink" : "text-white/40 border-white/10 hover:text-white hover:bg-white/10"
              )}
              title="Configuration"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white/40 border border-white/10 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 min-h-[400px] relative overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center grayscale contrast-200 brightness-[0.2] opacity-20 pointer-events-none"
            style={{ 
              backgroundImage: `url('https://picsum.photos/seed/cyberpunk-girl/1080/1080?grayscale')`,
            }}
          />
          <div className="absolute inset-0 bg-neon-pink/[0.05] mix-blend-color pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {step === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono font-bold text-neon-pink uppercase tracking-[0.2em]">Source_Gateways</h3>
                  <button 
                    onClick={addSource}
                    className="flex items-center gap-2 text-[10px] font-mono text-neon-cyan hover:text-white transition-colors"
                  >
                    <Plus size={12} />
                    ADD_NEW_SOURCE
                  </button>
                </div>

                <div className="space-y-3">
                  {sources.map(source => (
                    <div key={source.id} className="p-4 border border-white/10 bg-white/5 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-white/40">
                          {source.type === 'local' ? <Folder size={18} /> : <Globe size={18} />}
                        </div>
                        <div>
                          <div className="text-[10px] font-mono font-bold text-white uppercase">{source.path}</div>
                          <div className="text-[8px] font-mono text-white/40 uppercase">{source.type === 'local' ? 'Local Directory' : 'Cloud Gateway'}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => removeSource(source.id)}
                          className="p-2 text-white/20 hover:text-neon-pink transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                        <div 
                          onClick={() => toggleSource(source.id)}
                          className={cn(
                            "w-8 h-4 rounded-full relative cursor-pointer transition-colors",
                            source.active ? "bg-neon-pink" : "bg-white/10"
                          )}
                        >
                          <div className={cn(
                            "absolute top-1 w-2 h-2 rounded-full bg-white transition-all",
                            source.active ? "left-5" : "left-1"
                          )} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border border-neon-cyan/20 bg-neon-cyan/5 space-y-3">
                  <h4 className="text-[10px] font-mono font-bold text-neon-cyan uppercase">Global_Settings</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/60">Auto-Scan on Startup</span>
                    <div className="w-8 h-4 rounded-full bg-white/10 relative cursor-pointer">
                      <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/40" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-white/60">Semantic Heat Filtering</span>
                    <div className="w-8 h-4 rounded-full bg-neon-pink relative cursor-pointer">
                      <div className="absolute top-1 left-5 w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'scan' && (
              <motion.div 
                key="scan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6"
              >
              <div className="relative">
                <Database size={64} className="text-neon-pink/20 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 border-2 border-neon-pink/40 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-mono text-white uppercase tracking-widest">Scanning_Local_Gateways...</p>
                <p className="text-[10px] font-mono text-white/40 italic">Hermes is searching for .md kernels in configured districts</p>
              </div>
              <button 
                onClick={() => setStep('confirm')}
                className="px-8 py-3 bg-neon-pink/10 border border-neon-pink/30 text-neon-pink font-display font-black text-xs uppercase tracking-[0.3em] hover:bg-neon-pink hover:text-white transition-all"
              >
                Initialize_Manifest
              </button>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div 
              key="confirm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col h-full space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-neon-yellow/10 flex items-center justify-center text-neon-yellow border border-neon-yellow/20">
                    <CheckSquare size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">Semantic_Manifest_v1.0</h3>
                    <p className="text-[8px] font-mono text-white/40 uppercase">Awaiting human validation // 検証待ち</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={toggleAll}
                    className="text-[10px] font-mono text-neon-cyan hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2"
                  >
                    {pendingFiles.every(f => f.selected) ? <CheckSquare size={12} /> : <Square size={12} />}
                    {pendingFiles.every(f => f.selected) ? 'DESELECT_ALL' : 'SELECT_ALL'}
                  </button>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <span className="text-[10px] font-mono text-white/20 tracking-widest">
                    {pendingFiles.filter(f => f.selected).length} / {pendingFiles.length} READY
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-2 min-h-0">
                {pendingFiles.map(file => (
                  <div 
                    key={file.id}
                    onClick={() => toggleFile(file.id)}
                    className={cn(
                      "group relative p-3 border transition-all cursor-pointer flex items-center justify-between overflow-hidden",
                      file.selected 
                        ? "bg-neon-pink/5 border-neon-pink/30 shadow-[inset_0_0_20px_rgba(255,0,255,0.05)]" 
                        : "bg-white/[0.02] border-white/5 opacity-50 hover:opacity-100 hover:border-white/20"
                    )}
                  >
                    {/* Selection Indicator Bar */}
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 transition-all",
                      file.selected ? "bg-neon-pink" : "bg-transparent"
                    )} />

                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn(
                        "w-10 h-10 flex items-center justify-center border transition-all",
                        file.selected ? "border-neon-pink/40 bg-neon-pink/10" : "border-white/10 bg-white/5"
                      )}>
                        <FileText size={18} className={file.selected ? "text-neon-pink" : "text-white/20"} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] font-mono font-bold text-white uppercase truncate">{file.name}</span>
                          <span className="text-[8px] font-mono text-white/20">{file.size}</span>
                          <span className="text-[7px] font-mono text-neon-cyan/40 truncate ml-auto">SRC: {file.sourcePath}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "px-1.5 py-0.5 rounded-[2px] text-[7px] font-mono font-bold uppercase tracking-widest border",
                            file.district === 'CORE' ? "bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan" :
                            file.district === 'RESEARCH' ? "bg-neon-purple/10 border-neon-purple/30 text-neon-purple" :
                            file.district === 'PRIVATE' ? "bg-neon-pink/10 border-neon-pink/30 text-neon-pink" :
                            "bg-white/10 border-white/20 text-white/60"
                          )}>
                            {file.district}
                          </div>
                          
                          <div className="flex-1 flex items-center gap-2 max-w-[120px]">
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${file.heatScore}%` }}
                                className={cn(
                                  "h-full rounded-full",
                                  file.heatScore > 80 ? "bg-neon-green" : file.heatScore > 50 ? "bg-neon-yellow" : "bg-neon-pink"
                                )}
                              />
                            </div>
                            <span className={cn(
                              "text-[8px] font-mono font-bold w-6",
                              file.heatScore > 80 ? "text-neon-green" : file.heatScore > 50 ? "text-neon-yellow" : "text-neon-pink"
                            )}>{file.heatScore}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 ml-4">
                      <div className={cn(
                        "w-5 h-5 border flex items-center justify-center transition-all",
                        file.selected ? "bg-neon-pink border-neon-pink text-void" : "border-white/20 group-hover:border-white/40"
                      )}>
                        {file.selected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-neon-yellow/5 border border-neon-yellow/20 p-4 flex gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-yellow/20 to-transparent" />
                <ShieldCheck size={20} className="text-neon-yellow shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-neon-yellow font-bold uppercase tracking-widest">Security_Advisory</p>
                  <p className="text-[10px] font-mono text-neon-yellow/60 leading-relaxed italic">
                    Ingesting external kernels will modify the semantic landscape of Memori-City. Ensure all selected files are trusted sources.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'process' && (
            <motion.div 
              key="process"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="w-full max-w-xs h-1 bg-white/10 relative overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 bg-neon-pink"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-mono text-white uppercase tracking-widest">Committing_Kernels_To_Vault...</p>
                <p className="text-[10px] font-mono text-white/40 italic">Integrating semantic structures into city districts</p>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button 
            onClick={() => {
              if (step === 'settings') setStep('scan');
              else onClose();
            }}
            className="px-6 py-2 border border-white/10 text-[10px] font-mono text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all"
          >
            {step === 'settings' ? 'Back_To_Import' : 'Abort_Protocol'}
          </button>
          {(step === 'confirm' || step === 'settings') && (
            <button 
              onClick={() => {
                if (step === 'settings') setStep('scan');
                else handleConfirm();
              }}
              className="px-8 py-2 bg-neon-pink text-void font-display font-black text-[10px] uppercase tracking-widest hover:bg-white transition-all flex items-center gap-2"
            >
              {step === 'settings' ? 'Save_Configuration' : 'Confirm_Ingestion'}
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
