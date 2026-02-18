const API_BASE_URL = process.env.BACKEND_URL;

export const usersService = {
  // GET - Listar todos
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/users`, { method: "GET" });
    return res.json();
  },

  // GET - Buscar por ID
  getById: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: "GET" });
    return res.json();
  },

  // POST - Criar usuário
  create: async (data: { name: string; email: string; password: string }) => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // PUT - Atualizar completamente
  update: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // PATCH - Atualizar parcialmente
  partialUpdate: async (id: number, data: any) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // DELETE - Deletar
  delete: async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: "DELETE" });
    return res.json();
  },
};
