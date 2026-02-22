import { apiFetch } from "./apiClient";

export const productsService = {
  // GET - Listar todos
  getAll: async () => apiFetch("/products", { method: "GET" }),

  // GET - Buscar por ID
  getById: async (id: number) => apiFetch(`/products/${id}`, { method: "GET" }),

  // POST - Criar produto
  create: async (data: { name: string; stockQuantity: number; categoryId: number; unitValue: number }) =>
    apiFetch("/products", { method: "POST", body: JSON.stringify(data) }),

  // PUT - Atualizar completamente
  update: async (id: number, data: any) =>
    apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // PATCH - Atualizar parcialmente
  partialUpdate: async (id: number, data: any) =>
    apiFetch(`/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // DELETE - Deletar
  delete: async (id: number) => apiFetch(`/products/${id}`, { method: "DELETE" }),
};
