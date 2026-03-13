// src/hub/osint/services/blockchain/ethereum.osint.service.ts
import { hubFetch } from '../../../services/hub.fetcher';
import { OSINT_API_ENDPOINTS } from '../../osint.constants';

const ETHERSCAN_KEY = process.env.HUB_OSINT_ETHERSCAN_KEY || '';

export const EthereumOSINTService = {
  async getTxList(address: string) {
    return hubFetch<any>(`${OSINT_API_ENDPOINTS.ETHERSCAN}?module=account&action=txlist&address=${address}&sort=desc&apikey=${ETHERSCAN_KEY}`);
  },

  async getInternalTx(address: string) {
    return hubFetch<any>(`${OSINT_API_ENDPOINTS.ETHERSCAN}?module=account&action=txlistinternal&address=${address}&sort=desc&apikey=${ETHERSCAN_KEY}`);
  },

  async getERC20Transfers(address: string) {
    return hubFetch<any>(`${OSINT_API_ENDPOINTS.ETHERSCAN}?module=account&action=tokentx&address=${address}&sort=desc&apikey=${ETHERSCAN_KEY}`);
  },

  async getContractSource(address: string) {
    return hubFetch<any>(`${OSINT_API_ENDPOINTS.ETHERSCAN}?module=contract&action=getsourcecode&address=${address}&apikey=${ETHERSCAN_KEY}`);
  }
};
