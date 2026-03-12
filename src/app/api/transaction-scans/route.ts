import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transactionScans } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

const VALID_RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;

function validateRiskScore(score: number): boolean {
  return Number.isInteger(score) && score >= 0 && score <= 100;
}

function validateRiskLevel(level: string): boolean {
  return VALID_RISK_LEVELS.includes(level as typeof VALID_RISK_LEVELS[number]);
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

function formatScanResponse(scan: any) {
  return {
    ...scan,
    rawData: parseJSONField(scan.rawData),
    tags: parseJSONField(scan.tags),
    ruleBasedFlags: parseJSONField(scan.ruleBasedFlags),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const scanId = parseInt(id);
      if (isNaN(scanId)) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const scan = await db.select()
        .from(transactionScans)
        .where(eq(transactionScans.id, scanId))
        .limit(1);

      if (scan.length === 0) {
        return NextResponse.json({ 
          error: 'Transaction scan not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(formatScanResponse(scan[0]));
    }

    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const chain = searchParams.get('chain');
    const riskLevel = searchParams.get('risk_level');
    const userId = searchParams.get('user_id');

    let query: any = db.select().from(transactionScans);

    const conditions = [];
    if (chain) {
      conditions.push(eq(transactionScans.chain, chain));
    }
    if (riskLevel) {
      if (!validateRiskLevel(riskLevel)) {
        return NextResponse.json({ 
          error: 'Invalid risk level. Must be one of: low, medium, high, critical',
          code: 'INVALID_RISK_LEVEL' 
        }, { status: 400 });
      }
      conditions.push(eq(transactionScans.riskLevel, riskLevel));
    }
    if (userId) {
      const userIdInt = parseInt(userId);
      if (isNaN(userIdInt)) {
        return NextResponse.json({ 
          error: 'Valid user ID is required',
          code: 'INVALID_USER_ID' 
        }, { status: 400 });
      }
      conditions.push(eq(transactionScans.userId, userIdInt));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(transactionScans.createdAt))
      .limit(limit)
      .offset(offset);

    const formattedResults = results.map(formatScanResponse);

    return NextResponse.json({
      data: formattedResults,
      pagination: {
        limit,
        offset,
        count: results.length
      }
    });
  } catch (error: any) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      tx_hash, 
      chain, 
      risk_score, 
      risk_level,
      user_id,
      raw_data,
      tags,
      ai_explanation,
      rule_based_flags
    } = body;

    if (!tx_hash || typeof tx_hash !== 'string' || tx_hash.trim() === '') {
      return NextResponse.json({ 
        error: 'tx_hash is required and must be a non-empty string',
        code: 'MISSING_TX_HASH' 
      }, { status: 400 });
    }

    if (!chain || typeof chain !== 'string' || chain.trim() === '') {
      return NextResponse.json({ 
        error: 'chain is required and must be a non-empty string',
        code: 'MISSING_CHAIN' 
      }, { status: 400 });
    }

    if (risk_score === undefined || risk_score === null) {
      return NextResponse.json({ 
        error: 'risk_score is required',
        code: 'MISSING_RISK_SCORE' 
      }, { status: 400 });
    }

    if (!validateRiskScore(risk_score)) {
      return NextResponse.json({ 
        error: 'risk_score must be an integer between 0 and 100',
        code: 'INVALID_RISK_SCORE' 
      }, { status: 400 });
    }

    if (!risk_level || typeof risk_level !== 'string') {
      return NextResponse.json({ 
        error: 'risk_level is required',
        code: 'MISSING_RISK_LEVEL' 
      }, { status: 400 });
    }

    if (!validateRiskLevel(risk_level)) {
      return NextResponse.json({ 
        error: 'risk_level must be one of: low, medium, high, critical',
        code: 'INVALID_RISK_LEVEL' 
      }, { status: 400 });
    }

    const insertData: any = {
      txHash: tx_hash.trim(),
      chain: chain.trim(),
      riskScore: risk_score,
      riskLevel: risk_level,
      createdAt: new Date().toISOString(),
    };

    if (user_id !== undefined && user_id !== null) {
      insertData.userId = user_id;
    }

    if (raw_data !== undefined) {
      insertData.rawData = typeof raw_data === 'string' ? raw_data : JSON.stringify(raw_data);
    }

    if (tags !== undefined) {
      insertData.tags = typeof tags === 'string' ? tags : JSON.stringify(tags);
    }

    if (ai_explanation !== undefined && ai_explanation !== null) {
      insertData.aiExplanation = ai_explanation;
    }

    if (rule_based_flags !== undefined) {
      insertData.ruleBasedFlags = typeof rule_based_flags === 'string' ? rule_based_flags : JSON.stringify(rule_based_flags);
    }

    const newScan = await db.insert(transactionScans)
      .values(insertData)
      .returning();

    return NextResponse.json(formatScanResponse(newScan[0]), { status: 201 });
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const scanId = parseInt(id);

    const existing = await db.select()
      .from(transactionScans)
      .where(eq(transactionScans.id, scanId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction scan not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { 
      risk_score, 
      risk_level,
      tags,
      ai_explanation,
      rule_based_flags
    } = body;

    const updates: any = {};

    if (risk_score !== undefined && risk_score !== null) {
      if (!validateRiskScore(risk_score)) {
        return NextResponse.json({ 
          error: 'risk_score must be an integer between 0 and 100',
          code: 'INVALID_RISK_SCORE' 
        }, { status: 400 });
      }
      updates.riskScore = risk_score;
    }

    if (risk_level !== undefined && risk_level !== null) {
      if (!validateRiskLevel(risk_level)) {
        return NextResponse.json({ 
          error: 'risk_level must be one of: low, medium, high, critical',
          code: 'INVALID_RISK_LEVEL' 
        }, { status: 400 });
      }
      updates.riskLevel = risk_level;
    }

    if (tags !== undefined) {
      updates.tags = typeof tags === 'string' ? tags : JSON.stringify(tags);
    }

    if (ai_explanation !== undefined) {
      updates.aiExplanation = ai_explanation;
    }

    if (rule_based_flags !== undefined) {
      updates.ruleBasedFlags = typeof rule_based_flags === 'string' ? rule_based_flags : JSON.stringify(rule_based_flags);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update',
        code: 'NO_UPDATES' 
      }, { status: 400 });
    }

    const updated = await db.update(transactionScans)
      .set(updates)
      .where(eq(transactionScans.id, scanId))
      .returning();

    return NextResponse.json(formatScanResponse(updated[0]));
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    const scanId = parseInt(id);

    const existing = await db.select()
      .from(transactionScans)
      .where(eq(transactionScans.id, scanId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json({ 
        error: 'Transaction scan not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const deleted = await db.delete(transactionScans)
      .where(eq(transactionScans.id, scanId))
      .returning();

    return NextResponse.json({
      message: 'Transaction scan deleted successfully',
      deleted: formatScanResponse(deleted[0])
    });
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error.message 
    }, { status: 500 });
  }
}