import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { agentConfig } from '@/config/agent-config';
import { buildSystemPrompt, formatMessagesForClaude } from '@/lib/llm';
import { Message } from '@/types';
import { queryAllTables } from '@/lib/vectorstore';
import { loadSalesPlaybook, loadSupportGuide } from '@/lib/extractor';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Request body type
interface ChatRequestBody {
  messages: Message[];
  initialMessage: string;
  pageContext: string;
  goal: string;
}

// Track which knowledge sources are used
interface KnowledgeSources {
  rag: boolean;
  salesPlaybook: boolean;
  supportGuide: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ChatRequestBody = await request.json();
    const { messages, initialMessage, pageContext, goal } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Format messages for Claude API
    const formattedMessages = formatMessagesForClaude(messages);

    // Ensure we have at least one message
    if (formattedMessages.length === 0) {
      return NextResponse.json(
        { error: 'At least one user message is required' },
        { status: 400 }
      );
    }

    // Get the latest user message for RAG query
    const latestUserMessage = formattedMessages
      .filter((m) => m.role === 'user')
      .pop()?.content || '';

    // Build knowledge context from all sources
    const knowledgeParts: string[] = [];
    const sources: KnowledgeSources = {
      rag: false,
      salesPlaybook: false,
      supportGuide: false,
    };

    // 1. Query RAG for relevant context (if OpenAI key is available)
    if (process.env.OPENAI_API_KEY && latestUserMessage) {
      try {
        const ragResults = await queryAllTables(latestUserMessage, 5);
        
        if (ragResults.length > 0) {
          const ragContext = ragResults
            .map((r, i) => `[${i + 1}] From ${r.source} (${r.table}):\n${r.text}`)
            .join('\n\n');
          
          knowledgeParts.push(`=== RETRIEVED FROM WEBSITE/DOCS ===\n${ragContext}`);
          sources.rag = true;
          console.log(`RAG: Found ${ragResults.length} relevant chunks`);
        }
      } catch (ragError) {
        console.error('RAG query error (continuing without context):', ragError);
      }
    }

    // 2. Load Sales Playbook if available
    try {
      const salesPlaybook = await loadSalesPlaybook();
      if (salesPlaybook) {
        const playbookSummary = formatPlaybookForContext(salesPlaybook);
        knowledgeParts.push(`=== SALES PLAYBOOK ===\n${playbookSummary}`);
        sources.salesPlaybook = true;
        console.log('Loaded sales playbook into context');
      }
    } catch (error) {
      console.error('Error loading sales playbook:', error);
    }

    // 3. Load Support Guide if available
    try {
      const supportGuide = await loadSupportGuide();
      if (supportGuide) {
        const guideSummary = formatGuideForContext(supportGuide);
        knowledgeParts.push(`=== SUPPORT FAQ GUIDE ===\n${guideSummary}`);
        sources.supportGuide = true;
        console.log('Loaded support guide into context');
      }
    } catch (error) {
      console.error('Error loading support guide:', error);
    }

    // Combine all knowledge
    const knowledgeContext = knowledgeParts.length > 0 
      ? knowledgeParts.join('\n\n---\n\n') 
      : undefined;

    // Build the system prompt with all context
    const systemPrompt = buildSystemPrompt({
      pageContext: pageContext || '',
      initialMessage: initialMessage || '',
      goal: goal || '',
      knowledgeContext,
    });

    // Call Claude API
    const response = await anthropic.messages.create({
      model: agentConfig.model,
      max_tokens: agentConfig.maxTokens,
      system: systemPrompt,
      messages: formattedMessages,
    });

    // Extract the text response
    const textContent = response.content.find((block) => block.type === 'text');
    const assistantMessage = textContent?.type === 'text' ? textContent.text : '';

    // Return the response with knowledge source info
    return NextResponse.json({
      message: assistantMessage,
      usage: response.usage,
      knowledgeSources: sources,
    });

  } catch (error) {
    console.error('Chat API Error:', error);

    // Handle specific error types
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your ANTHROPIC_API_KEY.' },
          { status: 401 }
        );
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `API Error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Format Sales Playbook for inclusion in context
 * Summarizes key patterns without overwhelming the context
 */
function formatPlaybookForContext(playbook: {
  objections: Array<{ objection: string; winningResponse: string }>;
  closingPatterns: string[];
  valuePropositions: string[];
  rapportBuilding: string[];
  phrasesToAvoid: string[];
  keyQuestionsAnswers: Array<{ question: string; answer: string }>;
}): string {
  const parts: string[] = [];

  if (playbook.objections.length > 0) {
    parts.push('OBJECTION HANDLERS:');
    playbook.objections.slice(0, 5).forEach((o) => {
      parts.push(`• "${o.objection}" → ${o.winningResponse}`);
    });
  }

  if (playbook.closingPatterns.length > 0) {
    parts.push('\nCLOSING PATTERNS:');
    playbook.closingPatterns.slice(0, 3).forEach((p) => {
      parts.push(`• ${p}`);
    });
  }

  if (playbook.valuePropositions.length > 0) {
    parts.push('\nVALUE PROPOSITIONS:');
    playbook.valuePropositions.slice(0, 3).forEach((v) => {
      parts.push(`• ${v}`);
    });
  }

  if (playbook.keyQuestionsAnswers.length > 0) {
    parts.push('\nCOMMON QUESTIONS:');
    playbook.keyQuestionsAnswers.slice(0, 5).forEach((qa) => {
      parts.push(`• Q: ${qa.question}\n  A: ${qa.answer}`);
    });
  }

  if (playbook.phrasesToAvoid.length > 0) {
    parts.push('\nAVOID THESE PHRASES:');
    playbook.phrasesToAvoid.slice(0, 3).forEach((p) => {
      parts.push(`• ${p}`);
    });
  }

  return parts.join('\n');
}

/**
 * Format Support Guide for inclusion in context
 */
function formatGuideForContext(guide: {
  faqs: Array<{ question: string; answer: string }>;
  issuesResolutions: Array<{ issue: string; resolution: string }>;
  frictionPoints: string[];
  escalationTriggers: string[];
}): string {
  const parts: string[] = [];

  if (guide.faqs.length > 0) {
    parts.push('FREQUENTLY ASKED QUESTIONS:');
    guide.faqs.slice(0, 5).forEach((faq) => {
      parts.push(`• Q: ${faq.question}\n  A: ${faq.answer}`);
    });
  }

  if (guide.issuesResolutions.length > 0) {
    parts.push('\nCOMMON ISSUES & SOLUTIONS:');
    guide.issuesResolutions.slice(0, 3).forEach((ir) => {
      parts.push(`• Issue: ${ir.issue}\n  Solution: ${ir.resolution}`);
    });
  }

  if (guide.frictionPoints.length > 0) {
    parts.push('\nKNOWN FRICTION POINTS:');
    guide.frictionPoints.slice(0, 3).forEach((fp) => {
      parts.push(`• ${fp}`);
    });
  }

  if (guide.escalationTriggers.length > 0) {
    parts.push('\nESCALATION TRIGGERS (offer human support):');
    guide.escalationTriggers.slice(0, 3).forEach((et) => {
      parts.push(`• ${et}`);
    });
  }

  return parts.join('\n');
}
