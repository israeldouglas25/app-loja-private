import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:8080/api/v1";

async function proxyToBackend(path: string, req: NextRequest, method = "GET") {
  const url = `${API_BASE_URL}${path}`;

  const headers = Object.fromEntries(req.headers.entries());
  // remove host header to avoid passing client's host
  delete (headers as any).host;

  const init: RequestInit = {
    method,
    headers,
  };

  if (method !== "GET" && method !== "HEAD") {
    init.body = await req.text();
  }

  const backendRes = await fetch(url, init);
  const body = await backendRes.text();

  // If backend returned No Content, return without body (204 is not allowed
  // to include a body). Also avoid sending a Content-Type header for empty body.
  if (backendRes.status === 204 || body === "") {
    return new NextResponse(null, { status: backendRes.status });
  }

  return new NextResponse(body, {
    status: backendRes.status,
    headers: { "Content-Type": backendRes.headers.get("content-type") || "application/json" },
  });
}

export async function GET(req: NextRequest, context: { params: any }) {
  const params = await context.params;
  const { id } = params;
  return proxyToBackend(`/users/${id}`, req, "GET");
}

export async function PUT(req: NextRequest, context: { params: any }) {
  const params = await context.params;
  const { id } = params;
  return proxyToBackend(`/users/${id}`, req, "PUT");
}

export async function PATCH(req: NextRequest, context: { params: any }) {
  const params = await context.params;
  const { id } = params;
  return proxyToBackend(`/users/${id}`, req, "PATCH");
}

export async function DELETE(req: NextRequest, context: { params: any }) {
  const params = await context.params;
  const { id } = params;
  return proxyToBackend(`/users/${id}`, req, "DELETE");
}
