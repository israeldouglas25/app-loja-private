import { apiFetch } from './apiClient';

export type Role = 'ROLE_ADMIN' | 'ROLE_USER';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export type UserCreateDto = {
  name: string;
  email: string;
  password: string;
  role?: Role;
};

export const usersService = {
  // GET - Listar todos
  getAll: async () => apiFetch<User[]>('/users', { method: 'GET' }),

  // GET - Buscar por ID
  getById: async (id: number) =>
    apiFetch<User>(`/users/${id}`, { method: 'GET' }),

  // POST - Criar usuário
  create: async (data: UserCreateDto) =>
    apiFetch<User>('/users', { method: 'POST', body: JSON.stringify(data) }),

  // PUT - Atualizar completamente
  update: async (id: number, data: Partial<User>) => {
    await apiFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE - Deletar
  delete: async (id: number) => {
    await apiFetch(`/users/${id}`, { method: 'DELETE' });
  },
};
