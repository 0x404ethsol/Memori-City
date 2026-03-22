# Memori-City Architecture Blueprint

## Core Philosophy
Memori-City is an autonomous digital ecosystem where information is treated as living nodes in a decentralized graph. The system is managed by a hierarchy of AI agents.

## The Orchestrator (Main Agent)
- **Role**: The central intelligence core.
- **Responsibilities**:
    - Monitors the global state of the city (nodes, agents, files).
    - Decides when to spawn specialized sub-agents.
    - Manages memory clusters and semantic link density.
    - Handles high-level user requests.

## Sub-Agents (The Swarm)
Sub-agents are ephemeral, specialized entities spawned by the Orchestrator to handle specific tasks.

### 1. JANITOR (Cleanup & Optimization)
- **Task**: Prunes redundant nodes, optimizes database indexes, and ensures system stability.
- **Trigger**: High node count or low performance metrics.

### 2. LINKER (Semantic Mapping)
- **Task**: Analyzes node content and creates semantic links between disparate pieces of information.
- **Trigger**: New data imports or low link density.

### 3. BUILDER (Structure & Generation)
- **Task**: Generates new nodes or districts based on user goals or autonomous expansion plans.
- **Trigger**: User requests for new features or autonomous growth phases.

## Data Layer
- **Persistence**: IndexedDB (via Dexie.js) for local, high-performance graph storage.
- **Sync**: WebSocket streams for real-time updates across the swarm.
- **Memory**: Semantic embeddings used for retrieval and relationship mapping.

## Handoff Protocol
When the Orchestrator delegates a task:
1. It creates a task record in the database.
2. It spawns a sub-agent with a specific `preset` of skills.
3. The sub-agent executes the task and updates the task status.
4. The Orchestrator monitors progress and decommissions the sub-agent upon completion.
