import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Sliding-window rate-limiter for API routes: 60 requests per minute per IP
const apiRateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup of expired rate-limit buckets every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function isRateLimited(ip: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [key, val] of apiRateLimitMap.entries()) {
      if (now > val.resetAt) {
        apiRateLimitMap.delete(key);
      }
    }
    lastCleanup = now;
  }

  const record = apiRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    apiRateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (record.count >= limit) {
    return true;
  }

  record.count++;
  return false;
}

// Dangerous malicious string patterns
const DANGEROUS_PATTERNS = [
  /(\.\.|\%2e\%2e)(\/|\\)/i, // Path traversal
  /<script[\s\S]*?>/i,       // Script tag
  /javascript\s*:/i,         // Javascript pseudo-protocol
  /data\s*:\s*text\/html/i,  // Data HTML URI
  /(\$where|\$gt|\$ne|\$regex)/i, // NoSQL injection operators
  /(union(\s+all)?\s+select|select\s+.*\s+from)/i // Basic SQL injection probe
];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. URL Path Traversal & Injection Check
  const decodedUrl = decodeURIComponent(request.url);
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(pathname) || pattern.test(search) || pattern.test(decodedUrl)) {
      console.warn(`[Security Alert] Blocked suspicious request: ${request.method} ${pathname}`);
      return new NextResponse('Bad Request: Malicious pattern detected', { status: 400 });
    }
  }

  // 2. API Rate Limiting Defense
  if (pathname.startsWith('/api/')) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    if (isRateLimited(clientIp, 60, 60000)) {
      console.warn(`[Security Alert] Rate limit exceeded for IP: ${clientIp} on ${pathname}`);
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please slow down and try again shortly.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        }
      );
    }
  }

  const response = NextResponse.next();

  // 3. Inject Defensive Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (manifest, sw, icons)
     */
    '/((?!_next/static|_next/image|favicon.ico|sw.js|fallback-.*|workbox-.*).*)',
  ],
};
