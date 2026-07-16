import { apiFetch } from './apiClient';

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  name: string;
  expiresIn: number;
  id?: number;
}

const AUTH_KEYS = {
  token: 'token',
  tokenExpires: 'tokenExpires',
  user: 'user',
};

interface StoredUser {
  name?: string;
  id?: number;
  roles?: string[];
}

export function getRolesFromToken(token: string): string[] {
  const payload = decodeJwtPayload(token);
  if (!payload) return [];

  const roles = new Set<string>();
  const payloadRoles = payload.roles;
  const payloadAuthorities = payload.authorities;
  const payloadRole = payload.role;

  if (Array.isArray(payloadRoles)) {
    payloadRoles.forEach((role) => {
      if (typeof role === 'string') roles.add(role);
    });
  }

  if (Array.isArray(payloadAuthorities)) {
    payloadAuthorities.forEach((authority) => {
      if (typeof authority === 'string') roles.add(authority);
    });
  }

  if (typeof payloadRole === 'string') {
    roles.add(payloadRole);
  }

  return Array.from(roles);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const normalized = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const decoded = globalThis.atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function extractRolesFromToken(token: string): string[] {
  return getRolesFromToken(token);
}

function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;

  const item = localStorage.getItem(AUTH_KEYS.user);
  if (!item) return null;

  try {
    return JSON.parse(item) as StoredUser;
  } catch {
    return null;
  }
}

export const loginService = {
  clearAuthState: () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(AUTH_KEYS.token);
    localStorage.removeItem(AUTH_KEYS.tokenExpires);
    localStorage.removeItem(AUTH_KEYS.user);

    document.cookie = 'token=; path=/; max-age=0; sameSite=lax';
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'token=; path=/; max-age=0;';

    try {
      if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
        navigator.sendBeacon('/api/logout', JSON.stringify({}));
      }
    } catch (error) {
      console.warn('Erro ao enviar logout no unload:', error);
    }
  },

  getStoredUser: () => getStoredUser(),

  getRoles: (): string[] => {
    if (typeof window === 'undefined') return [];

    const storedUser = getStoredUser();
    if (storedUser?.roles?.length) {
      return storedUser.roles;
    }

    const token = localStorage.getItem(AUTH_KEYS.token);
    if (!token) return [];

    return extractRolesFromToken(token);
  },

  isAdmin: (): boolean => {
    return loginService
      .getRoles()
      .some((role) => role === 'ROLE_ADMIN' || role === 'ADMIN');
  },

  // POST - login usuário
  login: async (data: { email: string; password: string }) => {
    const response = await apiFetch<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(data),
      // credentials: 'include' already set by apiFetch, useful if backend
      // sets an httpOnly cookie instead of returning the token in JSON.
    });

    /*
      The backend returns
        { accessToken: '...', tokenType: '...', name: '...', expiresIn: ... }
    */
    if (response && response.accessToken) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_KEYS.token, response.accessToken);
        // Store the expiration timestamp
        const expiresAt = Date.now() + response.expiresIn * 1000;
        localStorage.setItem(AUTH_KEYS.tokenExpires, expiresAt.toString());
        // Store user name
        const roles = getRolesFromToken(response.accessToken);
        localStorage.setItem(
          AUTH_KEYS.user,
          JSON.stringify({ name: response.name, id: response.id, roles })
        );
        // mirror token into cookie so that server actions can read it later
        document.cookie = `token=${response.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; sameSite=lax`;
      }
    }

    return response;
  },

  // Check if token has expired
  isTokenExpired: (): boolean => {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem(AUTH_KEYS.token);
    const tokenExpires = localStorage.getItem(AUTH_KEYS.tokenExpires);

    if (!token || !tokenExpires) return true;

    return Date.now() > parseInt(tokenExpires, 10);
  },

  // Get expiration message if token is expired
  getExpirationMessage: (): string | null => {
    if (loginService.isTokenExpired()) {
      return 'Sua sessão expirou. Por favor, faça login novamente.';
    }
    return null;
  },

  // Clear token and timestamp
  logout: async () => {
    if (typeof window !== 'undefined') {
      loginService.clearAuthState();

      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Send cookies to server
        });

        if (response.ok) {
          console.log('Cookie httpOnly removido do servidor');
        } else {
          console.warn('Falha ao remover cookie do servidor:', response.status);
        }
      } catch (error) {
        console.warn('Erro ao chamar endpoint de logout:', error);
      }

      // Dispatch event to notify components of logout
      window.dispatchEvent(new Event('userChanged'));

      console.log(
        'Logout realizado: token e dados do usuário removidos completamente'
      );
    }
  },
};
