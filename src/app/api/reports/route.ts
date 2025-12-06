import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reports } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Filter parameters
    const reportType = searchParams.get('report_type');
    const blockchain = searchParams.get('blockchain');

    // Build where conditions (user_id = 1)
    const conditions = [eq(reports.userId, 1)];

    if (reportType) {
      conditions.push(eq(reports.reportType, reportType));
    }

    if (blockchain) {
      conditions.push(eq(reports.blockchain, blockchain));
    }

    const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

    // Get total count for pagination
    const totalCountResult = await db
      .select()
      .from(reports)
      .where(whereCondition);

    const total = totalCountResult.length;

    // Get paginated reports
    const reportsList = await db
      .select()
      .from(reports)
      .where(whereCondition)
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    // Parse report_data JSON for each report
    const reportsWithParsedData = reportsList.map(report => ({
      ...report,
      reportData: report.reportData ? JSON.parse(report.reportData as string) : null
    }));

    // Calculate pagination metadata
    const hasMore = offset + limit < total;

    return NextResponse.json(
      {
        reports: reportsWithParsedData,
        pagination: {
          total,
          limit,
          offset,
          has_more: hasMore
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET reports error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}