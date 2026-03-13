// src/hub/osint/services/intelligence/goplus.service.ts
import { hubFetch } from '../../../services/hub.fetcher';
import { OSINT_API_ENDPOINTS } from '../../osint.constants';

export const GoPlusService = {
  async checkToken(chainId: string, address: string) {
    return hubFetch<any>(`${OSINT_API_ENDPOINTS.GOPLUS}/token_security/${chainId}?contract_addresses=${address}`);
  },

  async checkAddress(address: string) {
    return hubFetch<any>(`${OSINT_API_ENDPOINTS.GOPLUS}/address_security?address=${address}`);
  }
};
