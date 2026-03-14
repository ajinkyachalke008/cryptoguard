// src/hub/reports/engine/ReportIdGenerator.ts

export const ReportIdGenerator = {
  generate(type: 'WALLET' | 'TOKEN' | 'INVESTIGATION'): string {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `CGR-${year}-${random}-${type.toUpperCase()}`;
  }
};
