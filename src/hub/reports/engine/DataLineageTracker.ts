// src/hub/reports/engine/DataLineageTracker.ts
import { DataLineageItem } from '../reports.types';

/**
 * Forensic Data Lineage Tracker
 * Records EVERY API call made during report generation for audit transparency.
 */
export class DataLineageTracker {
  private entries: DataLineageItem[] = [];
  
  record(item: Omit<DataLineageItem, 'timestamp'>) {
    this.entries.push({
      ...item,
      timestamp: new Date().toISOString(),
    });
  }
  
  async wrap<T>(
    dataItem: string,
    sourceAPI: string,
    endpoint: string,
    fn: () => Promise<T>
  ): Promise<T> {
    try {
      const result = await fn();
      this.record({ dataItem, sourceAPI, endpoint, status: 'SUCCESS' });
      return result;
    } catch (err) {
      this.record({ dataItem, sourceAPI, endpoint, status: 'FAILED', error: String(err) });
      throw err;
    }
  }
  
  getAll(): DataLineageItem[] {
    return this.entries;
  }
}
