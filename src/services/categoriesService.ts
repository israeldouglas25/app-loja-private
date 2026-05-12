import { apiFetch } from './apiClient';

export interface Category {
  id: number;
  name: string;
}

export type CategoryCreateDto = {
  name: string;
};

export const categoriesService = {
  // GET - Listar todos
  getAll: async () => apiFetch<Category[]>('/categories', { method: 'GET' }),

  // GET - Buscar por ID
  getById: async (id: number) =>
    apiFetch<Category>(`/categories/${id}`, { method: 'GET' }),

  // GET - Buscar por nome via parâmetro
  getByName: async (searchname: string) =>
    apiFetch<Category[]>(
      `/categories/searchname?name=${encodeURIComponent(searchname)}`,
      {
        method: 'GET',
      }
    ),

  // POST - Criar categoria
  create: async (data: CategoryCreateDto) =>
    apiFetch<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // DELETE - Deletar
  delete: async (id: number) => {
    await apiFetch(`/categories/${id}`, { method: 'DELETE' });
  },
};
