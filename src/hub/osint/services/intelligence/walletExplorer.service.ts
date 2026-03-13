// src/hub/osint/services/intelligence/walletExplorer.service.ts
import { hubFetch } from '../../../services/hub.fetcher';
import { OSINT_API_ENDPOINTS } from '../../osint.constants';

export const WalletExplorerService = {
  async lookupAddress(address: string) {
    // Note: Official API might require 'caller' param
    return hubFetch<any>(`${OSINT_API_ENDPOINTS.WALLET_EXPLORER}/address?address=${address}&caller=cryptoguard`);
  }
};
