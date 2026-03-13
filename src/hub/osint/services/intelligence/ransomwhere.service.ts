// src/hub/osint/services/intelligence/ransomwhere.service.ts
import { hubFetch } from '../../../services/hub.fetcher';
import { OSINT_API_ENDPOINTS } from '../../osint.constants';

export const RansomwhereService = {
  async getFeed() {
    return hubFetch<any>(`${OSINT_API_ENDPOINTS.RANSOMWHERE}/feed`);
  }
};
