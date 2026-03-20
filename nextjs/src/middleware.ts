import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === '/favicon.ico') {
        const url = request.nextUrl.clone()
        url.pathname = '/api/site-favicon'
        return NextResponse.rewrite(url)
    }
    return await updateSession(request)
}

export const config = {
    matcher: [
        '/favicon.ico',
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}