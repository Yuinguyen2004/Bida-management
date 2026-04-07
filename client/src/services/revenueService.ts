import api from './api';

export interface DailyRevenue {
  date: string;
  totalRevenue: number;
  totalTableCost: number;
  totalFnbCost: number;
  sessionCount: number;
}

export interface MonthlyRevenue {
  month: number;
  year: number;
  totalRevenue: number;
  totalTableCost: number;
  totalFnbCost: number;
  sessionCount: number;
  averagePerDay: number;
  dailyBreakdown: { day: number; revenue: number; sessionCount: number }[];
}

export interface RevenueSummary {
  totalRevenue: number;
  totalTableCost: number;
  totalFnbCost: number;
  sessionCount: number;
  topTables: { tableId: string; name: string; type: string; usageCount: number; totalRevenue: number }[];
  topFnb: { fnbItemId: string; name: string; category: string; totalQuantity: number; totalRevenue: number }[];
}

export const revenueService = {
  async getDaily(date?: string): Promise<DailyRevenue> {
    const { data } = await api.get('/revenue/daily', { params: date ? { date } : {} });
    return data.data;
  },

  async getMonthly(month?: number, year?: number): Promise<MonthlyRevenue> {
    const { data } = await api.get('/revenue/monthly', { params: { month, year } });
    return data.data;
  },

  async getSummary(): Promise<RevenueSummary> {
    const { data } = await api.get('/revenue/summary');
    return data.data;
  },
};
