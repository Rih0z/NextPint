import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Cloudflare Pages用のヘッダー設定
  const response = NextResponse.next();
  
  // セキュリティヘッダーの追加
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // PWA対応のため、Service Workerの登録を許可
  if (request.nextUrl.pathname.startsWith('/sw.js')) {
    response.headers.set('Service-Worker-Allowed', '/');
  }
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};