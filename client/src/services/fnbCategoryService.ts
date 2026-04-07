import api from './api';

export interface FnbCategory {
  _id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface FnbCategoryPayload {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const fnbCategoryService = {
  async getAll(includeInactive = false): Promise<FnbCategory[]> {
    const { data } = await api.get('/fnb-categories', {
      params: includeInactive ? { includeInactive: true } : {},
    });
    return data.data;
  },

  async create(payload: FnbCategoryPayload): Promise<FnbCategory> {
    const { data } = await api.post('/fnb-categories', payload);
    return data.data;
  },

  async update(id: string, payload: Partial<FnbCategoryPayload>): Promise<FnbCategory> {
    const { data } = await api.put(`/fnb-categories/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/fnb-categories/${id}`);
  },
};
