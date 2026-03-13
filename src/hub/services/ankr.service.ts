// src/hub/services/ankr.service.ts
const ANKR_RPCS: Record<string, string> = {
  eth:       'https://rpc.ankr.com/eth',
  bsc:       'https://rpc.ankr.com/bsc',
  polygon:   'https://rpc.ankr.com/polygon',
  avalanche: 'https://rpc.ankr.com/avalanche',
  arbitrum:  'https://rpc.ankr.com/arbitrum',
  optimism:  'https://rpc.ankr.com/optimism',
  fantom:    'https://rpc.ankr.com/fantom',
};

export const AnkrService = {
  async call(chain: string, method: string, params: any[] = []) {
    const url = ANKR_RPCS[chain];
    if (!url) throw new Error(`Ankr RPC for ${chain} not configured`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
    });
    const { result, error } = await res.json();
    if (error) throw new Error(`Ankr RPC error [${chain}]: ${error.message}`);
    return result;
  },

  async getBalance(address: string, chain = 'eth') {
    const hex = await this.call(chain, 'eth_getBalance', [address, 'latest']);
    return parseInt(hex, 16) / 1e18;
  }
};
