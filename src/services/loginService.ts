const API_BASE_URL = process.env.BACKEND_URL;

export const loginService = {
  // POST - login usuário
  login: async (data: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
