import api from './api';

export interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  role: 'admin' | 'staff';
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/login', { username, password });
    return data.data;
  },

  async register(username: string, password: string, fullName: string, role: string = 'staff', email?: string): Promise<AuthResponse> {
    const { data } = await api.post('/auth/register', { username, password, fullName, role, email });
    return data.data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get('/auth/me');
    return data.data;
  },
};
