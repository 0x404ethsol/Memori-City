# 🏙️ Memori-City

**Memori-City** is a local-first agentic memory kernel designed for AI agents and knowledge workers. It provides a persistent, semantic, and visual memory layer that allows agents to recall, consolidate, and relate information across sessions.

Inspired by the need for agents to have a "long-term memory" that isn't just a flat list of text, Memori-City visualizes your knowledge as a growing 3D metropolis.

---

## 🚀 Key Features

### 🧠 Agentic Memory Kernel
- **Semantic Recall**: Uses vector embeddings (Gemini, OpenAI, or Ollama) to retrieve relevant memories based on task context.
- **Memory Consolidation**: Automatically summarizes long-form content into token-efficient "Knowledge Kernels".
- **Semantic Linking**: Identifies relations between nodes (references, contradicts, supports, etc.) to build a semantic knowledge graph.
- **Forgetting Mechanism**: Implements pruning heuristics based on importance and access frequency to keep the memory space clean.

### 🏙️ 3D City Visualization
- **Spatial Memory**: Memories are mapped to a 3D city grid.
- **Districts & Buildings**: Categorize your knowledge into districts. Each building represents a cluster of related memories, with floors representing individual nodes.
- **Interactive Exploration**: Fly through your memory city to visually discover connections and clusters of information.

### 🔌 Integrations & Local-First
- **Obsidian Support**: Import your existing markdown vault to give your agents immediate access to your personal knowledge base.
- **Local-First Architecture**: All data is stored locally in your browser using Dexie.js (IndexedDB). Your data never leaves your machine unless you explicitly sync it.
- **Multi-LLM Support**: Compatible with Gemini, OpenAI, Anthropic, and Ollama.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4
- **3D Rendering**: Three.js, React Three Fiber, React Three Drei
- **Database**: Dexie.js (IndexedDB)
- **Animations**: Motion (framer-motion)
- **AI SDK**: @google/genai

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/memori-city.git
   cd memori-city
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file based on `.env.example` and add your API keys.
   ```env
   GEMINI_API_KEY=your_gemini_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Whether it's fixing bugs, adding new districts to the city, or improving the agentic kernels, feel free to open a PR.

*Built for the future of agentic workflows in 2026.*
