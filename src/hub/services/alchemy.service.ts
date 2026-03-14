// src/hub/services/alchemy.service.ts
const ALCHEMY_KEY = process.env.HUB_ALCHEMY_API_KEY || '';

const ALCHEMY_NETWORKS = {
  eth:      `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  polygon:  `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  optimism: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
  base:     `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`,
};

export const AlchemyService = {
  get KEY() { return ALCHEMY_KEY; },
  get NETWORKS() { return ALCHEMY_NETWORKS; },

  async rpc(network: keyof typeof ALCHEMY_NETWORKS, method: string, params: any[] = []) {
    const url = ALCHEMY_NETWORKS[network];
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    });
    const { result, error } = await res.json();
    if (error) throw new Error(`Alchemy RPC error: ${error.message}`);
    return result;
  },

  async getTokenBalances(address: string, network: any = 'eth') {
    return this.rpc(network, 'alchemy_getTokenBalances', [address, 'erc20']);
  },

  async getAssetTransfers(address: string, network: any = 'eth') {
    return this.rpc(network, 'alchemy_getAssetTransfers', [{
      fromAddress: address, category: ['erc20', 'erc721', 'erc1155', 'external'],
      withMetadata: true, excludeZeroValue: true, maxCount: '0x64',
    }]);
  }
};
