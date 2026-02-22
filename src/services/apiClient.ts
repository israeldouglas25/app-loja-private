const IS_BROWSER = typeof window !== "undefined";
const API_BASE_URL = IS_BROWSER
  ? "" // in the browser we hit the Next.js proxy (/api)
  : process.env.BACKEND_URL || "http://localhost:8080/api/v1";

// pull token either from localStorage (client) or from a Next.js cookie
async function getToken(): Promise<string | null> {
  if (IS_BROWSER) {
    return localStorage.getItem("token");
  }

  // server environment – dynamically import to avoid bundling into client
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies(); // must await, returns a Promise
    return cookieStore?.get("token")?.value || null;
  } catch {
    // not available (edge runtime or import failed)
    return null;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Wrapper around fetch that automatically:
 *  - prefixes the correct base URL depending on execution context
 *  - attaches `Content-Type: application/json` when no headers are provided
 *  - appends Authorization header if a token is stored in localStorage
 *  - uses `credentials: 'include'` so cookies are sent if the backend sets them
 */
export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : `/api${path}`;

  const dynamicHeaders = await authHeaders();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...dynamicHeaders,
    ...((options.headers as Record<string, string>) || {}),
  };

  const opts: RequestInit = {
    credentials: "include", // required if you're using cookies
    ...options,
    headers,
  };

  const res = await fetch(url, opts);

  // you may want to handle 401/403 globally here
  if (res.status === 204) return { status: 204 };
  const text = await res.text();
  if (!text) return { status: res.status };
  try {
    return JSON.parse(text);
  } catch {
    return { status: res.status, text };
  }
}
