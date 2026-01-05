# AI Sales Rep Simulator

An internal testing and experimentation tool for developing AI sales agent responses. Test multi-turn conversations, refine prompts, and validate knowledge retrieval before deploying to production.

## Features

- **Simulation Playground**: Test AI sales rep responses with configurable goals and context
- **Knowledge Base**: Upload content across 4 buckets:
  - **Website**: Upload website pages for RAG retrieval
  - **Documentation**: Upload product docs for RAG retrieval
  - **Transcripts**: Upload sales call transcripts → Generates Sales Playbook
  - **Tickets**: Upload support tickets → Generates FAQ Guide
- **PDF Playbooks**: Download extracted knowledge as formatted PDFs
- **Prompt Experimentation**: Easily modify agent behavior through config files

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
# Required: Anthropic API key for Claude (chat responses)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Required for RAG: OpenAI API key (embeddings)
OPENAI_API_KEY=your-openai-api-key
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Running a Simulation

1. **Configure the simulation**:
   - Enter the initial AI outreach message
   - Specify the page context (e.g., "/pricing")
   - Set an optional goal (e.g., "Get them to book a demo")

2. **Start the simulation** and interact as a prospect

3. **Test different scenarios** by modifying the goal or knowledge base

### Uploading Knowledge

1. **Website/Documentation**: Drag & drop `.txt`, `.html`, or `.md` files
   - Content is chunked, embedded, and stored in LanceDB
   - Retrieved automatically during chat based on relevance

2. **Transcripts/Tickets**: Drag & drop `.txt` files
   - AI analyzes all files and extracts patterns
   - Generates a downloadable PDF playbook

### Keyboard Shortcuts

- `Ctrl+K` / `Cmd+K`: Clear conversation
- `Enter`: Send message

## Project Structure

```
ai-sales-rep-simulator/
├── app/
│   ├── api/
│   │   ├── chat/           # Chat endpoint (Claude)
│   │   ├── ingest/         # RAG ingestion endpoint
│   │   ├── extract/        # Playbook extraction endpoint
│   │   └── download/       # PDF download endpoint
│   ├── page.tsx            # Main app
│   └── layout.tsx          # Root layout
├── components/             # React components
├── config/
│   ├── prompts.ts          # ⭐ Agent prompts (edit this!)
│   ├── extraction-prompts.ts
│   └── agent-config.ts     # Model settings
├── lib/
│   ├── llm.ts              # Prompt building
│   ├── vectorstore.ts      # LanceDB operations
│   ├── extractor.ts        # Playbook extraction
│   └── pdf-generator.ts    # PDF creation
├── data/
│   ├── lancedb/            # Vector database (gitignored)
│   └── playbooks/          # Generated JSONs (gitignored)
└── types/                  # TypeScript types
```

## Customizing Agent Behavior

### Edit Prompts

The main file for experimentation is `config/prompts.ts`:

- **SYSTEM_PROMPT**: Agent personality and behavior rules
- **GOAL_PROMPT**: How goals are interpreted
- **RESPONSE_STRATEGY**: How responses are structured
- **KNOWLEDGE_TEMPLATE**: How retrieved knowledge is presented

### Edit Model Settings

In `config/agent-config.ts`:

```typescript
export const agentConfig = {
  model: "claude-sonnet-4-20250514",
  maxTokens: 1024,
  temperature: 0.7,  // Higher = more creative
}
```

### Edit Extraction Prompts

In `config/extraction-prompts.ts`, modify what patterns are extracted from transcripts and tickets.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| State | Zustand |
| Vector DB | LanceDB |
| Embeddings | OpenAI (text-embedding-3-small) |
| LLM | Claude (Anthropic) |
| PDF | @react-pdf/renderer |

## API Keys

| Service | Purpose | Get Key At |
|---------|---------|------------|
| Anthropic | Chat responses | https://console.anthropic.com |
| OpenAI | Embeddings for RAG | https://platform.openai.com |

## Known Limitations

- File uploads are processed in-memory (large files may be slow)
- PDF generation happens on-demand (first download may be slow)
- LanceDB stores data locally in `./data/lancedb`

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## License

Internal tool - not for public distribution.
