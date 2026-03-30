import { db } from '../db';
import { MemoriNode, LLMConfig, AppSettings } from '../types';
import { LLMService } from './llmService';

// Helper for vector similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export class MemoryService {
  private llm: LLMService;
  private settings: AppSettings;

  constructor(settings: AppSettings) {
    this.settings = settings;
    this.llm = new LLMService(settings.llm);
  }

  /**
   * Adds a new memory node with vector embeddings
   */
  async addMemory(content: string, metadata?: Partial<MemoriNode>): Promise<MemoriNode> {
    const id = crypto.randomUUID();
    
    // Generate embedding for semantic search
    let embedding: number[] = [];
    try {
      embedding = await this.llm.generateEmbedding(content);
    } catch (err) {
      console.error('Failed to generate embedding:', err);
    }

    const node: MemoriNode = {
      id,
      node_id: `mem_${id.substring(0, 8)}`,
      memori_uri: `local://${id}`,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
      author_uid: 'local_user',
      content,
      embedding,
      is_public: false,
      ...metadata
    };

    await db.vault.put(node);
    return node;
  }

  /**
   * Consolidates a memory node by generating a token-efficient summary.
   * This helps agents recall the core information without reading the full content.
   */
  async consolidate(nodeId: string): Promise<void> {
    const node = await db.vault.get(nodeId);
    if (!node) return;

    const systemPrompt = "You are a Memory Consolidation Kernel. Your task is to summarize the provided memory node into a highly dense, token-efficient 'Knowledge Kernel'. Focus on facts, relations, and core intent. Max 100 words.";
    const userPrompt = `Node Content: ${node.content}`;

    try {
      const summary = await this.llm.generateText(userPrompt, systemPrompt);
      await db.vault.update(nodeId, {
        summary,
        modified_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Consolidation failed:', err);
    }
  }

  /**
   * Identifies relations between nodes to build a semantic knowledge graph.
   */
  async identifyRelations(nodeId: string): Promise<void> {
    const node = await db.vault.get(nodeId);
    if (!node) return;

    const allNodes = await db.vault.toArray();
    const otherNodes = allNodes.filter(n => n.id !== nodeId).slice(0, 20); // Limit for context window

    const systemPrompt = `You are a Semantic Linker. Identify relations between the new node and existing nodes. 
    Return a JSON array of relations: { target_id: string, type: 'references' | 'contradicts' | 'supports' | 'derived_from' | 'context_for', weight: number }. 
    Weight is 0-1. Return ONLY the JSON.`;

    const context = otherNodes.map(n => `ID: ${n.id}, Title: ${n.node_id}, Summary: ${n.summary || n.content.slice(0, 100)}`).join('\n');
    const userPrompt = `New Node Content: ${node.content}\n\nExisting Nodes:\n${context}`;

    try {
      const response = await this.llm.generateText(userPrompt, systemPrompt);
      const relations = JSON.parse(response.replace(/```json|```/g, '').trim());
      
      await db.vault.update(nodeId, {
        relations,
        modified_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Relation identification failed:', err);
    }
  }

  /**
   * Retrieves the most relevant memory fragments for a given task context.
   * This is the "Recall" mechanism for agents using vector similarity.
   */
  async recall(taskContext: string, limit: number = 5): Promise<MemoriNode[]> {
    const allNodes = await db.vault.toArray();
    
    if (allNodes.length === 0) return [];

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.llm.generateEmbedding(taskContext);
      
      if (queryEmbedding.length > 0) {
        // Calculate similarity scores
        const scoredNodes = allNodes.map(node => {
          const score = node.embedding && node.embedding.length > 0 
            ? cosineSimilarity(queryEmbedding, node.embedding)
            : 0;
          return { node, score };
        });

        // Sort by highest similarity
        scoredNodes.sort((a, b) => b.score - a.score);
        
        // Update last_accessed for recalled nodes
        const topNodes = scoredNodes.slice(0, limit).map(sn => sn.node);
        const now = new Date().toISOString();
        for (const node of topNodes) {
          await db.vault.update(node.id, { last_accessed: now });
        }

        return topNodes;
      }
    } catch (err) {
      console.error('Vector recall failed, falling back to LLM ranking:', err);
    }

    // Fallback to LLM ranking if embeddings fail
    const systemPrompt = `You are a Retrieval Kernel. Given a task context and a list of memory nodes, rank the top ${limit} most relevant nodes. 
    Return ONLY a comma-separated list of IDs.`;

    const nodeContext = allNodes.map(n => `ID: ${n.id}, Summary: ${n.summary || n.content.slice(0, 100)}`).join('\n');
    const userPrompt = `Task Context: ${taskContext}\n\nMemories:\n${nodeContext}`;

    try {
      const response = await this.llm.generateText(userPrompt, systemPrompt);
      const topIds = response.split(',').map(id => id.trim());
      
      const results = await Promise.all(topIds.map(id => db.vault.get(id)));
      return results.filter((n): n is MemoriNode => !!n);
    } catch (err) {
      console.error('Recall failed:', err);
      return [];
    }
  }

  /**
   * Identifies nodes for pruning based on importance and age.
   * This is the "Forgetting" mechanism for agents.
   */
  async getPrunableNodes(threshold: number = 0.2): Promise<MemoriNode[]> {
    const allNodes = await db.vault.toArray();
    const now = new Date().getTime();
    
    return allNodes.filter(node => {
      // Never prune public nodes - they are part of the Knowledge Commons
      if (node.is_public) return false;
      
      const importance = node.importance || 0.5;
      const lastAccessed = node.last_accessed ? new Date(node.last_accessed).getTime() : 0;
      const ageInDays = (now - lastAccessed) / (1000 * 60 * 60 * 24);
      
      // Heuristic: Low importance and old nodes are prunable
      const score = importance / (1 + ageInDays);
      return score < threshold;
    });
  }
}
