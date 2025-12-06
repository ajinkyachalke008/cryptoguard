import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'json';

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        },
        { status: 400 }
      );
    }

    // Validate format parameter
    if (format !== 'pdf' && format !== 'json') {
      return NextResponse.json(
        { 
          error: 'Format must be either "pdf" or "json"',
          code: 'INVALID_FORMAT' 
        },
        { status: 400 }
      );
    }

    // Query report by ID
    const report = await db.select()
      .from(reports)
      .where(eq(reports.id, parseInt(id)))
      .limit(1);

    // Return 404 if report not found
    if (report.length === 0) {
      return NextResponse.json(
        { 
          error: 'Report not found',
          code: 'REPORT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const reportData = report[0];

    // Handle JSON format
    if (format === 'json') {
      const jsonContent = JSON.stringify(reportData.report_data || reportData, null, 2);
      
      return new NextResponse(jsonContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="report-${id}.json"`,
          'Content-Length': String(Buffer.byteLength(jsonContent))
        }
      });
    }

    // Handle PDF format (mock)
    if (format === 'pdf') {
      const pdfContent = 'PDF Report Generation - In production, this would generate a formatted PDF report';
      
      return new NextResponse(pdfContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="report-${id}.pdf"`,
          'Content-Length': String(Buffer.byteLength(pdfContent))
        }
      });
    }

    // Fallback (should never reach here due to format validation)
    return NextResponse.json(
      { 
        error: 'Invalid format specified',
        code: 'INVALID_FORMAT' 
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('GET /api/reports/[id]/download error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}