import api from './api';

export interface FnbItem {
  _id: string;
  name: string;
  category: string;
  categoryLabel?: string;
  price: number;
  image?: string;
  isAvailable: boolean;
}

export const fnbService = {
  async getAll(): Promise<FnbItem[]> {
    const { data } = await api.get('/fnb');
    return data.data;
  },

  async getById(id: string): Promise<FnbItem> {
    const { data } = await api.get(`/fnb/${id}`);
    return data.data;
  },

  async create(item: Omit<FnbItem, '_id'>): Promise<FnbItem> {
    const { data } = await api.post('/fnb', item);
    return data.data;
  },

  async update(id: string, updates: Partial<FnbItem>): Promise<FnbItem> {
    const { data } = await api.put(`/fnb/${id}`, updates);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/fnb/${id}`);
  },
};
