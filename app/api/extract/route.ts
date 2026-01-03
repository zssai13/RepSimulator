import { NextRequest, NextResponse } from 'next/server';
import { extractSalesPlaybook, extractSupportGuide } from '@/lib/extractor';

// Request body type
interface ExtractRequestBody {
  bucket: 'transcripts' | 'tickets';
  documents: Array<{
    filename: string;
    content: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExtractRequestBody = await request.json();
    const { bucket, documents } = body;

    // Validate bucket type
    if (!['transcripts', 'tickets'].includes(bucket)) {
      return NextResponse.json(
        { error: 'Invalid bucket. Must be "transcripts" or "tickets"' },
        { status: 400 }
      );
    }

    // Validate documents
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: 'Documents array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Check for Anthropic API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    console.log(`Extracting ${bucket} from ${documents.length} files...`);

    if (bucket === 'transcripts') {
      // Extract Sales Playbook
      const result = await extractSalesPlaybook(documents);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to extract playbook' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        bucket,
        documentsProcessed: documents.length,
        playbookUrl: '/api/download/transcripts',
        playbook: result.playbook,
      });

    } else {
      // Extract Support Guide
      const result = await extractSupportGuide(documents);

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to extract guide' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        bucket,
        documentsProcessed: documents.length,
        playbookUrl: '/api/download/tickets',
        guide: result.guide,
      });
    }

  } catch (error) {
    console.error('Extract API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process documents' },
      { status: 500 }
    );
  }
}


