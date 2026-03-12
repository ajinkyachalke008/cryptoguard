import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { walletScans } from '@/db/schema';
import { eq, like, and, or, desc, sql } from 'drizzle-orm';

const VALID_RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

function validateRiskScore(score: any): boolean {
  const numScore = parseInt(score);
  return !isNaN(numScore) && numScore >= 0 && numScore <= 100;
}

function validateRiskLevel(level: any): boolean {
  return VALID_RISK_LEVELS.includes(level);
}

function parseJSONField(field: any): any {
  if (!field) return field;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return field;
    }
  }
  return field;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(walletScans)
        .where(eq(walletScans.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Wallet scan not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      // Parse JSON fields for response
      const scan = {
        ...record[0],
        rawData: parseJSONField(record[0].rawData),
        tags: parseJSONField(record[0].tags),
        ruleBasedFlags: parseJSONField(record[0].ruleBasedFlags),
      };

      return NextResponse.json(scan, { status: 200 });
    }

    // List with pagination and filters
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const chain = searchParams.get('chain');
    const riskLevel = searchParams.get('risk_level');
    const userId = searchParams.get('user_id');

    // Build WHERE conditions
    const conditions = [];
    
    if (chain) {
      conditions.push(eq(walletScans.chain, chain));
    }
    
    if (riskLevel) {
      if (!validateRiskLevel(riskLevel)) {
        return NextResponse.json(
          { 
            error: `Invalid risk_level. Must be one of: ${VALID_RISK_LEVELS.join(', ')}`,
            code: 'INVALID_RISK_LEVEL' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(walletScans.riskLevel, riskLevel));
    }
    
    if (userId) {
      const userIdNum = parseInt(userId);
      if (isNaN(userIdNum)) {
        return NextResponse.json(
          { error: 'Invalid user_id', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(walletScans.userId, userIdNum));
    }

    // Build query
    let query: any = db.select().from(walletScans);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Execute query with ordering and pagination
    const results = await query
      .orderBy(desc(walletScans.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination metadata
    let countQuery: any = db.select({ count: sql<number>`count(*)` }).from(walletScans);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const countResult = await countQuery;
    const total = countResult[0]?.count ?? 0;

    // Parse JSON fields for each result
    const parsedResults = results.map((scan: any) => ({
      ...scan,
      rawData: parseJSONField(scan.rawData),
      tags: parseJSONField(scan.tags),
      ruleBasedFlags: parseJSONField(scan.ruleBasedFlags),
    }));

    return NextResponse.json({
      data: parsedResults,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      wallet_address,
      chain,
      risk_score,
      risk_level,
      user_id,
      raw_data,
      tags,
      ai_explanation,
      rule_based_flags,
    } = body;

    // Validate required fields
    if (!wallet_address) {
      return NextResponse.json(
        { error: 'wallet_address is required', code: 'MISSING_WALLET_ADDRESS' },
        { status: 400 }
      );
    }

    if (!chain) {
      return NextResponse.json(
        { error: 'chain is required', code: 'MISSING_CHAIN' },
        { status: 400 }
      );
    }

    if (risk_score === undefined || risk_score === null) {
      return NextResponse.json(
        { error: 'risk_score is required', code: 'MISSING_RISK_SCORE' },
        { status: 400 }
      );
    }

    if (!risk_level) {
      return NextResponse.json(
        { error: 'risk_level is required', code: 'MISSING_RISK_LEVEL' },
        { status: 400 }
      );
    }

    // Validate risk_score range
    if (!validateRiskScore(risk_score)) {
      return NextResponse.json(
        { error: 'risk_score must be between 0 and 100', code: 'INVALID_RISK_SCORE' },
        { status: 400 }
      );
    }

    // Validate risk_level enum
    if (!validateRiskLevel(risk_level)) {
      return NextResponse.json(
        { 
          error: `risk_level must be one of: ${VALID_RISK_LEVELS.join(', ')}`,
          code: 'INVALID_RISK_LEVEL' 
        },
        { status: 400 }
      );
    }

    // Normalize wallet_address to lowercase
    const normalizedAddress = wallet_address.toLowerCase().trim();

    // Prepare insert data
    const insertData: any = {
      walletAddress: normalizedAddress,
      chain: chain.trim(),
      riskScore: parseInt(risk_score),
      riskLevel: risk_level,
      createdAt: new Date().toISOString(),
    };

    // Add optional fields if provided
    if (user_id !== undefined && user_id !== null) {
      insertData.userId = parseInt(user_id);
    }

    if (raw_data !== undefined && raw_data !== null) {
      insertData.rawData = typeof raw_data === 'string' ? raw_data : JSON.stringify(raw_data);
    }

    if (tags !== undefined && tags !== null) {
      insertData.tags = typeof tags === 'string' ? tags : JSON.stringify(tags);
    }

    if (ai_explanation !== undefined && ai_explanation !== null) {
      insertData.aiExplanation = ai_explanation;
    }

    if (rule_based_flags !== undefined && rule_based_flags !== null) {
      insertData.ruleBasedFlags = typeof rule_based_flags === 'string' 
        ? rule_based_flags 
        : JSON.stringify(rule_based_flags);
    }

    // Insert into database
    const newRecord = await db.insert(walletScans)
      .values(insertData)
      .returning();

    // Parse JSON fields for response
    const createdScan = {
      ...newRecord[0],
      rawData: parseJSONField(newRecord[0].rawData),
      tags: parseJSONField(newRecord[0].tags),
      ruleBasedFlags: parseJSONField(newRecord[0].ruleBasedFlags),
    };

    return NextResponse.json(createdScan, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const recordId = parseInt(id);

    // Check if record exists
    const existing = await db
      .select()
      .from(walletScans)
      .where(eq(walletScans.id, recordId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Wallet scan not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      risk_score,
      risk_level,
      tags,
      ai_explanation,
      rule_based_flags,
    } = body;

    // Validate risk_score if provided
    if (risk_score !== undefined && risk_score !== null) {
      if (!validateRiskScore(risk_score)) {
        return NextResponse.json(
          { error: 'risk_score must be between 0 and 100', code: 'INVALID_RISK_SCORE' },
          { status: 400 }
        );
      }
    }

    // Validate risk_level if provided
    if (risk_level !== undefined && risk_level !== null) {
      if (!validateRiskLevel(risk_level)) {
        return NextResponse.json(
          { 
            error: `risk_level must be one of: ${VALID_RISK_LEVELS.join(', ')}`,
            code: 'INVALID_RISK_LEVEL' 
          },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updateData: any = {};

    if (risk_score !== undefined && risk_score !== null) {
      updateData.riskScore = parseInt(risk_score);
    }

    if (risk_level !== undefined && risk_level !== null) {
      updateData.riskLevel = risk_level;
    }

    if (tags !== undefined) {
      updateData.tags = tags === null ? null : (typeof tags === 'string' ? tags : JSON.stringify(tags));
    }

    if (ai_explanation !== undefined) {
      updateData.aiExplanation = ai_explanation;
    }

    if (rule_based_flags !== undefined) {
      updateData.ruleBasedFlags = rule_based_flags === null 
        ? null 
        : (typeof rule_based_flags === 'string' ? rule_based_flags : JSON.stringify(rule_based_flags));
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATE_FIELDS' },
        { status: 400 }
      );
    }

    // Update the record
    const updated = await db
      .update(walletScans)
      .set(updateData)
      .where(eq(walletScans.id, recordId))
      .returning();

    // Parse JSON fields for response
    const updatedScan = {
      ...updated[0],
      rawData: parseJSONField(updated[0].rawData),
      tags: parseJSONField(updated[0].tags),
      ruleBasedFlags: parseJSONField(updated[0].ruleBasedFlags),
    };

    return NextResponse.json(updatedScan, { status: 200 });

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const recordId = parseInt(id);

    // Check if record exists
    const existing = await db
      .select()
      .from(walletScans)
      .where(eq(walletScans.id, recordId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Wallet scan not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete the record
    const deleted = await db
      .delete(walletScans)
      .where(eq(walletScans.id, recordId))
      .returning();

    // Parse JSON fields for response
    const deletedScan = {
      ...deleted[0],
      rawData: parseJSONField(deleted[0].rawData),
      tags: parseJSONField(deleted[0].tags),
      ruleBasedFlags: parseJSONField(deleted[0].ruleBasedFlags),
    };

    return NextResponse.json(
      {
        message: 'Wallet scan deleted successfully',
        deleted: deletedScan,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}