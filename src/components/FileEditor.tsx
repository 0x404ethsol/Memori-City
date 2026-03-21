import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { FileNode } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Edit3,
  Save,
  FileCode,
  FolderPlus,
  FilePlus,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TreeItemProps {
  node: FileNode;
  level: number;
  onSelect: (node: FileNode) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
  expandedFolders: Set<string>;
  toggleFolder: (id: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({ 
  node, 
  level, 
  onSelect, 
  onDelete,
  selectedId, 
  expandedFolders, 
  toggleFolder 
}) => {
  const isExpanded = expandedFolders.has(node.id);
  const isSelected = selectedId === node.id;
  
  const children = useLiveQuery(
    () => db.files.where('parentId').equals(node.id).toArray(),
    [node.id]
  );

  return (
    <div className="select-none">
      <div 
        className={cn(
          "flex items-center py-1 px-2 cursor-pointer hover:bg-neon-cyan/5 transition-colors group relative",
          isSelected && "bg-neon-cyan/10 text-neon-cyan border-l-2 border-neon-cyan"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (node.type === 'folder') toggleFolder(node.id);
          onSelect(node);
        }}
      >
        <div className="mr-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
          {node.type === 'folder' ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div className="w-3.5" />
          )}
        </div>
        
        <div className={cn("mr-2", node.type === 'folder' ? "text-neon-purple" : "text-neon-blue")}>
          {node.type === 'folder' ? <Folder size={12} /> : <File size={12} />}
        </div>
        
        <span className="text-[9px] font-mono truncate uppercase tracking-tight">
          {node.name}
        </span>

        {isSelected && (
          <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(node.id);
              }}
              className="p-0.5 hover:text-neon-pink"
              title="Delete"
            >
              <Trash2 size={10} />
            </button>
            {node.type === 'folder' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Logic to add child
                }}
                className="p-0.5 hover:text-neon-green"
              >
                <Plus size={10} />
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {node.type === 'folder' && isExpanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children.map(child => (
              <TreeItem 
                key={child.id} 
                node={child} 
                level={level + 1} 
                onSelect={onSelect}
                onDelete={onDelete}
                selectedId={selectedId}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const FileEditor: React.FC = () => {
  const { settings } = useSettings();
  const rootFiles = useLiveQuery(() => db.files.where('parentId').equals('root').and(f => !f.isTrash).toArray()) || [];
  const trashFiles = useLiveQuery(() => db.files.where('isTrash').equals(1).toArray()) || [];
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [isTrashExpanded, setIsTrashExpanded] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toggleFolder = (id: string) => {
    const next = new Set(expandedFolders);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedFolders(next);
  };

  const handleSelect = (node: FileNode) => {
    setSelectedNode(node);
    if (node.type === 'file') {
      setEditorContent(node.content || '');
    }
  };

  const saveFile = async () => {
    if (!selectedNode || selectedNode.type !== 'file') return;
    setIsSaving(true);
    try {
      await db.files.update(selectedNode.id, { 
        content: editorContent,
        updated_at: new Date().toISOString()
      });
      // Update local state too
      setSelectedNode({ ...selectedNode, content: editorContent });
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const formatContent = () => {
    if (!editorContent) return;
    
    try {
      // Try parsing as JSON first
      const parsed = JSON.parse(editorContent);
      setEditorContent(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Not JSON, apply simple markdown formatting
      let formatted = editorContent
        // Remove multiple consecutive blank lines
        .replace(/\n{3,}/g, '\n\n')
        // Ensure space after headings
        .replace(/^(#+)([^ #\n])/gm, '$1 $2')
        // Ensure lists have consistent spacing
        .replace(/^(\s*[-*+])\s+/gm, '$1 ')
        // Trim trailing spaces
        .replace(/[ \t]+$/gm, '')
        // Ensure single newline at end of file
        .trim() + '\n';
        
      setEditorContent(formatted);
    }
  };

  const deleteFile = async (id: string) => {
    if (!settings) return;
    
    if (settings.deleteBehavior === 'permanent') {
      await db.files.delete(id);
    } else if (settings.deleteBehavior === 'dot-trash') {
      // Move to .trash folder in vault
      let trashFolder = await db.files.where('name').equals('.trash').and(f => f.type === 'folder').first();
      if (!trashFolder) {
        const trashId = 'folder_dot_trash';
        await db.files.add({
          id: trashId,
          name: '.trash',
          type: 'folder',
          parentId: 'root',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        trashFolder = await db.files.get(trashId);
      }
      
      if (trashFolder) {
        await db.files.update(id, { parentId: trashFolder.id, updated_at: new Date().toISOString() });
      }
    } else {
      // Move to system trash (isTrash = 1)
      await db.files.update(id, { isTrash: 1, updated_at: new Date().toISOString() });
    }
    
    if (selectedNode?.id === id) {
      setSelectedNode(null);
      setEditorContent('');
    }
  };

  const restoreFile = async (id: string) => {
    await db.files.update(id, { isTrash: 0, updated_at: new Date().toISOString() });
  };

  const emptyTrash = async () => {
    const trashIds = (await db.files.where('isTrash').equals(1).toArray()).map(f => f.id);
    await db.files.bulkDelete(trashIds);
  };

  const createNew = async (type: 'file' | 'folder', parentId: string = 'root') => {
    const name = type === 'file' ? 'new_file.md' : 'new_folder';
    const id = `file_${Math.random().toString(36).substring(2, 10)}`;
    
    // Respect defaultNoteLocation if creating a file and no parentId specified
    let targetParentId = parentId;
    if (type === 'file' && parentId === 'root' && settings?.defaultNoteLocation) {
      // Try to find the folder specified in settings
      const folder = await db.files.where('name').equals(settings.defaultNoteLocation).first();
      if (folder && folder.type === 'folder') {
        targetParentId = folder.id;
      }
    }

    const newNode: FileNode = {
      id,
      name,
      type,
      parentId: targetParentId,
      content: type === 'file' ? '# New File\n\nStart writing...' : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await db.files.add(newNode);
    if (type === 'folder' || targetParentId !== 'root') {
      const next = new Set(expandedFolders);
      next.add(targetParentId);
      setExpandedFolders(next);
    }
    setSelectedNode(newNode);
    setEditorContent(newNode.content || '');
  };

  return (
    <div className="flex h-full w-full bg-void/40 backdrop-blur-md border border-neon-cyan/20 overflow-hidden">
      {/* Sidebar - File Tree */}
      <div className="w-64 border-r border-neon-cyan/10 flex flex-col bg-void/60">
        <div className="p-2 border-b border-neon-cyan/10 flex items-center justify-between bg-neon-cyan/5">
          <span className="text-[9px] font-display font-black text-neon-cyan uppercase tracking-[0.2em]">Vault_Explorer</span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => createNew('folder')} className="text-neon-purple hover:text-white transition-colors" title="New Folder">
              <FolderPlus size={12} />
            </button>
            <button onClick={() => createNew('file')} className="text-neon-blue hover:text-white transition-colors" title="New File">
              <FilePlus size={12} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          {rootFiles.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-[9px] font-mono text-white/20 uppercase mb-4">No files found in root</p>
              <button 
                onClick={() => createNew('file')}
                className="text-[9px] font-mono text-neon-cyan border border-neon-cyan/20 px-3 py-1 hover:bg-neon-cyan/10"
              >
                [INITIALIZE_ROOT]
              </button>
            </div>
          ) : (
            rootFiles.map(node => (
              <TreeItem 
                key={node.id} 
                node={node} 
                level={0} 
                onSelect={handleSelect}
                onDelete={deleteFile}
                selectedId={selectedNode?.id}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))
          )}

          {/* Trash Section */}
          {trashFiles.length > 0 && (
            <div className="mt-4 border-t border-white/5 pt-2">
              <div 
                className="flex items-center justify-between px-2 py-1 cursor-pointer hover:bg-neon-pink/5 text-white/40 hover:text-neon-pink transition-all"
                onClick={() => setIsTrashExpanded(!isTrashExpanded)}
              >
                <div className="flex items-center gap-2">
                  {isTrashExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  <Trash2 size={12} />
                  <span className="text-[9px] font-mono uppercase tracking-widest">Trash ({trashFiles.length})</span>
                </div>
                {isTrashExpanded && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      emptyTrash();
                    }}
                    className="text-[7px] font-mono uppercase hover:underline"
                  >
                    Empty
                  </button>
                )}
              </div>
              
              <AnimatePresence>
                {isTrashExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    {trashFiles.map(node => (
                      <div 
                        key={node.id}
                        className="flex items-center justify-between py-1 px-4 hover:bg-white/5 group"
                      >
                        <div className="flex items-center gap-2 opacity-40">
                          {node.type === 'folder' ? <Folder size={10} /> : <File size={10} />}
                          <span className="text-[8px] font-mono uppercase truncate max-w-[100px]">{node.name}</span>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => restoreFile(node.id)}
                            className="text-[7px] font-mono uppercase text-neon-green hover:underline"
                          >
                            Restore
                          </button>
                          <button 
                            onClick={() => db.files.delete(node.id)}
                            className="text-[7px] font-mono uppercase text-neon-pink hover:underline"
                          >
                            Purge
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="p-2 border-t border-neon-cyan/10 bg-void/80">
          <div className="flex items-center justify-between text-[7px] font-mono text-white/30 uppercase">
            <span>Nodes: {rootFiles.length}</span>
            <span className="text-neon-green">Status: OK</span>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col relative">
        <AnimatePresence mode="wait">
          {selectedNode ? (
            <motion.div 
              key={selectedNode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col"
            >
              {/* Editor Header */}
              <div className="h-10 border-b border-neon-cyan/10 flex items-center justify-between px-4 bg-void/40">
                <div className="flex items-center gap-2">
                  <FileCode size={14} className="text-neon-cyan" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-display font-black text-white uppercase tracking-widest">{selectedNode.name}</span>
                    <span className="text-[6px] font-mono text-white/30 uppercase tracking-tighter">
                      Last_Modified: {new Date(selectedNode.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedNode.type === 'file' && (
                    <button 
                      onClick={formatContent}
                      className="flex items-center gap-2 px-4 py-1.5 border border-neon-purple/40 text-neon-purple hover:bg-neon-purple hover:text-void transition-all text-[10px] font-mono uppercase tracking-widest"
                      title="Format Content"
                    >
                      <Wand2 size={12} />
                      FORMAT
                    </button>
                  )}
                  {selectedNode.type === 'file' && (
                    <button 
                      onClick={() => deleteFile(selectedNode.id)}
                      className="p-1.5 text-white/40 hover:text-neon-pink hover:border-neon-pink border border-transparent transition-all"
                      title="Delete Node"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  {selectedNode.type === 'file' && (
                    <button 
                      onClick={saveFile}
                      disabled={isSaving}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 border transition-all text-[10px] font-mono uppercase tracking-widest",
                        isSaving 
                          ? "border-neon-green text-neon-green bg-neon-green/10" 
                          : "border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan hover:text-void"
                      )}
                    >
                      <Save size={12} />
                      {isSaving ? 'SAVED' : 'COMMIT_CHANGES'}
                    </button>
                  )}
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 relative group">
                <div className="absolute inset-0 warning-stripes opacity-[0.02] pointer-events-none" />
                {selectedNode.type === 'file' ? (
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    className={cn(
                      "w-full h-full bg-transparent p-8 outline-none text-neon-green font-mono resize-none custom-scrollbar leading-relaxed",
                      !settings.lineWrap && "whitespace-pre overflow-x-auto"
                    )}
                    style={{ fontSize: `${settings.fontSize}px` }}
                    spellCheck={false}
                  />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-6 opacity-20">
                    <Folder size={80} className="text-neon-purple" />
                    <div className="text-center space-y-2">
                      <p className="text-xl font-display font-black text-white uppercase tracking-[0.4em]">Directory_Node</p>
                      <p className="text-xs font-mono text-white uppercase tracking-widest">Select a file to view content</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-8 opacity-10">
              <div className="relative">
                <Edit3 size={120} className="text-white" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border border-neon-cyan/20 animate-ping" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <p className="text-2xl font-display font-black text-white uppercase tracking-[0.6em]">Awaiting_Selection</p>
                <p className="text-sm font-mono text-white uppercase tracking-[0.2em]">Open a node from the explorer to begin editing</p>
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Editor Footer */}
        <div className="h-8 border-t border-neon-cyan/10 bg-void/60 flex items-center px-6 justify-between">
          <div className="flex items-center gap-4 text-[9px] font-mono text-white/40 uppercase">
            <span>Encoding: UTF-8</span>
            <span>Language: Markdown</span>
          </div>
          <div className="text-[9px] font-mono text-neon-cyan/60 uppercase tracking-widest">
            MEMORI-CITY_EDITOR_V1.0 // 編集者
          </div>
        </div>
      </div>
    </div>
  );
};
