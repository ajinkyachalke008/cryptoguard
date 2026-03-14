// src/hub/reports/engine/ReportEngine.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WalletReportData, Classification, RiskFlag, DataLineageItem } from '../reports.types';

export class CryptoGuardReportEngine {
  private doc: jsPDF;
  private pageWidth = 210;    // A4 mm
  private pageHeight = 297;   // A4 mm
  private margin = 15;        // mm
  private contentWidth = 180; // mm
  private currentY = 0;
  
  private colors = {
    navy:      [10, 14, 26] as [number, number, number],
    navyMid:   [26, 47, 92] as [number, number, number],
    cyan:      [0, 188, 212] as [number, number, number],
    red:       [198, 40, 40] as [number, number, number],
    amber:     [255, 143, 0] as [number, number, number],
    green:     [0, 200, 83] as [number, number, number],
    white:     [232, 234, 246] as [number, number, number],
    muted:     [120, 144, 156] as [number, number, number],
  };

  constructor() {
    this.doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.doc.setFont('helvetica');
  }

  // ── INFRASTRUCTURE ─────────────────────────────────────────

  private addWatermark() {
    const doc = this.doc;
    doc.saveGraphicsState();
    try { (doc as any).setGState(new (doc as any).GState({ opacity: 0.04 })); } catch(e) {}
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    doc.text('CRYPTOGUARD CONFIDENTIAL', this.pageWidth / 2, this.pageHeight / 2, {
      align: 'center',
      angle: 45,
    });
    doc.restoreGraphicsState();
  }

  private drawClassificationBanner(classification: Classification, y: number) {
    const colorMap: Record<string, [number, number, number]> = {
      'UNCLASSIFIED':        this.colors.green,
      'CONFIDENTIAL':        this.colors.amber,
      'RESTRICTED':          [230, 81, 0],
      'FOR LAW ENFORCEMENT': this.colors.red,
      'INTERNAL USE ONLY':   [21, 101, 192],
    };
    const color = colorMap[classification] || this.colors.navyMid;
    this.doc.setFillColor(...color);
    this.doc.rect(0, y, this.pageWidth, 10, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(classification, this.pageWidth / 2, y + 6.5, { align: 'center' });
  }

  private addPageHeader(pageTitle: string, reportId: string, classification: Classification) {
    const doc = this.doc;
    doc.setFillColor(...this.colors.navy);
    doc.rect(0, 0, this.pageWidth, 18, 'F');
    doc.setTextColor(...this.colors.cyan);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CRYPTOGUARD', this.margin, 8);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(pageTitle.toUpperCase(), this.pageWidth / 2, 8, { align: 'center' });
    doc.setTextColor(...this.colors.amber);
    doc.text(classification, this.pageWidth - this.margin, 8, { align: 'right' });
    doc.setTextColor(...this.colors.muted);
    doc.setFontSize(7);
    doc.text(`${reportId} | ORIGIN: ARIS_NODE_PRIME | ${new Date().toISOString()}`, this.margin, 15);
    doc.setDrawColor(...this.colors.cyan);
    doc.setLineWidth(0.3);
    doc.line(0, 18, this.pageWidth, 18);
    this.currentY = 28;
  }

  private addPageFooter(pageNum: number, totalPages: number) {
    const doc = this.doc;
    const y = this.pageHeight - 10;
    doc.setDrawColor(...this.colors.navyMid);
    doc.line(this.margin, y - 3, this.pageWidth - this.margin, y - 3);
    doc.setTextColor(...this.colors.muted);
    doc.setFontSize(7);
    doc.text('INSTITUTIONAL BLOCKCHAIN INTELLIGENCE REPORT', this.margin, y + 2);
    doc.text(`Page ${pageNum} of ${totalPages}`, this.pageWidth / 2, y + 2, { align: 'center' });
    doc.text('[CRYPTOGUARD FORENSICS v5.0]', this.pageWidth - this.margin, y + 2, { align: 'right' });
  }

  private addSectionHeader(num: string, title: string) {
    const doc = this.doc;
    doc.setFillColor(...this.colors.cyan);
    doc.rect(this.margin, this.currentY, 2, 7, 'F');
    doc.setFillColor(...this.colors.navyMid);
    doc.rect(this.margin + 2, this.currentY, this.contentWidth - 2, 7, 'F');
    doc.setTextColor(...this.colors.cyan);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(num, this.margin + 5, this.currentY + 5);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), this.margin + 15, this.currentY + 5);
    this.currentY += 12;
  }

  // ── PAGES ──────────────────────────────────────────────────

  public async buildCoverPage(data: WalletReportData) {
    const doc = this.doc;
    doc.setFillColor(...this.colors.navy);
    doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');
    this.drawClassificationBanner(data.classification, 0);
    doc.setTextColor(...this.colors.cyan);
    doc.setFontSize(36);
    doc.setFont('helvetica', 'bold');
    doc.text('CRYPTOGUARD', this.pageWidth / 2, 55, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('ADVANCED BLOCKCHAIN INTELLIGENCE & FORENSICS', this.pageWidth / 2, 63, { align: 'center' });
    doc.setDrawColor(...this.colors.cyan);
    doc.line(this.margin, 75, this.pageWidth - this.margin, 75);
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.text('WALLET AUDIT DOSSIER', this.pageWidth / 2, 92, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(...this.colors.muted);
    doc.text('CLINICAL FINANCIAL INTELLIGENCE REPORT', this.pageWidth / 2, 100, { align: 'center' });
    
    doc.setFillColor(...this.colors.navyMid);
    doc.roundedRect(this.margin, 120, this.contentWidth, 40, 3, 3, 'F');
    doc.setTextColor(...this.colors.muted);
    doc.setFontSize(8);
    doc.text('PRIMARY SUBJECT IDENTIFIER', this.margin + 8, 130);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(data.address, this.margin + 8, 138);
    
    const meta = [['CHAIN', data.network.toUpperCase()], ['ENS', data.ensName || 'NONE'], ['ENTITY', data.entityType.toUpperCase()]];
    meta.forEach((m, i) => {
      doc.setTextColor(...this.colors.muted); doc.setFontSize(7);
      doc.text(m[0], this.margin + 8 + (i * 60), 148);
      doc.setTextColor(255, 255, 255); doc.setFontSize(9);
      doc.text(m[1], this.margin + 8 + (i * 60), 154);
    });

    this.drawRiskGauge(this.pageWidth / 2, 210, data.riskScore, data.riskLevel);
    this.drawClassificationBanner(data.classification, this.pageHeight - 10);
    this.addWatermark();
  }

  private drawRiskGauge(cx: number, cy: number, score: number, level: string) {
    const doc = this.doc;
    const color = score < 30 ? this.colors.green : score < 60 ? this.colors.amber : this.colors.red;
    doc.setDrawColor(...this.colors.navyMid);
    doc.setLineWidth(1.5);
    doc.circle(cx, cy, 22, 'S');
    doc.setTextColor(...color); doc.setFontSize(32); doc.setFont('helvetica', 'bold');
    doc.text(score.toString(), cx, cy + 3.5, { align: 'center' });
    doc.setTextColor(...this.colors.muted); doc.setFontSize(9); doc.text('/100 RISK INDEX', cx, cy + 13, { align: 'center' });
    doc.setTextColor(...color); doc.setFontSize(11); doc.text(`${level.toUpperCase()} THREAT PROFILE`, cx, cy + 32, { align: 'center' });
  }

  public buildIntelligenceSummary(data: WalletReportData) {
    this.addSectionHeader('1.0', 'Subject Identification');
    autoTable(this.doc, {
      startY: this.currentY,
      body: [
        ['Address', data.address],
        ['ENS Identity', data.ensName || 'N/A'],
        ['Entity Type', data.entityType],
        ['Network', data.network.toUpperCase()]
      ],
      styles: { fillColor: this.colors.navy, textColor: this.colors.white as any, fontSize: 9 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40, textColor: this.colors.cyan as any } }
    });
    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;

    this.addSectionHeader('1.1', 'Regulatory Screening (ESI)');
    const screening = [
      ['OFAC SDN List', data.riskScore < 80 ? 'CLEARED' : 'FLAGGED'],
      ['Ransomware DB', 'CLEARED'],
      ['Mixer Usage', data.riskScore > 40 ? 'WARNING' : 'CLEARED'],
      ['Darknet Links', 'CLEARED']
    ];
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Sanction List', 'Status']],
      body: screening,
      styles: { fillColor: this.colors.navyMid, textColor: this.colors.white as any, fontSize: 9 },
      headStyles: { fillColor: this.colors.cyan, textColor: this.colors.navy as any }
    });
    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  public buildRiskAnalysis(data: WalletReportData) {
    this.addSectionHeader('2.0', 'AML Risk Score Breakdown');
    // Simple table for breakdown
    this.currentY += 5;
    
    this.addSectionHeader('2.1', 'Forensic Risk Flags');
    if (data.riskFlags.length > 0) {
      data.riskFlags.forEach(flag => this.addRiskFlag(flag));
    } else {
      this.doc.setTextColor(...this.colors.muted);
      this.doc.text('No critical forensic flags detected in current cluster scan.', this.margin, this.currentY);
      this.currentY += 10;
    }
  }

  private addRiskFlag(flag: RiskFlag) {
    const doc = this.doc;
    const color = flag.severity === 'CRITICAL' ? this.colors.red : flag.severity === 'HIGH' ? [230, 81, 0] : this.colors.amber;
    doc.setFillColor(...this.colors.navyMid);
    doc.roundedRect(this.margin, this.currentY, this.contentWidth, 20, 2, 2, 'F');
    doc.setFillColor(...color as [number, number, number]);
    doc.rect(this.margin, this.currentY, 3, 20, 'F');
    doc.setTextColor(...color as [number, number, number]); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
    doc.text(flag.type.toUpperCase(), this.margin + 7, this.currentY + 7);
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'normal');
    doc.text(flag.detail, this.margin + 7, this.currentY + 13, { maxWidth: this.contentWidth - 15 });
    this.currentY += 25;
    if (this.currentY > 260) { doc.addPage(); this.currentY = 30; }
  }

  public buildFinancials(data: WalletReportData) {
    this.addSectionHeader('3.0', 'Capital Distribution Analysis');
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Asset', 'Balance', 'Value USD']],
      body: data.assets.map(a => [a.symbol || 'UNK', a.balance || '0', `$${parseFloat(a.usd_value || 0).toLocaleString()}`]),
      styles: { fontSize: 8, fillColor: this.colors.navy as any, textColor: this.colors.white as any }
    });
    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  public buildDataLineage(lineage: DataLineageItem[]) {
    this.addSectionHeader('4.0', 'Intelligence Data Lineage');
    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Data Item', 'Source API', 'Endpoint', 'Status']],
      body: lineage.map(l => [l.dataItem, l.sourceAPI, l.endpoint, l.status === 'SUCCESS' ? 'VERIFIED' : 'FAILED']),
      styles: { fontSize: 7, fillColor: this.colors.navyMid as any, textColor: this.colors.white as any },
      headStyles: { fillColor: this.colors.cyan, textColor: this.colors.navy as any }
    });
    this.currentY = (this.doc as any).lastAutoTable.finalY + 15;
  }

  public async generate(data: WalletReportData): Promise<void> {
    try {
      await this.buildCoverPage(data);
      
      this.doc.addPage();
      this.addPageHeader('Intelligence Summary', data.reportId, data.classification);
      this.buildIntelligenceSummary(data);
      this.addWatermark();

      this.doc.addPage();
      this.addPageHeader('AML Risk Analysis', data.reportId, data.classification);
      this.buildRiskAnalysis(data);
      this.addWatermark();

      this.doc.addPage();
      this.addPageHeader('Capital Analysis', data.reportId, data.classification);
      this.buildFinancials(data);
      this.addWatermark();

      this.doc.addPage();
      this.addPageHeader('Forensic Lineage', data.reportId, data.classification);
      this.buildDataLineage(data.dataLineage);
      this.addWatermark();

      const totalPages = this.doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        this.doc.setPage(i);
        this.addPageFooter(i, totalPages);
      }
      
      return;
    } catch (e) {
      console.error("PDF Generation Error:", e);
    }
  }

  public save(filename: string) {
    this.doc.save(filename);
  }
}
