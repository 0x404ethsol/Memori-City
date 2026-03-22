# Skill: Hermes_Memory_Import

## Overview
**Identifier**: `skill_hermes_import`  
**Agent Type**: `Hermes` (Orchestrator/Linker)  
**Category**: `Automation`  
**Status**: `Active`

## Description
Automatically scans specified local directories or cloud gateways for `.md` (Markdown) files. This skill acts as a bridge between external knowledge bases (like Obsidian, Logseq, or simple folder structures) and the Memori-City vault.

## Operational Protocol

### 1. Discovery Phase
- The agent identifies target directories configured in the user's settings.
- Scans for files with the `.md` extension.
- Extracts metadata (filename, creation date, tags) without reading full content to minimize memory pressure.

### 2. Human-in-the-Loop (HITL) Confirmation
- **CRITICAL**: No file is imported without explicit user consent.
- The agent generates an `Import_Manifest` containing:
    - List of discovered files.
    - Estimated "Heat Score" for each node.
    - Proposed "District" placement in the city.
- The user is presented with a confirmation dialog in the `NODE_INSPECTOR_HUD`.

### 3. Ingestion Phase
- Upon approval, the agent reads the file content.
- Converts Markdown into a `MemoriNode` object.
- Generates a summary and semantic embedding (if LLM is connected).
- Commits the node to the `db.vault`.

### 4. Linkage Phase
- The agent automatically searches for semantic relations between the new node and existing city structures.
- Creates `references` or `context_for` links to integrate the new memory into the graph.

## Code Implementation (Draft)

```javascript
export async function run(context) {
  const { directoryHandle, vault, ui } = context;
  
  // 1. Scan for files
  const files = await scanDirectory(directoryHandle, '.md');
  
  // 2. Request User Confirmation
  const confirmedFiles = await ui.requestConfirmation({
    title: "Hermes_Import_Protocol",
    message: `Found ${files.length} potential memory kernels. Proceed with ingestion?`,
    items: files.map(f => f.name)
  });
  
  if (!confirmedFiles || confirmedFiles.length === 0) {
    return { status: "ABORTED", reason: "USER_REJECTION" };
  }
  
  // 3. Process and Import
  let importedCount = 0;
  for (const file of confirmedFiles) {
    const content = await file.text();
    const node = await processMarkdown(content, file.name);
    await vault.add(node);
    importedCount++;
  }
  
  return { 
    status: "SUCCESS", 
    imported: importedCount,
    log: `Synchronized ${importedCount} kernels to the city vault.`
  };
}
```

## Security & Privacy
- **Local First**: All scanning happens within the browser's sandbox using the File System Access API.
- **No Shadow Sync**: The agent never uploads raw files to external servers; processing is strictly local to the Memori-City instance.
