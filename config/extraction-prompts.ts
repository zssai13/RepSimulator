// ============================================
// EXTRACTION PROMPTS
// ============================================
// These prompts are used to extract structured knowledge
// from raw content (transcripts, tickets).
// ============================================


// ============================================
// TRANSCRIPT EXTRACTION - Sales Playbook
// ============================================
// Analyzes sales call transcripts to extract patterns
// that help the agent sell more effectively.
// ============================================

export const TRANSCRIPT_EXTRACTION_PROMPT = `You are analyzing sales call transcripts to extract actionable patterns for an AI sales agent.

Analyze ALL provided transcripts carefully and create a comprehensive Sales Playbook with these sections:

## 1. Common Objections & Winning Responses
List the objections customers raised and the responses that successfully addressed them.
Format each as: 
- **Objection:** [what the customer said]
- **Winning Response:** [what worked to address it]

## 2. Successful Closing Patterns  
Phrases, techniques, and approaches that led to successful closes or moved deals forward.
Include specific language that worked.

## 3. Value Proposition Explanations
How reps effectively explained:
- Pricing and packages
- Product value and ROI
- Differentiation from competitors
- Why customers should act now

## 4. Rapport-Building Techniques
- Effective opening lines
- Relationship and trust builders
- Ways reps connected personally with prospects
- Techniques for handling early resistance

## 5. Phrases to Avoid
Language or approaches that caused negative reactions or lost deals.
Include what went wrong and why.

## 6. Key Product Questions & Best Answers
Recurring questions customers asked and the most effective answers given.
Focus on answers that moved the conversation forward.

IMPORTANT GUIDELINES:
- Be specific - include actual phrases where impactful
- Focus on patterns that appear across multiple transcripts
- Prioritize actionable insights over observations
- This playbook will be used by an AI agent, so make it practical
- If something only appeared once, note that it's a single instance

OUTPUT FORMAT:
Return a structured JSON object with these exact keys:
{
  "objections": [...],
  "closingPatterns": [...],
  "valuePropositions": [...],
  "rapportBuilding": [...],
  "phrasesToAvoid": [...],
  "keyQuestionsAnswers": [...]
}`;


// ============================================
// TICKET EXTRACTION - FAQ & Issue Guide
// ============================================
// Analyzes support tickets to extract patterns
// that help the agent handle issues and questions.
// ============================================

export const TICKET_EXTRACTION_PROMPT = `You are analyzing customer support tickets to extract patterns for an AI sales agent.

Analyze ALL provided tickets and create a comprehensive FAQ & Issue Resolution Guide:

## 1. Frequently Asked Questions
Common questions customers ask, organized by topic.
Include the clear, effective answers.

## 2. Common Issues & Resolutions
Recurring problems customers face and how they were successfully resolved.
Format:
- **Issue:** [description]
- **Resolution:** [what fixed it]
- **Prevention:** [how to avoid it, if applicable]

## 3. Product Friction Points
Areas where customers consistently struggle or get confused.
These indicate where the agent should be proactive with help.

## 4. Successful Response Templates
Support responses that resolved issues effectively and left customers happy.
Anonymize but preserve the approach.

## 5. Escalation Triggers
Situations that typically require:
- Human intervention
- Technical team involvement
- Management escalation
- Special handling

## 6. Feature Requests & Gaps
Commonly requested features or capabilities that customers expect but don't exist yet.
The agent should acknowledge these gracefully.

IMPORTANT GUIDELINES:
- Focus on patterns that appear multiple times
- Prioritize issues the agent will likely encounter
- Make resolutions actionable and specific
- Note severity levels where apparent
- This guide helps the agent handle objections and concerns

OUTPUT FORMAT:
Return a structured JSON object with these exact keys:
{
  "faqs": [...],
  "issuesResolutions": [...],
  "frictionPoints": [...],
  "responseTemplates": [...],
  "escalationTriggers": [...],
  "featureRequests": [...]
}`;


// ============================================
// BATCH PROCESSING PROMPT - For Large Volumes
// ============================================
// Used when processing more tickets than fit in one call.
// Extracts from a batch, then results are merged.
// ============================================

export const BATCH_EXTRACTION_PROMPT = `You are analyzing a BATCH of customer support tickets (this is part of a larger set).

Extract the same categories as the full analysis, but focus on what's present in THIS batch:
- FAQs
- Issues & Resolutions  
- Friction Points
- Good Response Patterns
- Escalation Needs
- Feature Requests

Be thorough but concise. Your output will be merged with other batches.

OUTPUT FORMAT:
Return a JSON object matching the standard structure with findings from this batch only.`;


// ============================================
// MERGE PROMPT - Combining Batch Results
// ============================================
// Used to combine multiple batch extraction results
// into a single cohesive playbook.
// ============================================

export const MERGE_RESULTS_PROMPT = `You have extracted insights from multiple batches of support tickets.

Now merge these batch results into a single, cohesive FAQ & Issue Guide:

BATCH RESULTS:
{{BATCH_RESULTS}}

MERGE GUIDELINES:
- Combine similar items (don't duplicate)
- Preserve unique insights from each batch
- Prioritize items that appeared in multiple batches
- Create a clean, unified structure
- Keep the most effective response templates

Return the final merged JSON object with the standard structure.`;

