// src/hub/services/theGraph.service.ts
import { hubFetch } from './hub.fetcher';

export const TheGraphService = {
  async query(subgraph: string, gql: string, variables = {}) {
    const url = `https://api.thegraph.com/subgraphs/name/${subgraph}`;
    const res = await hubFetch<any>(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: gql, variables }),
    });
    const { data, errors } = res;
    if (errors) throw new Error(JSON.stringify(errors));
    return data;
  },

  async getUniswapTopPools(limit = 20) {
    return this.query('uniswap/uniswap-v3', `{
      pools(first: ${limit}, orderBy: volumeUSD, orderDirection: desc,
        where: { volumeUSD_gt: "100000" }) {
        id feeTier volumeUSD txCount totalValueLockedUSD
        token0 { symbol } token1 { symbol }
      }
    }`);
  },

  async getAaveLargeBorrows() {
    return this.query('aave/protocol-v2', `{
      users(first: 20, where: { borrowedReservesCount_gt: 0 }
        orderBy: totalBorrowsUSD, orderDirection: desc) {
        id totalBorrowsUSD totalCollateralUSD healthFactor
      }
    }`);
  }
};
