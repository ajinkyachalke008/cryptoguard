import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '../app/api/wallet-scan/route';

describe('/api/wallet-scan Route — Provenance & Telemetry Verification', () => {
  const normalAddress = '0x1111111111111111111111111111111111111111';
  const tornadoCashAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  it('rejects POST requests with missing address parameter', async () => {
    const req = new NextRequest('http://localhost:3000/api/wallet-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blockchain: 'ethereum' })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('MISSING_ADDRESS');
  });

  it('returns valid scan response with evidence_status and provider metadata', async () => {
    const req = new NextRequest('http://localhost:3000/api/wallet-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: normalAddress, blockchain: 'ethereum' })
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();

    expect(json.wallet_address).toBe(normalAddress);
    expect(json.evidence_status).toBeDefined();
    expect(['VERIFIED_ON_CHAIN', 'SIMULATED_MOCK']).toContain(json.evidence_status);
    expect(json.provider).toBeDefined();
    expect(json.scan_data).toBeDefined();
    expect(json.scan_data.evidence_status).toBe(json.evidence_status);
  });

  it('flags known sanctioned wallet with critical sanctions status', async () => {
    const req = new NextRequest('http://localhost:3000/api/wallet-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: tornadoCashAddress, blockchain: 'ethereum' })
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    const json = await res.json();

    expect(json.sanctions_status).toBe('sanctioned');
    expect(json.risk_score).toBeGreaterThanOrEqual(80);
    expect(json.scan_data.sanctions_data.is_sanctioned).toBe(true);
  });

  it('handles GET queries by delegating to POST logic', async () => {
    const req = new NextRequest(`http://localhost:3000/api/wallet-scan?address=${normalAddress}&blockchain=polygon`, {
      method: 'GET'
    });

    const res = await GET(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.blockchain).toBe('polygon');
  });
});

