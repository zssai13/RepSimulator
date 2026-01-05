# Claude Context: AI Sales Rep Simulator

> **Quick Reference:** Read `PRD.md` for full product requirements and `ARCHITECTURE.md` for technical details.

---

## What This Is

An internal testing tool to simulate an AI sales agent that responds to cold email replies. We use this to test agent behavior before production deployment.

---

## The Flow We're Simulating

```
Lead visits customer's website page
       ↓
System sends cold email based on that page
       ↓
Lead replies to the email
       ↓
AI Agent responds  ← THIS IS WHAT WE'RE TESTING
       ↓
Multi-turn conversation until resolution
```

---

## Agent's Single Goal

**Get the lead back to the website and to the most relevant product based on their responses and original page visit.**

- Sales intent only
- No support mode
- No chit-chat
- Always driving toward site visit/conversion

---

## Simulation Inputs

| Field | Purpose |
|-------|---------|
| **Initial Message** | The cold email sent to the lead (required) |
| **Page Context** | URL/page that triggered the email (optional) |
| **Agent Goal** | Desired outcome to push toward (optional) |

**Agent Goal:** When filled, tells the agent what outcome to pursue (e.g., "Book a demo"). When blank, no explicit direction is given.

---

## Knowledge Sources (4 Types)

| Source | Purpose | Processing |
|--------|---------|------------|
| Website | Products/services/pricing | RAG (vector search) |
| Documentation | Features/capabilities | RAG (vector search) |
| Support Tickets | Pain points/FAQs | Extraction → Playbook |
| Sales Transcripts | Objection handling/closing | Extraction → Playbook |

---

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Main UI - simulation interface |
| `app/api/chat/route.ts` | Chat endpoint - builds prompt, calls Claude |
| `config/prompts.ts` | System prompt templates |
| `config/agent-config.ts` | Model settings (Claude Sonnet) |
| `lib/store.ts` | Zustand state management |
| `lib/vectorstore.ts` | LanceDB operations |
| `lib/extractor.ts` | Playbook extraction logic |

---

## Running Locally

```bash
npm install --legacy-peer-deps
npm run dev
# → http://localhost:3000
```

**Required env vars:**
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`

---

## Current Status

MVP - functional but minimal. Many features may be incomplete or missing.
