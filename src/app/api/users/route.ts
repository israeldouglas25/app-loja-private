import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:8080/api/v1";

export async function GET(req: NextRequest) {
  // simply proxy GET /api/users to backend
  const backendRes = await fetch(`${API_BASE_URL}/users`, {
    headers: req.headers, // forward headers if needed
  });
  const data = await backendRes.text();
  return new NextResponse(data, {
    status: backendRes.status,
    headers: { "Content-Type": backendRes.headers.get("content-type") || "application/json" },
  });
}

export async function POST(req: NextRequest) {
  // proxy create user
  const body = await req.text();
  const backendRes = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // you could forward auth headers here if needed
    },
    body,
  });
  const data = await backendRes.text();
  return new NextResponse(data, {
    status: backendRes.status,
    headers: { "Content-Type": backendRes.headers.get("content-type") || "application/json" },
  });
}

// optionally other methods (PUT/PATCH/DELETE) could be added similarly
