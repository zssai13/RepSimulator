import { NextRequest, NextResponse } from 'next/server';
import { loadSalesPlaybook, loadSupportGuide } from '@/lib/extractor';
import { generateSalesPlaybookPDF, generateSupportGuidePDF } from '@/lib/pdf-generator';

interface RouteParams {
  params: Promise<{
    bucket: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { bucket } = await params;

    if (bucket === 'transcripts') {
      // Load and generate Sales Playbook PDF
      const playbook = await loadSalesPlaybook();

      if (!playbook) {
        return NextResponse.json(
          { error: 'Sales playbook not found. Please upload transcripts first.' },
          { status: 404 }
        );
      }

      const pdfBuffer = await generateSalesPlaybookPDF(playbook);

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="sales-playbook-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });

    } else if (bucket === 'tickets') {
      // Load and generate Support Guide PDF
      const guide = await loadSupportGuide();

      if (!guide) {
        return NextResponse.json(
          { error: 'Support guide not found. Please upload tickets first.' },
          { status: 404 }
        );
      }

      const pdfBuffer = await generateSupportGuidePDF(guide);

      return new NextResponse(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="support-guide-${new Date().toISOString().split('T')[0]}.pdf"`,
        },
      });

    } else {
      return NextResponse.json(
        { error: 'Invalid bucket. Must be "transcripts" or "tickets"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Download API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}


