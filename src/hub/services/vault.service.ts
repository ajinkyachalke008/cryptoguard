// src/hub/services/vault.service.ts
import { IntelligenceDossier } from './investigation.service';

const VAULT_KEY = 'cryptoguard_investigation_vault';

export const VaultService = {
  saveCase(dossier: IntelligenceDossier) {
    if (typeof window === 'undefined') return;
    const existing = this.getCases();
    const updated = [dossier, ...existing.filter(c => c.entity.address !== dossier.entity.address)];
    localStorage.setItem(VAULT_KEY, JSON.stringify(updated.slice(0, 50))); // Cap at 50
  },

  getCases(): IntelligenceDossier[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(VAULT_KEY);
    return data ? JSON.parse(data) : [];
  },

  deleteCase(address: string) {
    if (typeof window === 'undefined') return;
    const existing = this.getCases();
    const updated = existing.filter(c => c.entity.address !== address);
    localStorage.setItem(VAULT_KEY, JSON.stringify(updated));
  }
};
