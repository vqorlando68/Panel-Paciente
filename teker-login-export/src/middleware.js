import { NextResponse } from "next/server";
import { configByRole } from "./lib/staticData";

const allowedDashRoutes = Object.values(configByRole).map(
  (item) => item.mainRoute,
);

// Best-effort, per-edge-instance rate limiting.
//
// KNOWN LIMITATION: middleware.js runs on Vercel's Edge Runtime, which is
// deployed across many regional instances that do NOT share memory. This Map
// only throttles bursts landing on a single instance — an attacker spread
// across regions (or just retrying until they hit a fresh instance) is not
// actually stopped. Fixing that for real requires a store reachable from Edge
// (e.g. Upstash Redis over REST) with its own env vars/infra, which was
// explicitly deferred — this is a documented, accepted gap, not an oversight.
//
// For login specifically, this is NOT the real brute-force control: the
// account/IP lockout that matters is enforced server-side against Oracle (see
// lib/oracle-db/pl-sql/user/loginAttempts.js, wired into
// app/server-actions/auth/login.js and app/api/user/code/validate/route.js),
// which IS consistent across instances because it hits the same DB regardless
// of which edge node served the request. This limiter only exists to blunt
// high-volume scripted abuse hitting one node before it reaches those checks.
const requestCounts = new Map();

const RATE_LIMITS = {
  directorio: { windowMs: 60 * 1000, max: 10 },
  login: { windowMs: 60 * 1000, max: 20 },
};

// IPv6 addresses contain colons, so the key can't be built with a plain
// `${a}:${b}` template (a naive split(":") on read would slice into the
// address itself). JSON-encoding the parts keeps the key unambiguous.
function rateLimitKey(scope, ip, bucket) {
  return JSON.stringify([scope, ip, bucket]);
}

function checkRateLimit(scope, ip) {
  const { windowMs, max } = RATE_LIMITS[scope];
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const key = rateLimitKey(scope, ip, bucket);

  const current = requestCounts.get(key) || 0;

  if (current >= max) {
    return false; // Rate limit exceeded
  }

  requestCounts.set(key, current + 1);

  // Cleanup old entries every ~100 requests instead of unboundedly growing.
  if (Math.random() < 0.01) {
    for (const [k] of requestCounts) {
      const [kScope, , kBucket] = JSON.parse(k);
      const kWindowMs = RATE_LIMITS[kScope]?.windowMs || windowMs;
      if (now - kBucket * kWindowMs > 10 * 60 * 1000) {
        requestCounts.delete(k);
      }
    }
  }

  return true;
}

export async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const requestHeaders = new Headers(request.headers);

  // Get client IP for rate limiting. `request.ip` was removed from
  // NextRequest — Vercel's edge network sets x-forwarded-for/x-real-ip
  // instead, so those are the only reliable sources here.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // Rate limit for /directorio (excluded for /directorio/auto)
  if (
    pathname.startsWith("/directorio") &&
    !pathname.startsWith("/directorio/auto")
  ) {
    if (!checkRateLimit("directorio", ip)) {
      return new NextResponse("Too many requests", { status: 429 });
    }
  }

  // Rate limit for /login and /login/validar — coarse, request-volume-based
  // first line of defense. The real per-account/IP failed-attempt lockout
  // lives in Oracle (see comment above requestCounts).
  if (pathname.startsWith("/login")) {
    if (!checkRateLimit("login", ip)) {
      return new NextResponse("Too many requests", { status: 429 });
    }
  }

  // Set custom headers for all requests
  requestHeaders.set("x-url", request.url);
  requestHeaders.set("x-origin", url.origin);
  requestHeaders.set("x-pathname", pathname);

  // console.log("----------------------");
  // console.log(`Middleware triggered`);
  // console.log(`Request URL: ${request.url}`);
  // console.log(`Request Origin: ${url.origin}`);
  // console.log(`Request Pathname: ${pathname}`);
  // console.log("----------------------");

  // Check if the request is for a dashboard route
  const splittedPathname = pathname.split("/");
  const startsWithAllowedRoute = allowedDashRoutes.includes(
    splittedPathname[2],
  );

  const authTokens = request.cookies.get("tkr_usr_session")?.value;
  const userRole = request.cookies.get("tkr_usr_role")?.value;
  const { mainRoute, routes } = configByRole[userRole] || {};

  if (startsWithAllowedRoute) {
    if (!authTokens) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Validar que el mainRoute coincida
    if (splittedPathname[2] !== mainRoute) {
      return NextResponse.redirect(new URL(`/app/${mainRoute}`, request.url));
    }

    // Validar segundo segmento solo si existe, pero permitir rutas dinámicas anidadas
    if (splittedPathname[3] && !routes?.includes(splittedPathname[3])) {
      return NextResponse.redirect(new URL(`/app/${mainRoute}`, request.url));
    }
  }

  if (pathname.startsWith("/login")) {
    if (authTokens && userRole) {
      return NextResponse.redirect(new URL(`/app/${mainRoute}`, request.url));
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (pathname.startsWith("/zoom")) {
    response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
    response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  }

  if (pathname.startsWith("/directorio")) {
    response.headers.set("Cache-Control", "public, max-age=600, s-maxage=600");
    response.headers.set("CDN-Cache-Control", "max-age=600");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.*\\.png|favicon\\.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico|sitemap\\.xml|robots\\.txt|site\\.webmanifest|browserconfig\\.xml).*)",
  ],
};
