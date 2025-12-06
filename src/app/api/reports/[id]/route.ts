import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    // Query report by ID
    const report = await db
      .select()
      .from(reports)
      .where(eq(reports.id, parseInt(id)))
      .limit(1);

    // Check if report exists
    if (report.length === 0) {
      return NextResponse.json(
        {
          error: 'Report not found',
          code: 'REPORT_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Parse report_data if it exists and is a string
    const reportData = report[0];
    let parsedReport = { ...reportData };

    if (reportData.reportData && typeof reportData.reportData === 'string') {
      try {
        parsedReport.reportData = JSON.parse(reportData.reportData);
      } catch (parseError) {
        console.error('Error parsing report_data:', parseError);
        // Keep original string if parsing fails
      }
    }

    return NextResponse.json(parsedReport, { status: 200 });
  } catch (error) {
    console.error('GET report error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}