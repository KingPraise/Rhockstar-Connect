import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Local fallback sliding-window rate-limiter: 60 requests per minute per IP
const apiRateLimitMap = new Map<string, { count: number; resetAt: number }>();

const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function isMemoryRateLimited(ip: string, limit = 60, windowMs = 60000): boolean {
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

/**
 * Distributed Edge Rate Limiter via Upstash Redis REST API
 * Seamlessly falls back to in-memory LRU token bucket if Upstash env credentials are not set.
 */
async function checkRateLimit(ip: string, limit = 60, windowSec = 60): Promise<boolean> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      const bucket = Math.floor(Date.now() / (windowSec * 1000));
      const key = `rhockstar:ratelimit:${ip}:${bucket}`;

      const res = await fetch(`${upstashUrl.replace(/\/$/, '')}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', key],
          ['EXPIRE', key, windowSec],
        ]),
      });

      if (res.ok) {
        const data = await res.json();
        const currentCount = Number(data?.[0]?.result || 0);
        return currentCount > limit;
      }
    } catch {
      // Fallback to local memory limiter if Redis is unreachable
    }
  }

  return isMemoryRateLimited(ip, limit, windowSec * 1000);
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

export async function middleware(request: NextRequest) {
  // 1. Canonical Domain Redirection: Automatically redirect any *.netlify.app traffic to rhockstarconnect.com
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.host || '';
  if (host.includes('.netlify.app')) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.host = 'rhockstarconnect.com';
    url.port = '';
    const status = (request.method === 'GET' || request.method === 'HEAD') ? 301 : 308;
    return NextResponse.redirect(url, { status });
  }

  const { pathname, search } = request.nextUrl;

  // 1. URL Path Traversal & Injection Check
  const decodedUrl = decodeURIComponent(request.url);
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(pathname) || pattern.test(search) || pattern.test(decodedUrl)) {
      console.warn(`[Security Alert] Blocked suspicious request: ${request.method} ${pathname}`);
      return new NextResponse('Bad Request: Malicious pattern detected', { status: 400 });
    }
  }

  // 2. Distributed / Hybrid API Rate Limiting Defense
  if (pathname.startsWith('/api/')) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    const limited = await checkRateLimit(clientIp, 60, 60);
    if (limited) {
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
