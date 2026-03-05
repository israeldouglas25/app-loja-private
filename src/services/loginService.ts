import { apiFetch } from "./apiClient";

const TOKEN_VALIDITY_MS = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
const TOKEN_TIMESTAMP_KEY = "tokenTimestamp";

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
        // Store the timestamp when token was created
        localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
        // mirror token into cookie so that server actions can read it later
        document.cookie = `token=${response.token}; path=/; max-age=${60 * 60 * 24 * 7}; sameSite=lax`;
      }
    }

    return response;
  },

  // Check if token has expired (12 hours)
  isTokenExpired: (): boolean => {
    if (typeof window === "undefined") return false;
    
    const token = localStorage.getItem("token");
    const tokenTimestamp = localStorage.getItem(TOKEN_TIMESTAMP_KEY);
    
    if (!token || !tokenTimestamp) return true;
    
    const now = Date.now();
    const createdAt = parseInt(tokenTimestamp, 10);
    const elapsed = now - createdAt;
    
    return elapsed > TOKEN_VALIDITY_MS;
  },

  // Get expiration message if token is expired
  getExpirationMessage: (): string | null => {
    if (loginService.isTokenExpired()) {
      return "Sua sessão expirou. Por favor, faça login novamente.";
    }
    return null;
  },

  // Clear token and timestamp
  logout: async () => {
    if (typeof window !== "undefined") {
      // Step 1: Remove token from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem(TOKEN_TIMESTAMP_KEY);
      
      // Step 2: Remove user data
      localStorage.removeItem("user");
      
      // Step 3: Clear all cookies related to authentication using multiple methods
      // Method 1: Clear with max-age=0
      document.cookie = "token=; path=/; max-age=0; sameSite=lax";
      
      // Method 2: Clear with expires in the past
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      
      // Method 3: Clear without sameSite (in case it was set differently)
      document.cookie = "token=; path=/; max-age=0;";
      
      // Method 4: Call server endpoint to clear httpOnly cookie
      try {
        const response = await fetch("/api/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Send cookies to server
        });
        
        if (response.ok) {
          console.log("Cookie httpOnly removido do servidor");
        } else {
          console.warn("Falha ao remover cookie do servidor:", response.status);
        }
      } catch (error) {
        console.warn("Erro ao chamar endpoint de logout:", error);
      }
      
      // Dispatch event to notify components of logout
      window.dispatchEvent(new Event("userChanged"));
      
      console.log("Logout realizado: token e dados do usuário removidos completamente");
    }
  },
};
