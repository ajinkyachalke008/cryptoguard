import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { web3Service } from '../lib/services/web3Service';

describe('Web3Service — On-Chain & Forensic Telemetry Integration', () => {
  const sampleEthAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  const cleanAddress = '0x1111111111111111111111111111111111111111';
  const validTxHash = '0x' + 'a'.repeat(64);

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('rejects invalid wallet address formats defensively', async () => {
    await expect(web3Service.getWalletActivity('0xinvalid-address', 'eth'))
      .rejects.toThrow('Invalid wallet address format');
  });

  it('rejects invalid transaction hash formats defensively', async () => {
    await expect(web3Service.getTransactionDetails('0xshort', 'eth'))
      .rejects.toThrow('Invalid transaction hash format');
  });

  it('provides deterministic synthetic fallback with SIMULATED_MOCK provenance when API key is missing', async () => {
    vi.stubEnv('ALCHEMY_API_KEY', '');
    vi.stubEnv('HUB_ALCHEMY_API_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_ALCHEMY_API_KEY', '');

    const activity1 = await web3Service.getWalletActivity(sampleEthAddress, 'eth');
    const activity2 = await web3Service.getWalletActivity(sampleEthAddress, 'eth');

    expect(activity1.evidenceStatus).toBe('SIMULATED_MOCK');
    expect(activity1.provider).toContain('Simulator');
    expect(activity1.address).toBe(sampleEthAddress.toLowerCase());
    expect(activity1.balance).toBe(activity2.balance);
    expect(activity1.transactionCount).toBe(activity2.transactionCount);
  });

  it('parses on-chain JSON-RPC response and tags VERIFIED_ON_CHAIN when live RPC responds', async () => {
    vi.stubEnv('ALCHEMY_API_KEY', 'test-alchemy-key');

    const fakeFetch = vi.fn().mockImplementation((url: string, options: any) => {
      const body = JSON.parse(options.body);
      if (body.method === 'eth_getBalance') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            jsonrpc: '2.0',
            id: body.id,
            result: '0x1bc16d674ec80000' // 2 ETH in wei
          })
        });
      }
      if (body.method === 'eth_getTransactionCount') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            jsonrpc: '2.0',
            id: body.id,
            result: '0x2a' // 42 transactions
          })
        });
      }
      return Promise.reject(new Error('Unknown method'));
    });

    vi.stubGlobal('fetch', fakeFetch);

    const activity = await web3Service.getWalletActivity(sampleEthAddress, 'eth');

    expect(activity.evidenceStatus).toBe('VERIFIED_ON_CHAIN');
    expect(activity.provider).toBe('Alchemy JSON-RPC');
    expect(activity.transactionCount).toBe(42);
    expect(activity.balance).toBe('2.0000 ETH');
  });

  it('handles live RPC transaction lookup with VERIFIED_ON_CHAIN provenance', async () => {
    vi.stubEnv('ALCHEMY_API_KEY', 'test-alchemy-key');

    const fakeFetch = vi.fn().mockImplementation((url: string, options: any) => {
      const body = JSON.parse(options.body);
      if (body.method === 'eth_getTransactionByHash') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            jsonrpc: '2.0',
            id: body.id,
            result: {
              hash: validTxHash,
              from: '0x1111111111111111111111111111111111111111',
              to: '0x2222222222222222222222222222222222222222',
              value: '0xde0b6b3a7640000', // 1 ETH
              gas: '0x5208', // 21000
              gasPrice: '0x4a817c800', // 20 Gwei
              blockNumber: '0x112233',
              blockHash: '0xabc'
            }
          })
        });
      }
      return Promise.reject(new Error('Unknown method'));
    });

    vi.stubGlobal('fetch', fakeFetch);

    const tx = await web3Service.getTransactionDetails(validTxHash, 'eth');

    expect(tx.evidenceStatus).toBe('VERIFIED_ON_CHAIN');
    expect(tx.provider).toBe('Alchemy JSON-RPC');
    expect(tx.from).toBe('0x1111111111111111111111111111111111111111');
    expect(tx.to).toBe('0x2222222222222222222222222222222222222222');
  });

  it('identifies known sanctioned / OFAC addresses accurately', async () => {
    const tornadoResult = await web3Service.checkBlacklist('0x742d35Cc6634C0532925a3b844Bc9e7595f2bd3e');
    expect(tornadoResult.isBlacklisted).toBe(true);
    expect(tornadoResult.sources).toContain('OFAC');

    const cleanResult = await web3Service.checkBlacklist(cleanAddress);
    expect(cleanResult.isBlacklisted).toBe(false);
  });
});

