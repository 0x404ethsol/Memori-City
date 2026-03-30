import { db } from '../db';
import { LLMService } from './llmService';
import { AppSettings, AgentRecord } from '../types';

export class OrchestratorService {
  private llm: LLMService;
  private settings: AppSettings;

  constructor(settings: AppSettings) {
    this.settings = settings;
    this.llm = new LLMService(settings.llm);
  }

  async orchestrate() {
    console.log('[Orchestrator] Starting cycle...');
    
    // 1. Get current city state
    const nodes = await db.vault.toArray();
    const agents = await db.agents.toArray();
    const files = await db.files.toArray();

    // 2. Brainstorm tasks based on state
    const systemPrompt = `You are the Memori-City Orchestrator. 
    You manage a swarm of pico-agents.
    Current City State:
    - Nodes: ${nodes.length}
    - Agents: ${agents.length}
    - Files: ${files.length}

    Available Nodes for Delegation:
    ${nodes.map(n => `- ${n.id}: ${n.memori_uri}`).join('\n')}

    Your goal is to maintain the city. 
    Janitors clean/prune (e.g., nodes with low heat_score). 
    Linkers create semantic connections (e.g., nodes with shared tags but no relations). 
    Builders create new structures/summaries (e.g., nodes with long content but no summary).
    
    Decide if we need to spawn a new sub-agent for a specific task.
    If yes, respond with JSON: { 
      "spawn": { 
        "type": "janitor" | "linker" | "builder", 
        "task": "description", 
        "assign_nodes": ["node_id_1", "node_id_2"],
        "priority": "low" | "medium" | "high",
        "parameters": { "reason": "string", "target_district": "string" },
        "queue": ["next_task_1", "next_task_2"]
      } 
    }
    Otherwise, respond with: { "idle": true }`;

    const response = await this.llm.generateText("Analyze city state and delegate.", systemPrompt);
    
    try {
      const decision = JSON.parse(response);
      if (decision.spawn) {
        await this.spawnAgent(
          decision.spawn.type, 
          decision.spawn.task, 
          decision.spawn.assign_nodes,
          decision.spawn.priority,
          decision.spawn.parameters,
          decision.spawn.queue
        );
      }
    } catch (e) {
      console.warn('[Orchestrator] Failed to parse decision:', response);
    }
  }

  private async spawnAgent(
    type: AgentRecord['agent_type'], 
    task: string, 
    assignedNodes?: string[],
    priority: 'low' | 'medium' | 'high' = 'medium',
    parameters?: Record<string, any>,
    queue?: string[]
  ) {
    const id = `pico-${type}-${Math.random().toString(36).substring(2, 7)}`;
    console.log(`[Orchestrator] Spawning ${id} for: ${task}`);
    
    // Get preset skills if any
    const presetSkills = this.settings.subagent_presets?.[type]?.skills || [];

    await db.agents.add({
      id,
      agent_id: id,
      agent_type: type,
      status: 'running',
      last_heartbeat: new Date().toISOString(),
      current_task: task,
      task_queue: queue || [],
      current_task_details: {
        id: `task-${Math.random().toString(36).substring(2, 7)}`,
        label: task,
        priority: priority,
        parameters: parameters,
        started_at: new Date().toISOString()
      },
      thinking_log: [`Initialized by Orchestrator for task: ${task}`],
      assigned_nodes: assignedNodes,
      equipped_skills: presetSkills
    });

    // Auto-cleanup sub-agents after 2 minutes
    setTimeout(async () => {
      console.log(`[Orchestrator] Decommissioning sub-agent ${id}`);
      await db.agents.delete(id);
    }, 120000);
  }
}
