// middleware.ts (na raiz do projeto, mesmo nível de package.json)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* ---------- JWT ---------- */

interface JwtPayload {
  role?: string;
  roles?: string[];
  authorities?: string[];
  exp?: number; // segundos
  sub?: string;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const decoded = Buffer.from(padded, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function extractRoles(payload: JwtPayload | null): string[] {
  if (!payload) return [];
  const out = new Set<string>();
  if (Array.isArray(payload.roles)) payload.roles.forEach((r) => out.add(r));
  if (Array.isArray(payload.authorities))
    payload.authorities.forEach((r) => out.add(r));
  if (typeof payload.role === 'string') out.add(payload.role);
  return [...out];
}

function isExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
}

/* ---------- Regras (espelham o Spring Security) ---------- */

interface PermissionRule {
  methods?: string[]; // undefined = qualquer método
  path: string; // prefixo
  roles?: string[]; // undefined = permitAll
}

const permissionRules: PermissionRule[] = [
  // públicos
  { path: '/api/orders' },

  // users
  {
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    path: '/api/users',
    roles: ['ROLE_ADMIN'],
  },

  // products
  {
    methods: ['POST', 'PUT', 'DELETE'],
    path: '/api/products',
    roles: ['ROLE_ADMIN'],
  },
  {
    methods: ['GET'],
    path: '/api/products',
    roles: ['ROLE_USER', 'ROLE_ADMIN'],
  },

  // páginas
  { path: '/products', roles: ['ROLE_USER', 'ROLE_ADMIN'] },
  { path: '/users', roles: ['ROLE_ADMIN'] },
];

function hasAccess(roles: string[], pathname: string, method: string): boolean {
  for (const rule of permissionRules) {
    if (!pathname.startsWith(rule.path)) continue;
    if (rule.methods && !rule.methods.includes(method)) continue;
    if (!rule.roles) return true; // permitAll
    return roles.some((r) => rule.roles!.includes(r));
  }
  // sem regra: exige estar autenticado
  return roles.length > 0;
}

function isPublicUnauthenticatedPath(pathname: string): boolean {
  return pathname === '/login';
}

/* ---------- Middleware ---------- */

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method || 'GET';

  const token =
    req.cookies.get('token')?.value ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/, '') ||
    null;

  const payload = token ? decodeJwt(token) : null;

  // rota pública de login: se já estiver autenticado, encaminha para a home
  if (isPublicUnauthenticatedPath(pathname)) {
    if (payload && !isExpired(payload)) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // sem token
  if (!token || !payload) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const url = new URL('/login', req.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // token expirado/ inválido
  if (isExpired(payload)) {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.delete('token');
    return res;
  }

  const roles = extractRoles(payload);
  const allowed = hasAccess(roles, pathname, method);

  if (!allowed) {
    // rotas de API => 403; páginas => redirect
    if (pathname.startsWith('/api/')) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/api/:path*',
    '/products/:path*',
    '/categories/:path*',
    '/orders/:path*',
    '/users/:path*',
    '/products',
    '/categories',
    '/orders',
    '/users',
  ],
};
