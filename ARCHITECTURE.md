# Architecture Document: AI Sales Rep Simulator

> **Version:** 1.1
> **Last Updated:** January 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Directory Structure](#directory-structure)
4. [Data Flow](#data-flow)
5. [Core Modules](#core-modules)
6. [Knowledge Pipeline](#knowledge-pipeline)
7. [Configuration System](#configuration-system)
8. [API Reference](#api-reference)
9. [State Management](#state-management)
10. [Extension Points](#extension-points)

---

## Overview

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (Next.js)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ InputPanel  │  │ ChatWindow  │  │  Knowledge  │  │   Prompt    │ │
│  │  (config)   │  │   (chat)    │  │   Buckets   │  │   Viewer    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────────────┘ │
│         │                │                │                          │
│         └────────────────┼────────────────┘                          │
│                          │                                           │
│                    [Zustand Store]                                   │
└──────────────────────────┼───────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API ROUTES (Next.js)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  /api/chat  │  │ /api/ingest │  │ /api/extract│  │/api/download│ │
│  │             │  │    (RAG)    │  │ (playbooks) │  │    (PDF)    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
└─────────┼────────────────┼────────────────┼────────────────┼────────┘
          │                │                │                │
          ▼                ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          SERVICES LAYER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Provider   │  │ VectorStore │  │  Extractor  │  │     PDF     │ │
│  │ Abstraction │  │  (LanceDB)  │  │  (Claude)   │  │  Generator  │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                             │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────────┐    │
│  │ Anthropic API │  │   xAI API     │  │      OpenAI API       │    │
│  │   (Claude)    │  │   (Grok)      │  │     (Embeddings)      │    │
│  └───────────────┘  └───────────────┘  └───────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         LOCAL STORAGE                                │
│  ┌─────────────────────────┐  ┌─────────────────────────────────┐   │
│  │   data/lancedb/         │  │     data/playbooks/             │   │
│  │   (Vector Database)     │  │     (Extracted JSON)            │   │
│  └─────────────────────────┘  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Current Implementation

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 14 (App Router) | Full-stack React framework |
| **UI** | React 18 + Tailwind CSS | Component-based UI with utility styling |
| **State** | Zustand | Lightweight state management |
| **Vector DB** | LanceDB | Local vector storage and search |
| **Embeddings** | OpenAI (text-embedding-3-small) | Text to vector conversion |
| **LLM (Chat)** | Claude Sonnet 4 / Grok 4.1 Fast | Conversation responses (selectable) |
| **LLM (Extraction)** | Claude Sonnet | Playbook extraction |
| **PDF** | @react-pdf/renderer | Playbook PDF generation |

### Environment Variables

```bash
# Required (at least one chat provider)
ANTHROPIC_API_KEY=sk-ant-...    # Claude chat + extraction
XAI_API_KEY=xai-...             # Grok chat (alternative)
OPENAI_API_KEY=sk-...           # Embeddings for RAG (required)

# Model selection is done via UI dropdown, no env config needed
```

---

## Directory Structure

```
RepSimulator/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chat/
│   │   │   └── route.ts          # Main chat endpoint (uses provider abstraction)
│   │   ├── models/
│   │   │   └── route.ts          # Available models endpoint
│   │   ├── ingest/
│   │   │   └── route.ts          # RAG document ingestion
│   │   ├── extract/
│   │   │   └── route.ts          # Playbook extraction
│   │   └── download/
│   │       └── [bucket]/
│   │           └── route.ts      # PDF download (dynamic route)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main UI page
│   └── globals.css               # Global styles
│
├── components/                   # React Components
│   ├── BucketCard.tsx            # Individual knowledge bucket UI
│   ├── ChatWindow.tsx            # Conversation display
│   ├── InputPanel.tsx            # Simulation config form
│   ├── KnowledgeBuckets.tsx      # Knowledge management container
│   ├── MessageInput.tsx          # User message input
│   └── PromptViewer.tsx          # Developer prompt inspector
│
├── config/                       # Configuration Files
│   ├── agent-config.ts           # Model settings (model, tokens, temp)
│   ├── prompts.ts                # System prompt templates
│   └── extraction-prompts.ts     # Playbook extraction prompts
│
├── lib/                          # Core Libraries
│   ├── providers/                # LLM Provider Abstraction
│   │   ├── types.ts              # Provider interfaces, model definitions
│   │   ├── anthropic.ts          # Claude (Anthropic) provider
│   │   ├── xai.ts                # Grok (xAI) provider
│   │   └── index.ts              # Provider factory/registry
│   ├── extractor.ts              # Playbook extraction logic
│   ├── llm.ts                    # LLM integration utilities
│   ├── pdf-generator.ts          # PDF rendering
│   ├── store.ts                  # Zustand state store (includes model selection)
│   ├── text-chunker.ts           # Document chunking for RAG
│   └── vectorstore.ts            # LanceDB operations
│
├── types/                        # TypeScript Definitions
│   └── index.ts                  # Shared type definitions
│
├── data/                         # Local Data Storage (gitignored)
│   ├── lancedb/                  # Vector database files
│   └── playbooks/                # Extracted playbook JSONs
│
├── CLAUDE.md                     # Quick reference for Claude
├── PRD.md                        # Product requirements
├── ARCHITECTURE.md               # This file
└── package.json                  # Dependencies
```

---

## Data Flow

### Chat Flow

```
User types message
       │
       ▼
┌──────────────────┐
│  POST /api/chat  │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                    CONTEXT GATHERING                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │  RAG Query  │  │   Load      │  │   Load      │           │
│  │  (LanceDB)  │  │  Sales      │  │  Support    │           │
│  │             │  │  Playbook   │  │  Guide      │           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘           │
│         │                │                │                   │
│         └────────────────┼────────────────┘                   │
│                          │                                    │
│                          ▼                                    │
│              ┌───────────────────────┐                        │
│              │   Assemble System     │                        │
│              │       Prompt          │                        │
│              └───────────┬───────────┘                        │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
              ┌───────────────────────┐
              │   Claude API Call     │
              │   (with full context) │
              └───────────┬───────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Return Response     │
              │   + Knowledge Sources │
              └───────────────────────┘
```

### Knowledge Ingestion Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    RAG PATH (Website/Docs)                       │
│                                                                  │
│   Upload Files → Chunk Text → Generate Embeddings → Store in DB │
│        │              │               │                    │     │
│        ▼              ▼               ▼                    ▼     │
│   [Files[]]     [text-chunker]   [OpenAI API]        [LanceDB]  │
│                                                                  │
│   Endpoint: POST /api/ingest                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              EXTRACTION PATH (Transcripts/Tickets)               │
│                                                                  │
│   Upload Files → Combine Content → Claude Extraction → Save JSON│
│        │              │                   │                │     │
│        ▼              ▼                   ▼                ▼     │
│   [Files[]]     [concatenate]      [Claude API]    [playbooks/] │
│                                                                  │
│   Endpoint: POST /api/extract                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### lib/providers/ - LLM Provider Abstraction

**Purpose:** Unified interface for multiple LLM providers (Claude, Grok, etc.)

```typescript
// lib/providers/types.ts
interface LLMProvider {
  name: string;
  chat(request: ChatRequest): Promise<ChatResponse>;
  isConfigured(): boolean;
}

type ProviderType = 'anthropic' | 'xai';

interface ModelOption {
  id: string;
  name: string;
  provider: ProviderType;
  description?: string;
}

// Available models
AVAILABLE_MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic' },
  { id: 'grok-4-1-fast', name: 'Grok 4.1 Fast', provider: 'xai' }
]
```

**Provider Implementations:**
| File | Provider | API |
|------|----------|-----|
| `anthropic.ts` | Anthropic | Claude API (native SDK) |
| `xai.ts` | xAI | OpenAI-compatible (x.ai base URL) |

**Usage in API Route:**
```typescript
// app/api/chat/route.ts
import { getProvider, getModelById } from '@/lib/providers';

const model = getModelById(modelId);
const provider = getProvider(model.provider);
const response = await provider.chat({ messages, systemPrompt });
```

---

### lib/llm.ts - LLM Integration

**Purpose:** Handles prompt building and formatting utilities.

```typescript
// Current exports
buildSystemPrompt(config, knowledge)  // Assembles full system prompt
formatMessagesForClaude(messages)     // Converts Message[] to Claude format
getAgentConfig()                      // Returns model settings
debugGetFullPrompt()                  // For PromptViewer display
```

---

### lib/vectorstore.ts - Vector Database

**Purpose:** Manages LanceDB operations for RAG.

```typescript
// Current exports
getConnection()                       // Cached DB connection
generateEmbedding(text)               // Single embedding
generateEmbeddings(texts)             // Batch embeddings (100/batch)
ingestDocuments(table, chunks)        // Store documents
queryTable(table, query, topK)        // Search single table
queryAllTables(query, topK)           // Search all tables
clearTable(table)                     // Drop table
hasContent(table)                     // Check if table exists
getDocumentCount(table)               // Row count
```

**Tables:**
| Table | Content | Source |
|-------|---------|--------|
| `website` | Customer website content | /api/ingest |
| `documentation` | Help docs/articles | /api/ingest |

**Extension Points:**
- Add new tables for additional sources
- Support different embedding providers
- Add metadata filtering

---

### lib/extractor.ts - Playbook Extraction

**Purpose:** Extracts structured knowledge from raw content.

```typescript
// Current exports
extractSalesPlaybook(transcripts)     // Transcripts → Sales Playbook
extractSupportGuide(tickets)          // Tickets → Support Guide
loadSalesPlaybook()                   // Read playbook JSON
loadSupportGuide()                    // Read guide JSON
checkPlaybooksExist()                 // Check which playbooks exist
```

**Output Files:**
| File | Source | Content |
|------|--------|---------|
| `data/playbooks/transcripts-playbook.json` | Sales transcripts | Objections, closing patterns, rapport |
| `data/playbooks/tickets-playbook.json` | Support tickets | FAQs, issues, friction points |

**Extension Points:**
- Add new extraction types (e.g., competitor analysis, case studies)
- Support incremental extraction (append vs replace)
- Custom extraction prompts per customer

---

### lib/text-chunker.ts - Document Chunking

**Purpose:** Splits documents into overlapping chunks for RAG.

```typescript
// Current exports
chunkText(text, source, options)      // Single document
chunkDocuments(documents)             // Multiple documents
```

**Default Settings:**
```typescript
{
  chunkSize: 1500,      // ~375 tokens
  chunkOverlap: 200,    // ~50 tokens overlap
  minChunkSize: 100     // Minimum chunk length
}
```

**Extension Points:**
- Semantic chunking (by headers, sections)
- Content-type specific chunking strategies
- Configurable chunk sizes per source type

---

### lib/store.ts - State Management

**Purpose:** Zustand stores for UI state.

```typescript
// Knowledge store
interface KnowledgeState {
  buckets: Record<BucketType, BucketState>
  uploadFiles(bucketType, files)
  setStatus(bucketType, status, errorMessage?)
  setPlaybookUrl(bucketType, url)
  clearBucket(bucketType)
  clearAllBuckets()
}

// Model selection store
interface ModelState {
  selectedModelId: string
  models: ModelOption[]
  isLoading: boolean
  setSelectedModel(modelId: string)
  fetchModels()
}

// Bucket types
type BucketType = 'website' | 'documentation' | 'transcripts' | 'tickets'
```

**Extension Points:**
- Add conversation history persistence
- User preferences

---

## Knowledge Pipeline

### Current Knowledge Sources

| Source | Type | Processing | Storage | Retrieval |
|--------|------|------------|---------|-----------|
| Website | RAG | Chunk → Embed | LanceDB `website` table | Vector similarity |
| Documentation | RAG | Chunk → Embed | LanceDB `documentation` table | Vector similarity |
| Transcripts | Extraction | Claude analysis | JSON file | Full load |
| Tickets | Extraction | Claude analysis | JSON file | Full load |

### How Knowledge Flows to Chat

```typescript
// In /api/chat/route.ts (simplified)

// 1. RAG retrieval
const ragResults = await queryAllTables(userMessage, 5);

// 2. Load extracted playbooks
const salesPlaybook = await loadSalesPlaybook();
const supportGuide = await loadSupportGuide();

// 3. Format for context
const knowledgeContext = formatKnowledge({
  ragResults,
  salesPlaybook,
  supportGuide
});

// 4. Build system prompt
const systemPrompt = assembleFullPrompt({
  initialMessage,
  pageContext,
  goal,
  knowledgeContext
});

// 5. Call Claude
const response = await claude.messages.create({
  model: agentConfig.model,
  system: systemPrompt,
  messages: formattedMessages
});
```

---

## Configuration System

### config/agent-config.ts

**Current Settings:**
```typescript
export const agentConfig = {
  model: "claude-sonnet-4-20250514",
  maxTokens: 1024,
  temperature: 0.7
}
```

**Future Structure (planned):**
```typescript
export const agentConfig = {
  // Model selection
  provider: "anthropic",           // anthropic | openai | custom
  model: "claude-sonnet-4-20250514",

  // Generation settings
  maxTokens: 1024,
  temperature: 0.7,

  // RAG settings
  embeddingProvider: "openai",
  embeddingModel: "text-embedding-3-small",
  ragTopK: 5,

  // Feature flags
  features: {
    useRAG: true,
    useSalesPlaybook: true,
    useSupportGuide: true
  }
}
```

---

### config/prompts.ts

**Prompt Assembly Order:**
```
1. SYSTEM_PROMPT          - Base agent personality
2. CONTEXT_TEMPLATE       - Page context + initial message
3. KNOWLEDGE_TEMPLATE     - Retrieved knowledge
4. GOAL_PROMPT           - Agent goal (if provided)
5. RESPONSE_STRATEGY     - Response guidelines
```

**Template Placeholders:**
| Placeholder | Replaced With |
|-------------|---------------|
| `{{INITIAL_MESSAGE}}` | The cold email that was sent |
| `{{PAGE_CONTEXT}}` | URL/page that triggered email |
| `{{GOAL}}` | Desired outcome |
| `{{KNOWLEDGE_CONTEXT}}` | RAG results + playbook excerpts |

---

## API Reference

### POST /api/chat

**Request:**
```typescript
{
  messages: Message[],
  initialMessage: string,
  pageContext: string,
  goal: string,
  modelId: string    // e.g., "claude-sonnet-4-20250514" or "grok-4-1-fast"
}
```

**Response:**
```typescript
{
  message: string,
  knowledgeSources: {
    rag: boolean,
    salesPlaybook: boolean,
    supportGuide: boolean
  }
}
```

---

### GET /api/models

**Response:**
```typescript
{
  models: Array<{
    id: string,
    name: string,
    provider: 'anthropic' | 'xai',
    description?: string
  }>,
  defaultModelId: string
}
```

---

### POST /api/ingest

**Request:**
```typescript
{
  bucket: "website" | "documentation",
  documents: Array<{
    filename: string,
    content: string
  }>
}
```

**Response:**
```typescript
{
  success: boolean,
  documentCount: number,
  chunkCount: number
}
```

---

### POST /api/extract

**Request:**
```typescript
{
  bucket: "transcripts" | "tickets",
  documents: Array<{
    filename: string,
    content: string
  }>
}
```

**Response:**
```typescript
{
  success: boolean,
  playbookUrl: string    // e.g., "/api/download/transcripts"
}
```

---

### GET /api/download/[bucket]

**Parameters:**
- `bucket`: "transcripts" | "tickets"

**Response:**
- Content-Type: application/pdf
- Content-Disposition: attachment

---

## State Management

### Frontend State (Zustand)

```typescript
// Knowledge bucket state
buckets: {
  website: {
    files: File[],
    status: 'empty' | 'processing' | 'ready' | 'error',
    fileCount: number,
    errorMessage?: string,
    lastUpdated?: Date
  },
  documentation: { ... },
  transcripts: {
    ...,
    playbookUrl?: string   // Download link when ready
  },
  tickets: { ... }
}
```

### Conversation State (React useState)

```typescript
// In app/page.tsx
const [messages, setMessages] = useState<Message[]>([])
const [isLoading, setIsLoading] = useState(false)
const [isSimulationActive, setIsSimulationActive] = useState(false)
const [config, setConfig] = useState<SimulationConfig | null>(null)
```

---

## Extension Points

This section documents where and how to add new features.

### Adding New Model Providers

**Status:** ✅ Implemented

The provider abstraction is in `lib/providers/`. To add a new provider:

**Files to modify:**
1. `lib/providers/types.ts` - Add provider type and model(s) to `AVAILABLE_MODELS`
2. Create `lib/providers/[provider].ts` - Implement `LLMProvider` interface
3. `lib/providers/index.ts` - Register provider in `providers` map
4. `.env.example` - Add API key placeholder

**Example: Adding a new provider**
```typescript
// lib/providers/newprovider.ts
import { LLMProvider, ChatRequest, ChatResponse } from './types';

export class NewProvider implements LLMProvider {
  name = 'newprovider';

  async chat(request: ChatRequest): Promise<ChatResponse> {
    // Call provider API
    return { content: response };
  }

  isConfigured(): boolean {
    return !!process.env.NEW_PROVIDER_API_KEY;
  }
}

// lib/providers/index.ts - add to registry
import { NewProvider } from './newprovider';
const providers = {
  anthropic: new AnthropicProvider(),
  xai: new XAIProvider(),
  newprovider: new NewProvider(),  // Add here
};

// lib/providers/types.ts - add model
export const AVAILABLE_MODELS: ModelOption[] = [
  // ... existing models
  { id: 'new-model-id', name: 'New Model', provider: 'newprovider' },
];
```

---

### Adding New Knowledge Sources

**For RAG sources:**
1. Add bucket type to `types/index.ts`
2. Add bucket config to `lib/store.ts`
3. Create table in `lib/vectorstore.ts`
4. Update `/api/ingest` to handle new type
5. Update `/api/chat` to query new table

**For extraction sources:**
1. Add extraction prompt to `config/extraction-prompts.ts`
2. Add extraction function to `lib/extractor.ts`
3. Add PDF template to `lib/pdf-generator.ts`
4. Update `/api/extract` to handle new type
5. Update `/api/download` for new PDF type

---

### Adding Model Selection UI

**Status:** ✅ Implemented

Model selection is now in the Settings panel (`components/InputPanel.tsx`).

**Implementation details:**
- `lib/store.ts` - `useModelStore` for model selection state
- `components/InputPanel.tsx` - Dropdown in Settings section
- `app/api/models/route.ts` - Returns available models
- `app/api/chat/route.ts` - Accepts `modelId` parameter

**Current state shape:**
```typescript
// lib/store.ts
interface ModelState {
  selectedModelId: string;
  models: ModelOption[];
  isLoading: boolean;
  setSelectedModel(modelId: string): void;
  fetchModels(): Promise<void>;
}
```

---

### Adding Conversation Persistence

**Options:**
1. **LocalStorage** - Simple, client-side only
2. **IndexedDB** - Better for larger data
3. **Server-side** - Requires database addition

**Files to modify:**
1. `lib/store.ts` - Add conversation state
2. `app/page.tsx` - Load/save on mount/unmount
3. New: `lib/conversation-store.ts` - Persistence logic

---

### Future Knowledge Source Ideas

| Source | Type | Purpose |
|--------|------|---------|
| Competitor Info | RAG | Know competitive landscape |
| Case Studies | RAG | Reference success stories |
| Pricing Tables | Structured | Accurate pricing responses |
| Calendar/Availability | API | Schedule meetings |
| CRM Data | API | Lead history/context |

---

## Performance Considerations

### Current Bottlenecks

1. **Embedding generation** - Batched at 100/request to OpenAI
2. **Playbook extraction** - Large ticket batches processed in 100-ticket chunks
3. **PDF generation** - On-demand, may be slow for first request

### Optimization Opportunities

1. **Caching** - Cache frequent RAG queries
2. **Streaming** - Stream chat responses (not implemented)
3. **Background processing** - Queue large extraction jobs
4. **Incremental ingestion** - Append vs replace for RAG

---

## Security Notes

1. **API keys** - Stored in environment variables only
2. **No auth** - Internal tool, assumes trusted users
3. **Local storage** - All data stored locally, no cloud sync
4. **File uploads** - No validation beyond MIME type (improve for production)

---

## Appendix: Type Definitions

```typescript
// types/index.ts

interface Message {
  id: string
  role: 'user' | 'assistant' | 'initial'
  content: string
  timestamp: Date
}

type BucketType = 'website' | 'documentation' | 'transcripts' | 'tickets'
type BucketStatus = 'empty' | 'processing' | 'ready' | 'error'

interface SimulationConfig {
  initialMessage: string
  pageContext: string
  goal: string
}

interface BucketState {
  files: File[]
  status: BucketStatus
  fileCount: number
  playbookUrl?: string
  errorMessage?: string
  lastUpdated?: Date
}

interface ChatResponse {
  message: string
  error?: string
  knowledgeSources?: {
    rag: boolean
    salesPlaybook: boolean
    supportGuide: boolean
  }
}
```
