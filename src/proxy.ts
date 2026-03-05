import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Basic JWT decoder that doesn't verify the signature.
 * We're only using it client-side to read the roles claim, so
 * a missing signature check is acceptable for UI routing purposes.
 */
function decodeJwt(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const decoded = Buffer.from(payload, "base64").toString();
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

// permission rules emulating backend Spring config
interface PermissionRule {
  methods?: string[]; // undefined means any method
  path: string; // prefix to match
  roles?: string[]; // undefined => permitAll
}

const permissionRules: PermissionRule[] = [
  // public endpoints remain open (not checked here)
  { path: "/api/users" },
  { path: "/api/orders" },

  // products endpoints
  { methods: ["POST", "PUT", "DELETE"], path: "/api/products", roles: ["ROLE_ADMIN"] },
  { methods: ["GET"], path: "/api/products", roles: ["ROLE_USER", "ROLE_ADMIN"] },
];

function hasAccess(roles: string[], path: string, method: string): boolean {
  // try to match a rule
  for (const rule of permissionRules) {
    if (path.startsWith(rule.path)) {
      if (rule.methods && !rule.methods.includes(method)) continue;
      // permitAll
      if (!rule.roles) return true;
      // check role intersection
      if (roles.some((r) => rule.roles!.includes(r))) return true;
      return false;
    }
  }
  // no specific rule found – require user to be authenticated (any role)
  return roles.length > 0;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // always allow the request to continue, but log/mark if access would be denied
  const token =
    req.cookies.get("token")?.value ||
    (req.headers.get("authorization") || "").replace(/^Bearer\s+/, "") ||
    null;

  const payload = token ? decodeJwt(token) : null;
  const roles: string[] = payload ? payload.roles || payload.authorities || [] : [];
  const method = req.method || "GET";
  const allowed = hasAccess(roles, pathname, method);

  if (!allowed) {
    console.warn("acesso negado no proxy", { pathname, method, roles });
    // add marker header so downstream code/tests can know
    const res = NextResponse.next();
    res.headers.set("x-access-denied", "true");
    return res;
  }

  return NextResponse.next();
}

// apply proxy to application routes and API endpoints
export const config = {
  matcher: [
    "/api/:path*",
    "/products/:path*",
    "/users/:path*",
    "/products",
    "/users",
    "/",
  ],
};
