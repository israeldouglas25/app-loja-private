import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8080/api/v1';

export async function GET(req: NextRequest) {
  const backendRes = await fetch(`${API_BASE_URL}/categories`, {
    headers: req.headers,
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
  const headers = Object.fromEntries(
    Array.from(req.headers) as [string, string][]
  ) as Record<string, string>;
  delete headers.host;
  headers['Content-Type'] = 'application/json';

  const backendRes = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers,
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
