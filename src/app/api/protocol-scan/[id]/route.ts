import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { protocolScans } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id) {
      return NextResponse.json(
        { 
          error: 'ID parameter is required',
          code: 'MISSING_ID'
        },
        { status: 400 }
      );
    }

    // Validate ID is a valid integer
    const parsedId = parseInt(id);
    if (isNaN(parsedId)) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Query protocol scan by ID
    const result = await db.select()
      .from(protocolScans)
      .where(eq(protocolScans.id, parsedId))
      .limit(1);

    // Return 404 if not found
    if (result.length === 0) {
      return NextResponse.json(
        { 
          error: 'Protocol scan not found',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const scan = result[0];

    // Parse scan_data JSON if it exists and is a string
    let parsedScan = { ...scan };
    if (scan.scanData && typeof scan.scanData === 'string') {
      try {
        parsedScan.scanData = JSON.parse(scan.scanData);
      } catch (parseError) {
        console.error('Error parsing scan_data JSON:', parseError);
        // Keep original string if parsing fails
      }
    }

    // Return the complete scan object
    return NextResponse.json(parsedScan, { status: 200 });

  } catch (error) {
    console.error('GET protocol scan error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}