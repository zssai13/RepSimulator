# Changelog

All notable changes to the AI Sales Rep Simulator.

## [1.1.0] - January 2026

### Added
- **Model Selection UI** - Dropdown in Settings panel to switch between LLM providers
- **Grok 4.1 Fast Support** - xAI's Grok model as alternative to Claude
- **Provider Abstraction Layer** - Unified interface for multiple LLM providers (`lib/providers/`)
- **Models API Endpoint** - `GET /api/models` returns available models
- **Model State Management** - Zustand store for model selection persistence

### Changed
- **Chat API** - Now accepts `modelId` parameter to specify which model to use
- **Architecture** - Services layer updated with provider abstraction pattern
- **Environment Variables** - Added `XAI_API_KEY` for Grok support

### Technical Details
- Provider implementations in `lib/providers/`:
  - `anthropic.ts` - Claude via native Anthropic SDK
  - `xai.ts` - Grok via OpenAI-compatible SDK (x.ai base URL)
  - `types.ts` - Shared interfaces and model definitions
  - `index.ts` - Provider factory and registry

---

## [1.0.0] - January 2026

### Added
- **Initial MVP Release**
- Multi-turn chat interface for simulating lead conversations
- Four knowledge source types:
  - Website content (RAG with LanceDB)
  - Documentation (RAG with LanceDB)
  - Sales transcripts (extraction to playbook)
  - Support tickets (extraction to guide)
- Simulation configuration (initial message, page context, agent goal)
- Playbook extraction with Claude
- PDF generation for extracted playbooks
- Prompt viewer for debugging
- Knowledge bucket management UI

### Technical Stack
- Next.js 14 (App Router)
- React 18 + Tailwind CSS
- Zustand for state management
- LanceDB for vector storage
- OpenAI embeddings (text-embedding-3-small)
- Claude Sonnet for chat and extraction
- @react-pdf/renderer for PDF generation

---

## [0.1.0] - Initial Development

### Added
- Project scaffolding and initial codebase
- Basic chat functionality
- File upload infrastructure
