import { NextRequest, NextResponse } from 'next/server';

type Period = '7d' | '30d' | '90d';
type Metric = 'risk_score' | 'scans' | 'alerts';

interface DataPoint {
  date: string;
  value: number;
  label: string;
}

interface TrendSummary {
  avg: number;
  min: number;
  max: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  change_percentage: number;
}

interface TrendData {
  period: string;
  metric: string;
  data_points: DataPoint[];
  summary: TrendSummary;
}

function generateDateRange(period: Period): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  
  if (period === '7d') {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
  } else if (period === '30d') {
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date);
    }
  } else if (period === '90d') {
    for (let i = 12; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      dates.push(date);
    }
  }
  
  return dates;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLabel(date: Date, period: Period): string {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  if (period === '7d') {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
  } else if (period === '30d') {
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  } else {
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  }
}

function generateRiskScoreData(dates: Date[], period: Period): number[] {
  const values: number[] = [];
  let baseValue = 45 + Math.random() * 10;
  
  for (let i = 0; i < dates.length; i++) {
    const variation = (Math.random() - 0.5) * 8;
    const trendFactor = (Math.random() - 0.5) * 2;
    baseValue = Math.max(30, Math.min(70, baseValue + variation + trendFactor));
    values.push(Math.round(baseValue * 10) / 10);
  }
  
  return values;
}

function generateScansData(dates: Date[], period: Period): number[] {
  const values: number[] = [];
  let baseValue = period === '7d' ? 20 : 40;
  const growthRate = 1.02;
  
  for (let i = 0; i < dates.length; i++) {
    const variation = (Math.random() - 0.3) * 15;
    const weekendFactor = dates[i].getDay() === 0 || dates[i].getDay() === 6 ? 0.7 : 1;
    baseValue = baseValue * growthRate;
    const value = Math.max(period === '7d' ? 5 : 10, 
                          Math.min(period === '7d' ? 50 : 100, 
                                  (baseValue + variation) * weekendFactor));
    values.push(Math.round(value));
  }
  
  return values;
}

function generateAlertsData(dates: Date[], period: Period): number[] {
  const values: number[] = [];
  const spikeIndices = new Set<number>();
  const numSpikes = Math.floor(dates.length / 7);
  
  for (let i = 0; i < numSpikes; i++) {
    spikeIndices.add(Math.floor(Math.random() * dates.length));
  }
  
  for (let i = 0; i < dates.length; i++) {
    const isSpike = spikeIndices.has(i);
    const baseValue = isSpike ? 12 + Math.random() * 8 : 5 + Math.random() * 7;
    values.push(Math.round(baseValue));
  }
  
  return values;
}

function calculateSummary(values: number[]): TrendSummary {
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  const firstThird = values.slice(0, Math.floor(values.length / 3));
  const lastThird = values.slice(Math.floor(values.length * 2 / 3));
  
  const firstAvg = firstThird.reduce((sum, val) => sum + val, 0) / firstThird.length;
  const lastAvg = lastThird.reduce((sum, val) => sum + val, 0) / lastThird.length;
  
  const change = lastAvg - firstAvg;
  const change_percentage = (change / firstAvg) * 100;
  
  let trend: 'increasing' | 'decreasing' | 'stable';
  if (Math.abs(change_percentage) < 5) {
    trend = 'stable';
  } else if (change_percentage > 0) {
    trend = 'increasing';
  } else {
    trend = 'decreasing';
  }
  
  return {
    avg: Math.round(avg * 100) / 100,
    min: Math.round(min * 100) / 100,
    max: Math.round(max * 100) / 100,
    trend,
    change_percentage: Math.round(change_percentage * 100) / 100
  };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const periodParam = searchParams.get('period') ?? '30d';
    const metricParam = searchParams.get('metric') ?? 'risk_score';
    
    const validPeriods: Period[] = ['7d', '30d', '90d'];
    const validMetrics: Metric[] = ['risk_score', 'scans', 'alerts'];
    
    if (!validPeriods.includes(periodParam as Period)) {
      return NextResponse.json({
        error: 'Invalid period. Must be one of: 7d, 30d, 90d',
        code: 'INVALID_PERIOD'
      }, { status: 400 });
    }
    
    if (!validMetrics.includes(metricParam as Metric)) {
      return NextResponse.json({
        error: 'Invalid metric. Must be one of: risk_score, scans, alerts',
        code: 'INVALID_METRIC'
      }, { status: 400 });
    }
    
    const period = periodParam as Period;
    const metric = metricParam as Metric;
    
    const dates = generateDateRange(period);
    
    let values: number[];
    if (metric === 'risk_score') {
      values = generateRiskScoreData(dates, period);
    } else if (metric === 'scans') {
      values = generateScansData(dates, period);
    } else {
      values = generateAlertsData(dates, period);
    }
    
    const data_points: DataPoint[] = dates.map((date, index) => ({
      date: formatDate(date),
      value: values[index],
      label: formatLabel(date, period)
    }));
    
    const summary = calculateSummary(values);
    
    const trendData: TrendData = {
      period,
      metric,
      data_points,
      summary
    };
    
    return NextResponse.json(trendData, { status: 200 });
    
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 });
  }
}