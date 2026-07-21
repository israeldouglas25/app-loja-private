// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8080/api/v1';

interface JwtPayload {
  role?: string;
  roles?: string[];
  authorities?: string[];
  exp?: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

function extractRoles(p: JwtPayload | null): string[] {
  if (!p) return [];
  const out = new Set<string>();
  p.roles?.forEach((r) => out.add(r));
  p.authorities?.forEach((r) => out.add(r));
  if (p.role) out.add(p.role);
  return [...out];
}

export async function GET(req: NextRequest) {
  // pega token do cookie ou do header Authorization
  const token =
    req.cookies.get('token')?.value ||
    (req.headers.get('authorization') || '').replace(/^Bearer\s+/, '') ||
    null;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = decodeJwt(token);
  if (!payload || (payload.exp && Date.now() >= payload.exp * 1000)) {
    return NextResponse.json({ error: 'Token expired' }, { status: 401 });
  }

  const roles = extractRoles(payload);
  const isAdmin = roles.includes('ROLE_ADMIN');

  // ADMIN -> /orders ; demais -> /orders/user/authentication
  const path = isAdmin ? '/orders' : '/orders/user/authentication';
  const backendUrl = new URL(`${API_BASE_URL}${path}`);
  backendUrl.search = req.nextUrl.search;

  // repassa apenas headers úteis (não repasse host/content-length crus)
  const forwardHeaders = new Headers();
  const auth = req.headers.get('authorization');
  if (auth) forwardHeaders.set('authorization', auth);
  else forwardHeaders.set('authorization', `Bearer ${token}`);
  const accept = req.headers.get('accept');
  if (accept) forwardHeaders.set('accept', accept);

  const backendRes = await fetch(backendUrl.toString(), {
    method: 'GET',
    headers: forwardHeaders,
  });

  const data = await backendRes.text();
  return new NextResponse(data, {
    status: backendRes.status,
    headers: {
      'Content-Type':
        backendRes.headers.get('content-type') || 'application/json',
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const backendRes = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(req.headers.get('authorization')
        ? { Authorization: req.headers.get('authorization')! }
        : {}),
    },
    body,
  });
  const data = await backendRes.text();
  return new NextResponse(data, {
    status: backendRes.status,
    headers: {
      'Content-Type':
        backendRes.headers.get('content-type') || 'application/json',
    },
  });
}
