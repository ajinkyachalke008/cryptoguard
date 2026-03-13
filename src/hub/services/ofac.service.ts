// src/hub/services/ofac.service.ts
import { hubFetch } from './hub.fetcher';

export class OFACService {
  private static SDN_URL = 'https://www.treasury.gov/ofac/downloads/sdn.xml';
  private static sanctionedAddresses = new Set<string>();
  private static lastFetched: number | null = null;

  static async loadSanctionsList() {
    // Refresh cache every 24 hours
    if (this.lastFetched && Date.now() - this.lastFetched < 86400000) return;
    
    try {
      // Note: fetching large XML and parsing with regex as specified in prompt
      const res = await fetch(this.SDN_URL);
      const xml = await res.text();
      const regex = /Digital Currency Address - \w+\s*<\/idType>\s*<idNumber>([^<]+)<\/idNumber>/g;
      let match;
      this.sanctionedAddresses.clear();
      while ((match = regex.exec(xml)) !== null) {
        this.sanctionedAddresses.add(match[1].toLowerCase().trim());
      }
      this.lastFetched = Date.now();
    } catch (error) {
      console.error('Failed to load OFAC list:', error);
    }
  }

  static async checkAddress(address: string) {
    await this.loadSanctionsList();
    const isSanctioned = this.sanctionedAddresses.has(address.toLowerCase().trim());
    return {
      address,
      isSanctioned,
      checkedAt: new Date().toISOString(),
      source: 'OFAC SDN'
    };
  }
}
