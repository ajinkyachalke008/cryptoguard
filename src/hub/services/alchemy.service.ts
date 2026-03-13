// src/hub/services/alchemy.service.ts
export const AlchemyService = {
  get KEY() { return process.env.HUB_ALCHEMY_API_KEY || ''; },
  
  get NETWORKS() {
    return {
      eth:      `https://eth-mainnet.g.alchemy.com/v2/${this.KEY}`,
      polygon:  `https://polygon-mainnet.g.alchemy.com/v2/${this.KEY}`,
      arbitrum: `https://arb-mainnet.g.alchemy.com/v2/${this.KEY}`,
      optimism: `https://opt-mainnet.g.alchemy.com/v2/${this.KEY}`,
      base:     `https://base-mainnet.g.alchemy.com/v2/${this.KEY}`,
    };
  },

  async rpc(network: keyof typeof AlchemyService['NETWORKS'], method: string, params: any[] = []) {
    const url = this.NETWORKS[network];
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
