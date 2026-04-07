import api from './api';

export interface OrderItem {
  _id: string;
  sessionId: string;
  fnbItemId: { _id: string; name: string; price: number } | string;
  quantity: number;
  price: number;
  createdAt: string;
}

export const orderService = {
  async create(sessionId: string, fnbItemId: string, quantity: number): Promise<OrderItem> {
    const { data } = await api.post('/orders', { sessionId, fnbItemId, quantity });
    return data.data;
  },

  async getBySession(sessionId: string): Promise<OrderItem[]> {
    const { data } = await api.get(`/orders/${sessionId}`);
    return data.data;
  },

  async getTotalCost(sessionId: string): Promise<number> {
    const { data } = await api.get(`/orders/${sessionId}/total`);
    return data.data.totalFnbCost;
  },
};
