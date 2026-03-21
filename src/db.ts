import Dexie, { type EntityTable } from 'dexie';
import { MemoriNode, AgentRecord, Skill, ResearchTask, FileNode, AppSettings } from './types';

// Define the local database
const db = new Dexie('MemoriCityDB') as Dexie & {
  vault: EntityTable<MemoriNode, 'id'>;
  agents: EntityTable<AgentRecord, 'id'>;
  skills: EntityTable<Skill, 'id'>;
  research: EntityTable<ResearchTask, 'id'>;
  files: EntityTable<FileNode, 'id'>;
  settings: EntityTable<AppSettings, 'id'>;
};

// Schema definition
db.version(7).stores({
  vault: 'id, node_id, memori_uri, created_at, modified_at, author_uid, district, is_public',
  agents: 'id, agent_id, agent_type, status',
  skills: 'id, name, category, is_active',
  research: 'id, query, status, created_at',
  files: 'id, name, type, parentId, isTrash',
  settings: 'id'
});

export { db };
