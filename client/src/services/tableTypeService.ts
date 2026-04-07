import api from './api';

export interface TableType {
  _id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface TableTypePayload {
  code: string;
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export const tableTypeService = {
  async getAll(includeInactive = false): Promise<TableType[]> {
    const { data } = await api.get('/table-types', {
      params: includeInactive ? { includeInactive: true } : {},
    });
    return data.data;
  },

  async create(payload: TableTypePayload): Promise<TableType> {
    const { data } = await api.post('/table-types', payload);
    return data.data;
  },

  async update(id: string, payload: Partial<TableTypePayload>): Promise<TableType> {
    const { data } = await api.put(`/table-types/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/table-types/${id}`);
  },
};
