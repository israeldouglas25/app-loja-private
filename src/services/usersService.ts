import { apiFetch } from "./apiClient";

export const usersService = {
  // GET - Listar todos
  getAll: async () => apiFetch("/users", { method: "GET" }),

  // GET - Buscar por ID
  getById: async (id: number) => apiFetch(`/users/${id}`, { method: "GET" }),

  // POST - Criar usuário
  create: async (data: { name: string; email: string; password: string }) =>
    apiFetch("/users", { method: "POST", body: JSON.stringify(data) }),

  // PUT - Atualizar completamente
  update: async (id: number, data: any) =>
    apiFetch(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // PATCH - Atualizar parcialmente
  partialUpdate: async (id: number, data: any) =>
    apiFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  // DELETE - Deletar
  delete: async (id: number) => apiFetch(`/users/${id}`, { method: "DELETE" }),
};
