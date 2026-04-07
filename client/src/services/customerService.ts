import api from './api';

export interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  totalSpent: number;
  visitCount: number;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const { data } = await api.get('/customers');
    return data.data;
  },

  async getById(id: string): Promise<Customer> {
    const { data } = await api.get(`/customers/${id}`);
    return data.data;
  },

  async getByPhone(phone: string): Promise<Customer> {
    const { data } = await api.get(`/customers/phone/${phone}`);
    return data.data;
  },

  async create(customer: {
    name: string;
    phone: string;
    email?: string;
    membershipTier?: string;
    notes?: string;
  }): Promise<Customer> {
    const { data } = await api.post('/customers', customer);
    return data.data;
  },

  async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    const { data } = await api.put(`/customers/${id}`, updates);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async recordVisit(id: string): Promise<Customer> {
    const { data } = await api.post(`/customers/${id}/visit`);
    return data.data;
  },

  async addPoints(id: string, points: number): Promise<Customer> {
    const { data } = await api.post(`/customers/${id}/points`, { points });
    return data.data;
  },
};
