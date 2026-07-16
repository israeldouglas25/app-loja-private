const IS_BROWSER = typeof window !== 'undefined';
const API_BASE_URL = IS_BROWSER
  ? '' // in the browser we hit the Next.js proxy (/api)
  : process.env.BACKEND_URL || 'http://localhost:8080/api/v1';

function readCookie(name: string): string | null {
  if (!IS_BROWSER) return null;

  const cookieValue = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookieValue) return null;

  const [, value] = cookieValue.split('=');
  return value ? decodeURIComponent(value) : null;
}

// pull token either from cookie (preferred) or from localStorage as fallback
async function getToken(): Promise<string | null> {
  if (IS_BROWSER) {
    return readCookie('token') || localStorage.getItem('token');
  }

  // server environment – dynamically import to avoid bundling into client
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies(); // must await, returns a Promise
    return cookieStore?.get('token')?.value || null;
  } catch {
    // not available (edge runtime or import failed)
    return null;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  if (token) {
    console.log(
      '[apiFetch] Token encontrado, adicionando ao header Authorization'
    );
    return { Authorization: `Bearer ${token}` };
  } else {
    console.warn('[apiFetch] Nenhum token encontrado no localStorage/cookies');
    return {};
  }
}

// Check if token has expired
function isTokenExpired(): boolean {
  if (!IS_BROWSER) return false;

  const tokenExpires =
    readCookie('tokenExpires') || localStorage.getItem('tokenExpires');
  if (!tokenExpires) return false;

  return Date.now() > parseInt(tokenExpires, 10);
}

interface ApiError extends Error {
  isTokenExpired?: boolean;
  status?: number;
}

/**
 * Wrapper around fetch that automatically:
 *  - prefixes the correct base URL depending on execution context
 *  - attaches `Content-Type: application/json` when no headers are provided
 *  - appends Authorization header if a token is stored in localStorage
 *  - uses `credentials: 'include'` so cookies are sent if the backend sets them
 *  - checks if token has expired and throws an error if it has
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Check if token has expired before making the request
  if (IS_BROWSER && isTokenExpired()) {
    const error: ApiError = new Error(
      'Sua sessão expirou. Por favor, faça login novamente.'
    );
    error.isTokenExpired = true;
    throw error;
  }

  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : `/api${path}`;

  const dynamicHeaders = await authHeaders();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...dynamicHeaders,
    ...((options.headers as Record<string, string>) || {}),
  };

  const opts: RequestInit = {
    credentials: 'include', // required if you're using cookies
    ...options,
    headers,
  };

  const res = await fetch(url, opts);

  // Handle 401 (Unauthorized) - token is invalid/expired
  if (res.status === 401 && IS_BROWSER) {
    // Token is invalid or expired - clear credentials and redirect
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpires');
    localStorage.removeItem('user');
    document.cookie = 'token=; path=/; max-age=0; sameSite=lax';

    // Redirect to login if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
      return {
        status: res.status,
        message: 'Sessão expirada. Faça login novamente.',
      } as T;
    }
  }

  // Handle 403 (Forbidden) - user doesn't have permission, but token is valid
  // Don't clear token, throw an error so callers can display the proper message.
  if (res.status === 403) {
    const text = await res.text();
    let errorMessage = 'Acesso negado. Você não tem permissão para esta ação.';
    try {
      const json = JSON.parse(text);
      errorMessage = json?.message || errorMessage;
    } catch {}
    const error: ApiError = new Error(errorMessage);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return { status: 204 } as T;

  const text = await res.text();
  const parsed = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === 'object' && 'message' in parsed
        ? parsed.message
        : null) || `Erro ${res.status}`;
    const error: ApiError = new Error(message);
    error.status = res.status;
    throw error;
  }

  if (!parsed) return { status: res.status } as T;
  return parsed as T;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { text };
  }
}
