import { NextRequest, NextResponse } from 'next/server';
import { ingestDocuments, TableName, clearTable } from '@/lib/vectorstore';
import { chunkDocuments } from '@/lib/text-chunker';

// Request body type
interface IngestRequestBody {
  bucket: 'website' | 'documentation';
  documents: Array<{
    filename: string;
    content: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: IngestRequestBody = await request.json();
    const { bucket, documents } = body;

    // Validate bucket type
    if (!['website', 'documentation'].includes(bucket)) {
      return NextResponse.json(
        { error: 'Invalid bucket. Must be "website" or "documentation"' },
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

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const tableName = bucket as TableName;

    // Clear existing content for this bucket (re-upload replaces)
    await clearTable(tableName);

    // Chunk all documents
    console.log(`Chunking ${documents.length} documents for ${bucket}...`);
    const chunks = chunkDocuments(documents);
    console.log(`Created ${chunks.length} chunks`);

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No content could be extracted from the documents' },
        { status: 400 }
      );
    }

    // Ingest into vector store
    const result = await ingestDocuments(tableName, chunks);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to ingest documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bucket,
      documentsProcessed: documents.length,
      chunksCreated: result.chunksProcessed,
    });

  } catch (error) {
    console.error('Ingest API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process documents' },
      { status: 500 }
    );
  }
}


