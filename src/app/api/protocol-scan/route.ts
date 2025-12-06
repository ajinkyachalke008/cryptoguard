import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Define protocol_scans table schema inline since it's not in the provided schema
const protocolScans = sqliteTable('protocol_scans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  protocolName: text('protocol_name').notNull(),
  contractAddress: text('contract_address').notNull(),
  blockchain: text('blockchain').notNull().default('ethereum'),
  riskScore: integer('risk_score').notNull(),
  auditScore: integer('audit_score').notNull(),
  vulnScore: integer('vuln_score').notNull(),
  rugPullRisk: text('rug_pull_risk').notNull(),
  scanData: text('scan_data').notNull(),
  createdAt: text('created_at').notNull(),
});

function generateMockScanData(protocolName: string, contractAddress: string, blockchain: string) {
  // Generate risk score (20-90)
  const riskScore = Math.floor(Math.random() * 71) + 20;
  
  // Determine if audited (70% chance)
  const isAudited = Math.random() < 0.7;
  
  // Generate audit score based on audit status
  const auditScore = isAudited 
    ? Math.floor(Math.random() * 39) + 60  // 60-98
    : Math.floor(Math.random() * 21) + 20; // 20-40
  
  // Vuln score is inverse of audit score
  const vulnScore = 100 - auditScore;
  
  // Determine rug pull risk based on risk score
  let rugPullRisk: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore < 30) rugPullRisk = 'low';
  else if (riskScore < 60) rugPullRisk = 'medium';
  else if (riskScore < 80) rugPullRisk = 'high';
  else rugPullRisk = 'critical';
  
  // Generate audit firms (1-3 firms for audited protocols)
  const auditFirms = isAudited ? [
    'CertiK', 'Trail of Bits', 'OpenZeppelin', 'Quantstamp', 'Hacken', 'ConsenSys Diligence'
  ].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1) : [];
  
  // Generate audit findings
  const findings = isAudited ? {
    critical: Math.floor(Math.random() * 2),
    high: Math.floor(Math.random() * 4),
    medium: Math.floor(Math.random() * 8) + 1,
    low: Math.floor(Math.random() * 12) + 2
  } : {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };
  
  // Generate vulnerabilities (1-5)
  const totalVulns = Math.floor(Math.random() * 5) + 1;
  const criticalVulns = [
    'Reentrancy vulnerability in withdrawal function',
    'Integer overflow in token calculation',
    'Unprotected selfdestruct function',
    'Arbitrary external call vulnerability',
    'Access control bypass in admin functions'
  ].sort(() => 0.5 - Math.random()).slice(0, Math.floor(totalVulns * 0.2) || 0);
  
  const mediumVulns = [
    'Missing input validation on transfer amounts',
    'Potential denial of service in batch operations',
    'Timestamp dependence in random generation',
    'Unchecked return values',
    'Gas limit issues in loops'
  ].sort(() => 0.5 - Math.random()).slice(0, Math.floor(totalVulns * 0.4) || 1);
  
  const lowVulns = [
    'Inconsistent naming conventions',
    'Missing event emissions',
    'Unused variables in contract',
    'Outdated compiler version',
    'Floating pragma version'
  ].sort(() => 0.5 - Math.random()).slice(0, Math.ceil(totalVulns * 0.4) || 1);
  
  // Generate rug pull data
  const liquidityLocked = riskScore < 50;
  const ownershipRenounced = riskScore < 40;
  const lockDurations = ['7 days', '30 days', '90 days', '1 year', '2 years', 'permanent'];
  const lockDuration = liquidityLocked 
    ? lockDurations[Math.floor(Math.random() * lockDurations.length)]
    : 'unlocked';
  
  const centralizationRisks = ['low', 'medium', 'high', 'critical'];
  const centralizationRisk = centralizationRisks[Math.min(Math.floor(riskScore / 25), 3)];
  
  const suspiciousPatterns: string[] = [];
  if (!liquidityLocked) suspiciousPatterns.push('Liquidity not locked');
  if (!ownershipRenounced) suspiciousPatterns.push('Owner privileges not renounced');
  if (riskScore > 60) suspiciousPatterns.push('High concentration of tokens in few wallets');
  if (riskScore > 70) suspiciousPatterns.push('Unusual contract deployment patterns');
  if (riskScore > 80) suspiciousPatterns.push('Recent history of large transfers to unknown addresses');
  
  // Generate AI explanation
  const aiExplanation = `Security Assessment for ${protocolName}:

Risk Level: ${rugPullRisk.toUpperCase()} (Risk Score: ${riskScore}/100)

Audit Status: ${isAudited ? `Audited by ${auditFirms.join(', ')}` : 'Not audited by major security firms'}
${isAudited ? `Last audit identified ${findings.critical} critical, ${findings.high} high, ${findings.medium} medium, and ${findings.low} low severity findings.` : 'Recommend obtaining professional security audit before investing.'}

Vulnerability Analysis (Score: ${vulnScore}/100):
- Total vulnerabilities detected: ${totalVulns}
- Critical issues: ${criticalVulns.length} 
- Medium issues: ${mediumVulns.length}
- Low issues: ${lowVulns.length}

${criticalVulns.length > 0 ? `⚠️ CRITICAL: ${criticalVulns.join(', ')}` : ''}

Rug Pull Risk Assessment:
- Liquidity Status: ${liquidityLocked ? `Locked for ${lockDuration}` : 'UNLOCKED - HIGH RISK'}
- Ownership: ${ownershipRenounced ? 'Renounced (Good)' : 'Active owner privileges (Risk)'}
- Centralization Risk: ${centralizationRisk}
${suspiciousPatterns.length > 0 ? `- Suspicious Patterns: ${suspiciousPatterns.join(', ')}` : ''}

Recommendation: ${
  riskScore < 30 ? 'Relatively safe for interaction with standard precautions.' :
  riskScore < 60 ? 'Moderate risk - conduct thorough due diligence before investing.' :
  riskScore < 80 ? 'High risk - only invest what you can afford to lose.' :
  'CRITICAL RISK - Exercise extreme caution or avoid entirely.'
}`;
  
  const scanData = {
    audit_data: {
      is_audited: isAudited,
      audit_firms: auditFirms,
      last_audit_date: isAudited 
        ? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : '',
      findings
    },
    vulnerability_data: {
      total_vulnerabilities: totalVulns,
      critical_vulns: criticalVulns,
      medium_vulns: mediumVulns,
      low_vulns: lowVulns
    },
    rug_pull_data: {
      liquidity_locked: liquidityLocked,
      lock_duration: lockDuration,
      ownership_renounced: ownershipRenounced,
      centralization_risk: centralizationRisk,
      suspicious_patterns: suspiciousPatterns
    },
    ai_explanation: aiExplanation
  };
  
  return {
    riskScore,
    auditScore,
    vulnScore,
    rugPullRisk,
    scanData
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { protocol_name, contract_address, blockchain } = body;
    
    // Validation: Require protocol_name and contract_address
    if (!protocol_name || typeof protocol_name !== 'string' || protocol_name.trim() === '') {
      return NextResponse.json({ 
        error: "protocol_name is required and must be a non-empty string",
        code: "MISSING_PROTOCOL_NAME" 
      }, { status: 400 });
    }
    
    if (!contract_address || typeof contract_address !== 'string' || contract_address.trim() === '') {
      return NextResponse.json({ 
        error: "contract_address is required and must be a non-empty string",
        code: "MISSING_CONTRACT_ADDRESS" 
      }, { status: 400 });
    }
    
    // Validate contract_address format (0x...)
    const trimmedAddress = contract_address.trim();
    if (!trimmedAddress.startsWith('0x') || trimmedAddress.length < 40) {
      return NextResponse.json({ 
        error: "contract_address must be a valid format starting with '0x'",
        code: "INVALID_CONTRACT_ADDRESS" 
      }, { status: 400 });
    }
    
    // Default blockchain to "ethereum"
    const blockchainValue = blockchain && typeof blockchain === 'string' && blockchain.trim() !== '' 
      ? blockchain.trim().toLowerCase() 
      : 'ethereum';
    
    // Generate mock scan data
    const { riskScore, auditScore, vulnScore, rugPullRisk, scanData } = generateMockScanData(
      protocol_name.trim(),
      trimmedAddress,
      blockchainValue
    );
    
    const createdAt = new Date().toISOString();
    
    // Insert into database with user_id = 1
    const newScan = await db.insert(protocolScans)
      .values({
        userId: 1,
        protocolName: protocol_name.trim(),
        contractAddress: trimmedAddress,
        blockchain: blockchainValue,
        riskScore,
        auditScore,
        vulnScore,
        rugPullRisk,
        scanData: JSON.stringify(scanData),
        createdAt
      })
      .returning();
    
    if (newScan.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to create protocol scan',
        code: "INSERT_FAILED" 
      }, { status: 500 });
    }
    
    const result = newScan[0];
    
    // Return response with parsed scan_data
    return NextResponse.json({
      id: result.id,
      protocol_name: result.protocolName,
      contract_address: result.contractAddress,
      blockchain: result.blockchain,
      risk_score: result.riskScore,
      audit_score: result.auditScore,
      vuln_score: result.vulnScore,
      rug_pull_risk: result.rugPullRisk,
      created_at: result.createdAt,
      scan_data: JSON.parse(result.scanData)
    }, { status: 201 });
    
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}