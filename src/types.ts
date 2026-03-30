export interface Skill {
  id: string;
  name: string;
  description: string;
  code?: string;
  schema?: any; // JSON Schema for tool call
  category: 'automation' | 'research' | 'utility' | 'custom';
  created_at: string;
  updated_at: string;
  is_active: boolean;
  dependencies?: string[]; // IDs of skills that must complete before this one
}

export interface MemoriNode {
  id: string;
  node_id: string;
  memori_uri: string;
  created_at: string;
  modified_at: string;
  author_uid: string;
  content: string;
  l0_abstract?: string;
  heat_score?: number;
  tags?: string[];
  vision_caption?: string;
  // City Metadata
  district?: string;
  floor?: number;
  building_id?: string;
  position?: [number, number, number];
  // Memory Graph (Architectural Expansion)
  relations?: {
    target_id: string;
    type: 'references' | 'contradicts' | 'supports' | 'derived_from' | 'context_for';
    weight: number;
  }[];
  importance?: number; // 0-1, used for pruning/retrieval
  summary?: string; // Token-saving abstract
  embedding?: number[]; // Vector embedding for semantic search
  last_accessed?: string;
  is_public?: boolean;
}

export interface TaskDetail {
  id: string;
  label: string;
  priority: 'low' | 'medium' | 'high';
  parameters?: Record<string, any>;
  started_at: string;
}

export interface AgentRecord {
  id: string;
  agent_id: string;
  agent_type: 'janitor' | 'linker' | 'researcher' | 'archivist' | 'notary' | 'builder';
  status: 'sleeping' | 'running' | 'dead';
  last_heartbeat: string;
  current_task?: string;
  task_queue?: string[];
  current_task_details?: TaskDetail;
  thinking_log?: string[];
  target_building?: string;
  current_pos?: [number, number, number];
  assigned_nodes?: string[]; // IDs of nodes to process
  equipped_skills?: string[]; // IDs of skills to use
}

export interface ResearchTask {
  id: string;
  query: string;
  status: 'searching' | 'extracting' | 'synthesizing' | 'completed' | 'failed';
  progress: number;
  results: string[];
  verification_score: number;
  pico_claws: string[]; // IDs of agents working on this
  iterations: number;
  max_iterations: number;
  created_at: string;
  updated_at: string;
}

export interface MetaSkill extends Skill {
  is_meta: boolean;
  sub_skills: string[]; // IDs of skills it coordinates
  loop_config: {
    max_loops: number;
    exit_condition: string;
  };
}

export interface LLMConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'custom' | 'webgpu';
  apiKey?: string;
  baseUrl?: string;
  modelName: string;
}

export interface DeepResearchConfig {
  llm: LLMConfig;
  useLocalOllama: boolean;
  maxIterations: number;
}

export interface UserProfile {
  name: string;
  avatar?: string;
  bio?: string;
  rank?: string;
  joined_at: string;
}

export interface AppSettings {
  id: 'current';
  isAutoUpdate: boolean;
  fontSize: number;
  lineWrap: boolean;
  theme: 'light' | 'dark' | 'system';
  visualTheme?: 'cyberpunk' | 'minimalist' | 'scifi' | 'retro-futurism' | 'organic-growth' | 'deep-sea';
  accentColor: string;
  activePlugins: string[];
  language: string;
  llm: LLMConfig;
  deepResearch: DeepResearchConfig;
  encryptionSecret?: string;
  defaultNoteLocation: 'root' | 'current' | 'folder';
  deleteBehavior: 'trash' | 'dot-trash' | 'permanent';
  profile?: UserProfile;
  subagent_presets?: {
    [key: string]: {
      skills: string[];
    }
  };
}

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  isTrash?: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface BlackboardState {
  active_agents: AgentRecord[];
  current_task?: string;
  memory_pressure: number;
  rrl_cycle: number;
}
