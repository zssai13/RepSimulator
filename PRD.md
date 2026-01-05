# Product Requirements Document: AI Sales Rep Simulator

## Overview

**Product Name:** AI Sales Rep Simulator
**Version:** MVP
**Last Updated:** January 2026
**Status:** Internal Testing Tool

---

## Purpose

This is an internal testing/simulation tool for developing and refining an AI sales agent that responds to cold email replies. The simulator allows the team to test agent behavior, prompt configurations, and knowledge source integration before deploying to production.

---

## Product Context: Where This Fits

### The Larger System Flow

```
1. Lead visits a page on customer's website (e.g., /pricing/enterprise)
                    ↓
2. System triggers a cold email based on that URL/page
                    ↓
3. Lead receives cold email and replies
                    ↓
4. AI Agent responds to that reply  ← THIS APP SIMULATES THIS STEP
                    ↓
5. Multi-turn conversation continues until resolution
```

### Key Terminology

| Term | Definition |
|------|------------|
| **Customer** | The business using our product (uploads their website, docs, tickets, transcripts) |
| **Lead** | The person who visited the customer's site, received a cold email, and is now replying |
| **Initial Message** | The cold email that was sent to the lead (what triggered their reply) |
| **Page Context** | The URL/page the lead was on when they triggered the original email |
| **Agent Goal** | Optional desired outcome the agent should push toward (e.g., "Book a demo", "Visit pricing page") |

---

## Agent Objective

The AI agent has a **single, focused goal**:

> **Get the lead back to the customer's website and direct them to the most relevant product/page based on their responses and original page visit.**

### What the Agent Should Do
- Respond with sales intent
- Reference the lead's original page visit
- Suggest relevant products/pages
- Move the conversation toward a site visit or conversion action

### What the Agent Should NOT Do
- Answer support questions (redirect to appropriate resources instead)
- Engage in chit-chat or off-topic conversation
- Lose sight of the sales objective

---

## Knowledge Sources

The agent has access to 4 types of uploaded knowledge:

### 1. Website Content
- **What:** Customer's marketing website (HTML, text, markdown)
- **Purpose:** Agent knows what products/services exist, pricing, value propositions
- **Processing:** RAG (chunked, embedded, vector search)
- **Current Input:** MD files simulating fetched content (future: direct URL fetch)

### 2. Documentation / Help Site
- **What:** Product documentation, help articles, feature guides
- **Purpose:** Agent can accurately reference features and capabilities
- **Processing:** RAG (chunked, embedded, vector search)
- **Current Input:** MD/HTML/TXT files

### 3. Support Tickets
- **What:** Bulk upload of historical support tickets
- **Purpose:** Agent understands common pain points, FAQs, friction areas
- **Processing:** Extraction (Claude analyzes and creates structured "Support Guide")
- **Output:** JSON playbook + downloadable PDF

### 4. Sales Call Transcripts
- **What:** Bulk upload of sales call recordings (as text)
- **Purpose:** Agent learns winning objection handling, closing patterns, rapport techniques
- **Processing:** Extraction (Claude analyzes and creates structured "Sales Playbook")
- **Output:** JSON playbook + downloadable PDF

---

## Simulator Features

### Simulation Configuration

| Field | Description | Required |
|-------|-------------|----------|
| **Initial Message** | The cold email that was sent to the lead | Yes |
| **Page Context** | The URL/page that triggered the original email | Optional |
| **Agent Goal** | Desired outcome for the agent to push toward | Optional |

### Agent Goal Field

The **Agent Goal** field allows testers to give the agent a specific direction or desired outcome for the conversation.

**When filled in:**
- The agent receives explicit guidance on what outcome to pursue
- Examples:
  - "Get them to book a demo call"
  - "Direct them to the Enterprise pricing page"
  - "Have them sign up for a free trial"
  - "Schedule a call with sales team"
- The agent will actively steer the conversation toward this specific outcome

**When left blank:**
- No additional goal instruction is passed to the agent
- The agent relies on its base behavior and knowledge sources
- Useful for testing how the agent performs without explicit direction

This field is key for testing different scenarios - you can see how the agent behaves with specific goals vs. general sales intent.

### Conversation Interface
- Multi-turn chat interface
- User role-plays as the lead responding to emails
- Agent responds using all available knowledge sources
- Conversation continues until manually cleared

### Knowledge Management
- Upload interface for all 4 knowledge types
- Status indicators (empty, processing, ready, error)
- Clear functionality per bucket
- PDF download for extracted playbooks

### Developer Tools
- Prompt viewer showing full system prompt
- Agent config display (model, temperature, tokens)
- Export conversation as JSON

---

## Technical Requirements

### API Keys Required
- `ANTHROPIC_API_KEY` - For chat responses and extraction
- `OPENAI_API_KEY` - For embeddings (RAG)

### Models Used
- **Chat:** Claude Sonnet (claude-sonnet-4-20250514)
- **Embeddings:** OpenAI text-embedding-3-small

### Data Storage
- **Vector DB:** LanceDB (local, in `data/lancedb/`)
- **Playbooks:** JSON files (in `data/playbooks/`)

---

## Current Limitations (MVP)

1. **Manual file uploads only** - No URL fetching yet
2. **No authentication** - Internal tool only
3. **Local storage** - Data stored on local machine only
4. **No conversation persistence** - Chats cleared on page refresh
5. **Basic UI** - Functional but minimal styling
6. **No analytics** - Manual evaluation of responses

---

## Success Criteria

For this MVP, success is measured by:

1. **Chat functionality works** - Can have multi-turn conversations
2. **Knowledge integration works** - Agent uses uploaded data in responses
3. **Sales focus maintained** - Agent stays on objective, doesn't drift to support mode
4. **Usable for testing** - Team can run scenarios and evaluate agent behavior

---

## Future Considerations

These are potential enhancements, not current requirements:

- Direct URL fetching for website/docs
- Conversation history persistence
- Multiple agent configurations for A/B testing
- Response quality scoring/analytics
- Customer-facing version for self-service testing
- Integration with production email system

---

## Users

**Primary Users:** Internal team (product development and testing)
**Use Case:** Test and refine AI agent responses before production deployment
