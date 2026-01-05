// ============================================
// PLAYBOOK EXTRACTOR
// ============================================
// Extracts structured knowledge from:
// - Sales call transcripts → Sales Playbook
// - Support tickets → FAQ & Issue Guide
// ============================================

import Anthropic from '@anthropic-ai/sdk';
import { TRANSCRIPT_EXTRACTION_PROMPT, TICKET_EXTRACTION_PROMPT } from '@/config/extraction-prompts';
import fs from 'fs/promises';
import path from 'path';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Playbook storage path
const PLAYBOOKS_PATH = path.join(process.cwd(), 'data', 'playbooks');

// ============================================
// SALES PLAYBOOK TYPES
// ============================================

export interface SalesPlaybook {
  generatedAt: string;
  sourceFiles: string[];
  transcriptCount: number;
  objections: Array<{
    objection: string;
    winningResponse: string;
  }>;
  closingPatterns: string[];
  valuePropositions: string[];
  rapportBuilding: string[];
  phrasesToAvoid: string[];
  keyQuestionsAnswers: Array<{
    question: string;
    answer: string;
  }>;
}

// ============================================
// SUPPORT GUIDE TYPES
// ============================================

export interface SupportGuide {
  generatedAt: string;
  sourceFiles: string[];
  ticketCount: number;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  issuesResolutions: Array<{
    issue: string;
    resolution: string;
    prevention?: string;
  }>;
  frictionPoints: string[];
  responseTemplates: string[];
  escalationTriggers: string[];
  featureRequests: string[];
}

// ============================================
// TRANSCRIPT EXTRACTION
// ============================================

/**
 * Extracts a Sales Playbook from sales call transcripts
 */
export async function extractSalesPlaybook(
  transcripts: Array<{ filename: string; content: string }>
): Promise<{ success: boolean; playbook?: SalesPlaybook; error?: string }> {
  try {
    if (transcripts.length === 0) {
      return { success: false, error: 'No transcripts provided' };
    }

    // Combine all transcripts with clear separators
    const combinedContent = transcripts
      .map((t, i) => `
========================================
TRANSCRIPT ${i + 1}: ${t.filename}
========================================

${t.content}
`)
      .join('\n\n');

    console.log(`Extracting playbook from ${transcripts.length} transcripts...`);

    // Call Claude for extraction
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${TRANSCRIPT_EXTRACTION_PROMPT}

Here are the transcripts to analyze:

${combinedContent}

Please analyze these transcripts and return the Sales Playbook as a JSON object.`,
        },
      ],
    });

    // Extract the text response
    const textContent = response.content.find((block) => block.type === 'text');
    const responseText = textContent?.type === 'text' ? textContent.text : '';

    // Parse the JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse playbook JSON from response');
    }

    const extractedData = JSON.parse(jsonMatch[0]);

    // Build the playbook structure
    const playbook: SalesPlaybook = {
      generatedAt: new Date().toISOString(),
      sourceFiles: transcripts.map((t) => t.filename),
      transcriptCount: transcripts.length,
      objections: extractedData.objections || [],
      closingPatterns: extractedData.closingPatterns || [],
      valuePropositions: extractedData.valuePropositions || [],
      rapportBuilding: extractedData.rapportBuilding || [],
      phrasesToAvoid: extractedData.phrasesToAvoid || [],
      keyQuestionsAnswers: extractedData.keyQuestionsAnswers || [],
    };

    // Save to file
    await ensurePlaybooksDir();
    const playbookPath = path.join(PLAYBOOKS_PATH, 'transcripts-playbook.json');
    await fs.writeFile(playbookPath, JSON.stringify(playbook, null, 2));

    console.log(`Sales Playbook saved to ${playbookPath}`);
    return { success: true, playbook };

  } catch (error) {
    console.error('Playbook extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Extraction failed',
    };
  }
}

// ============================================
// TICKET EXTRACTION
// ============================================

/**
 * Extracts a Support Guide from customer support tickets
 * Handles large volumes by batching if needed
 */
export async function extractSupportGuide(
  tickets: Array<{ filename: string; content: string }>
): Promise<{ success: boolean; guide?: SupportGuide; error?: string }> {
  try {
    if (tickets.length === 0) {
      return { success: false, error: 'No tickets provided' };
    }

    // For large volumes, we may need to batch
    // Each batch should stay under context limits (~100 tickets per batch)
    const BATCH_SIZE = 100;
    const batches: Array<Array<{ filename: string; content: string }>> = [];

    for (let i = 0; i < tickets.length; i += BATCH_SIZE) {
      batches.push(tickets.slice(i, i + BATCH_SIZE));
    }

    console.log(`Processing ${tickets.length} tickets in ${batches.length} batch(es)...`);

    if (batches.length === 1) {
      // Single batch - process directly
      return await processSingleBatch(batches[0], tickets.length);
    } else {
      // Multiple batches - process and merge
      return await processMultipleBatches(batches, tickets);
    }

  } catch (error) {
    console.error('Support guide extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Extraction failed',
    };
  }
}

/**
 * Process a single batch of tickets
 */
async function processSingleBatch(
  tickets: Array<{ filename: string; content: string }>,
  totalCount: number
): Promise<{ success: boolean; guide?: SupportGuide; error?: string }> {
  // Combine all tickets with clear separators
  const combinedContent = tickets
    .map((t, i) => `
--- TICKET ${i + 1}: ${t.filename} ---
${t.content}
`)
    .join('\n');

  // Call Claude for extraction
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `${TICKET_EXTRACTION_PROMPT}

Here are the support tickets to analyze:

${combinedContent}

Please analyze these tickets and return the FAQ & Issue Guide as a JSON object.`,
      },
    ],
  });

  // Extract the text response
  const textContent = response.content.find((block) => block.type === 'text');
  const responseText = textContent?.type === 'text' ? textContent.text : '';

  // Parse the JSON from the response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse guide JSON from response');
  }

  const extractedData = JSON.parse(jsonMatch[0]);

  // Build the guide structure
  const guide: SupportGuide = {
    generatedAt: new Date().toISOString(),
    sourceFiles: tickets.map((t) => t.filename),
    ticketCount: totalCount,
    faqs: extractedData.faqs || [],
    issuesResolutions: extractedData.issuesResolutions || [],
    frictionPoints: extractedData.frictionPoints || [],
    responseTemplates: extractedData.responseTemplates || [],
    escalationTriggers: extractedData.escalationTriggers || [],
    featureRequests: extractedData.featureRequests || [],
  };

  // Save to file
  await ensurePlaybooksDir();
  const guidePath = path.join(PLAYBOOKS_PATH, 'tickets-playbook.json');
  await fs.writeFile(guidePath, JSON.stringify(guide, null, 2));

  console.log(`Support Guide saved to ${guidePath}`);
  return { success: true, guide };
}

/**
 * Process multiple batches and merge results
 */
async function processMultipleBatches(
  batches: Array<Array<{ filename: string; content: string }>>,
  allTickets: Array<{ filename: string; content: string }>
): Promise<{ success: boolean; guide?: SupportGuide; error?: string }> {
  // Process each batch
  const batchResults: SupportGuide[] = [];

  for (let i = 0; i < batches.length; i++) {
    console.log(`Processing batch ${i + 1} of ${batches.length}...`);
    const result = await processSingleBatch(batches[i], batches[i].length);
    if (result.success && result.guide) {
      batchResults.push(result.guide);
    }
  }

  // Merge all batch results
  const mergedGuide: SupportGuide = {
    generatedAt: new Date().toISOString(),
    sourceFiles: allTickets.map((t) => t.filename),
    ticketCount: allTickets.length,
    faqs: batchResults.flatMap((r) => r.faqs),
    issuesResolutions: batchResults.flatMap((r) => r.issuesResolutions),
    frictionPoints: [...new Set(batchResults.flatMap((r) => r.frictionPoints))],
    responseTemplates: batchResults.flatMap((r) => r.responseTemplates),
    escalationTriggers: [...new Set(batchResults.flatMap((r) => r.escalationTriggers))],
    featureRequests: [...new Set(batchResults.flatMap((r) => r.featureRequests))],
  };

  // Save merged guide
  await ensurePlaybooksDir();
  const guidePath = path.join(PLAYBOOKS_PATH, 'tickets-playbook.json');
  await fs.writeFile(guidePath, JSON.stringify(mergedGuide, null, 2));

  console.log(`Merged Support Guide saved to ${guidePath}`);
  return { success: true, guide: mergedGuide };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Ensure the playbooks directory exists
 */
async function ensurePlaybooksDir(): Promise<void> {
  try {
    await fs.access(PLAYBOOKS_PATH);
  } catch {
    await fs.mkdir(PLAYBOOKS_PATH, { recursive: true });
  }
}

/**
 * Load a saved playbook
 */
export async function loadSalesPlaybook(): Promise<SalesPlaybook | null> {
  try {
    const playbookPath = path.join(PLAYBOOKS_PATH, 'transcripts-playbook.json');
    const content = await fs.readFile(playbookPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Load a saved support guide
 */
export async function loadSupportGuide(): Promise<SupportGuide | null> {
  try {
    const guidePath = path.join(PLAYBOOKS_PATH, 'tickets-playbook.json');
    const content = await fs.readFile(guidePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Check if playbooks exist
 */
export async function checkPlaybooksExist(): Promise<{
  salesPlaybook: boolean;
  supportGuide: boolean;
}> {
  const salesPath = path.join(PLAYBOOKS_PATH, 'transcripts-playbook.json');
  const supportPath = path.join(PLAYBOOKS_PATH, 'tickets-playbook.json');

  let salesPlaybook = false;
  let supportGuide = false;

  try {
    await fs.access(salesPath);
    salesPlaybook = true;
  } catch {}

  try {
    await fs.access(supportPath);
    supportGuide = true;
  } catch {}

  return { salesPlaybook, supportGuide };
}


