import { apiFetch } from './apiClient';

export interface Product {
  id: number;
  name: string;
  stockQuantity: number;
  categoryId: number;
  category: string;
  unitValue: number;
}

export type ProductCreateDto = {
  name: string;
  stockQuantity: number;
  categoryId: number;
  unitValue: number;
};

export const productsService = {
  // GET - Listar todos
  getAll: async () => apiFetch<Product[]>('/products', { method: 'GET' }),

  // GET - Buscar por ID
  getById: async (id: number) =>
    apiFetch<Product>(`/products/${id}`, { method: 'GET' }),

  // POST - Criar produto
  create: async (data: ProductCreateDto) =>
    apiFetch<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT - Atualizar completamente (também aceita dados parciais para compatibilidade com GenericTable)
  update: async (id: number, data: Partial<Product>) => {
    await apiFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // PATCH - Atualizar parcialmente
  partialUpdate: async (id: number, data: Partial<Product>) => {
    await apiFetch(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // DELETE - Deletar
  delete: async (id: number) => {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
  },
};
