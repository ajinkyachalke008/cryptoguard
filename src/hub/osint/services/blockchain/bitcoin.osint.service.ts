// src/hub/osint/services/blockchain/bitcoin.osint.service.ts
import { hubFetch } from '../../../services/hub.fetcher';
import { OSINT_API_ENDPOINTS } from '../../osint.constants';

export const BitcoinOSINTService = {
  async getAddressStats(address: string) {
    return hubFetch<any>(`${OSINT_API_ENDPOINTS.BLOCKSTREAM}/address/${address}`);
  },

  async getTransactions(address: string) {
    return hubFetch<any[]>(`${OSINT_API_ENDPOINTS.BLOCKSTREAM}/address/${address}/txs`);
  },

  async getTransaction(txid: string) {
    return hubFetch<any>(`${OSINT_API_ENDPOINTS.BLOCKSTREAM}/tx/${txid}`);
  },

  async getOutspends(txid: string) {
    return hubFetch<any[]>(`${OSINT_API_ENDPOINTS.BLOCKSTREAM}/tx/${txid}/outspends`);
  }
};
