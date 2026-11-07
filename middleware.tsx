import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs'; // <-- LÍNEA MÁGICA AGREGADA

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay usuario y quiere entrar a un panel, lo mandamos al login
  if (!user && request.nextUrl.pathname.startsWith('/panel-')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si ya está logueado y quiere ir al login, lo mandamos a la landing
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/panel-administrador/:path*', '/panel-guardia/:path*', '/panel-residente/:path*', '/login'],
};