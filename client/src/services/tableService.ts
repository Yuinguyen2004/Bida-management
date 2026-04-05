import api from './api';

export interface Table {
  _id: string;
  tableNumber: number;
  name: string;
  type: string;
  pricePerHour: number;
  status: 'available' | 'playing' | 'maintenance';
  position?: { 
    row?: number; 
    col?: number; 
    x?: number; 
    y?: number; 
  };
}

export const tableService = {
  async getAll(): Promise<Table[]> {
    const { data } = await api.get('/tables');
    return data.data;
  },

  async getById(id: string): Promise<Table> {
    const { data } = await api.get(`/tables/${id}`);
    return data.data;
  },

  async create(table: Omit<Table, '_id'>): Promise<Table> {
    const { data } = await api.post('/tables', table);
    return data.data;
  },

  async update(id: string, updates: Partial<Table>): Promise<Table> {
    const { data } = await api.put(`/tables/${id}`, updates);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tables/${id}`);
  },
};
