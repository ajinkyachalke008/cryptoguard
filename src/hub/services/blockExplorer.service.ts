// src/hub/services/blockExplorer.service.ts
import { hubFetch } from './hub.fetcher';

const ENDPOINTS: Record<string, { base: string, key: string | undefined }> = {
  eth:      { base: 'https://api.etherscan.io/api',             key: process.env.HUB_ETHERSCAN_API_KEY },
  bsc:      { base: 'https://api.bscscan.com/api',              key: process.env.HUB_BSCSCAN_API_KEY },
  polygon:  { base: 'https://api.polygonscan.com/api',          key: process.env.HUB_POLYGONSCAN_API_KEY },
  arbitrum: { base: 'https://api.arbiscan.io/api',              key: process.env.HUB_ARBISCAN_API_KEY },
  optimism: { base: 'https://api-optimistic.etherscan.io/api',  key: process.env.HUB_OPTIMISM_API_KEY },
  avalanche:{ base: 'https://api.snowtrace.io/api',             key: process.env.HUB_SNOWTRACE_API_KEY },
  fantom:   { base: 'https://api.ftmscan.com/api',              key: process.env.HUB_FTMSCAN_API_KEY },
};

export const BlockExplorerService = {
  async call(chain: string, params: Record<string, string>) {
    const config = ENDPOINTS[chain];
    if (!config || !config.base) throw new Error(`Chain ${chain} not supported`);
    const apikey = config.key || ''; // Fallback to empty if not provided, though recommended
    const query = new URLSearchParams({ ...params, apikey });
    const res = await hubFetch<any>(`${config.base}?${query}`);
    if (res.status === '0' && res.message !== 'No transactions found') {
      throw new Error(`Explorer error [${chain}]: ${res.result || res.message}`);
    }
    return res.result;
  },

  async getTransactions(address: string, chain = 'eth', page = 1, offset = 100) {
    return this.call(chain, { module: 'account', action: 'txlist', address, page: page.toString(), offset: offset.toString(), sort: 'desc' });
  },

  async getTokenTransfers(address: string, chain = 'eth') {
    return this.call(chain, { module: 'account', action: 'tokentx', address, sort: 'desc' });
  },

  async getBalance(address: string, chain = 'eth') {
    const wei = await this.call(chain, { module: 'account', action: 'balance', address, tag: 'latest' });
    return parseFloat(wei) / 1e18;
  }
};
