import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { walletScans } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }

    // Query wallet scan by ID
    const scanResult = await db.select()
      .from(walletScans)
      .where(eq(walletScans.id, parseInt(id)))
      .limit(1);

    // Check if scan exists
    if (scanResult.length === 0) {
      return NextResponse.json(
        { 
          error: 'Wallet scan not found',
          code: 'SCAN_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    const scan = scanResult[0];

    // Parse rawData from JSON string to object
    let parsedRawData = null;
    if (scan.rawData) {
      try {
        parsedRawData = typeof scan.rawData === 'string' 
          ? JSON.parse(scan.rawData) 
          : scan.rawData;
      } catch (parseError) {
        console.error('Error parsing rawData:', parseError);
        // Keep as string if parsing fails
        parsedRawData = scan.rawData;
      }
    }

    // Return complete scan object with parsed rawData
    const response = {
      ...scan,
      rawData: parsedRawData
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}