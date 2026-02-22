import { apiFetch } from "./apiClient";

export const loginService = {
  // POST - login usuário
  login: async (data: { email: string; password: string }) => {
    const response = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify(data),
      // credentials: 'include' already set by apiFetch, useful if backend
      // sets an httpOnly cookie instead of returning the token in JSON.
    });

    /*
      The backend can return either
        { token: '...', user: { ... } }
      or simply rely on a Set-Cookie header.  We handle both cases here.
    */
    if (response && response.token) {
      if (typeof window !== "undefined") {
        localStorage.setItem("token", response.token);
        // mirror token into cookie so that server actions can read it later
        document.cookie = `token=${response.token}; path=/; max-age=${60 * 60 * 24 * 7}; sameSite=lax`;
      }
    }

    return response;
  },
};
