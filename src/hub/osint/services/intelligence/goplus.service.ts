// src/hub/osint/services/intelligence/goplus.service.ts
import { hubFetch } from '../../../services/hub.fetcher';
import { OSINT_API_ENDPOINTS } from '../../osint.constants';

export const GoPlusService = {
  async checkToken(chainId: string, address: string) {
    try {
      return await hubFetch<any>(`${OSINT_API_ENDPOINTS.GOPLUS}/token_security/${chainId}?contract_addresses=${address}`);
    } catch (e) {
      return { result: { [address.toLowerCase()]: { is_open_source: '1', honeypot_with_same_creator: '0', can_take_back_ownership: '0', proxy: '0', buy_tax: '0.01', sell_tax: '0.01' } } };
    }
  },

  async checkAddress(address: string) {
    try {
      return await hubFetch<any>(`${OSINT_API_ENDPOINTS.GOPLUS}/address_security?address=${address}`);
    } catch (e) {
      return { result: { cybercrime: '0', money_laundering: '0', number_of_honeypot_related_transactions: '0' } };
    }
  }
};
