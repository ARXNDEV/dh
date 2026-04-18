import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './lib/auth';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = req.cookies.get('session')?.value;

  // 1. Authenticated Check
  if (path.startsWith('/dashboard') || path.startsWith('/api/scores')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    try {
      const decoded = await decrypt(session);
      
      // 2. Real-time Subscription Check for high-value routes
      // Note: In middleware, we can't easily connect to MongoDB for every request 
      // without high latency. We'll use the session status or an internal API call
      // or simply rely on the API route checks for data-sensitive operations.
      // For now, we ensure they are at least logged in.
    } catch (error) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/scores/:path*', '/api/draws/:path*'],
};
