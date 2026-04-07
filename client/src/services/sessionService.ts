import api from './api';

export interface Session {
  _id: string;
  tableId: { _id: string; name: string; type: string; pricePerHour: number } | string;
  staffId: string;
  customerId?: { _id: string; name: string; phone: string; membershipTier: string } | string | null;
  startTime: string;
  endTime?: string;
  duration?: number;
  totalTableCost?: number;
  totalFnbCost?: number;
  discountPercent?: number;
  discountAmount?: number;
  totalAmount?: number;
  status: 'active' | 'completed';
}

export const sessionService = {
  async start(tableId: string, customerId?: string): Promise<Session> {
    const { data } = await api.post('/sessions/start', { tableId, customerId });
    return data.data;
  },

  async end(sessionId: string): Promise<Session> {
    const { data } = await api.post(`/sessions/${sessionId}/end`);
    return data.data;
  },

  async getById(id: string): Promise<Session & { orders: unknown[] }> {
    const { data } = await api.get(`/sessions/${id}`);
    return data.data;
  },

  async getAll(params?: { status?: string; date?: string }): Promise<Session[]> {
    const { data } = await api.get('/sessions', { params });
    return data.data;
  },
};
