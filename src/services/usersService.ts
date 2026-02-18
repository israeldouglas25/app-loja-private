// use internal API route for client-side calls to avoid CORS issues. the
// proxy route (/api/users) will forward requests to the actual backend URL.
// server-side (like actions or SSR) can still use BACKEND_URL directly.

const IS_BROWSER = typeof window !== "undefined";
const API_BASE_URL = IS_BROWSER
  ? "" // relative path; service will prepend `/api` below
  : process.env.BACKEND_URL || "http://localhost:8080/api/v1";

export const usersService = {
  // GET - Listar todos
  getAll: async () => {
    const url = API_BASE_URL ? `${API_BASE_URL}/users` : "/api/users";
    const res = await fetch(url, { method: "GET" });
    return res.json();
  },

  // GET - Buscar por ID
  getById: async (id: number) => {
    const base = API_BASE_URL ? `${API_BASE_URL}` : "/api";
    const res = await fetch(`${base}/users/${id}`, { method: "GET" });
    return res.json();
  },

  // POST - Criar usuário
  create: async (data: { name: string; email: string; password: string }) => {
    const base = API_BASE_URL ? `${API_BASE_URL}` : "/api";
    const res = await fetch(`${base}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // PUT - Atualizar completamente
  update: async (id: number, data: any) => {
    const base = API_BASE_URL ? `${API_BASE_URL}` : "/api";
    const res = await fetch(`${base}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // PATCH - Atualizar parcialmente
  partialUpdate: async (id: number, data: any) => {
    const base = API_BASE_URL ? `${API_BASE_URL}` : "/api";
    const res = await fetch(`${base}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // DELETE - Deletar
  delete: async (id: number) => {
    const base = API_BASE_URL ? `${API_BASE_URL}` : "/api";
    const res = await fetch(`${base}/users/${id}`, { method: "DELETE" });
    // backend may return 204 No Content; handle empty response gracefully
    if (res.status === 204) return { status: 204 };
    const text = await res.text();
    if (!text) return { status: res.status };
    try {
      return JSON.parse(text);
    } catch {
      return { status: res.status, text };
    }
  },
};
