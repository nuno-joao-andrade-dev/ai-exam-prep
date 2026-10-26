# Step 2: Area Content RAG Engine (`step-02-rag`)

Loads any folder from `data/[area]/[content files]`, splits the Markdown into sections, and exposes the `search_area_content` ADK `FunctionTool`.

## Run Step 2

```bash
cd step-02-rag
node index.js javascript
# Or pass another area folder:
node index.js ai-agents
node index.js cloud
```
