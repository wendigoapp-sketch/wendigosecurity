import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';

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
  const url = request.nextUrl.pathname;

  // 1. Si no hay usuario y quiere entrar a un panel, al login
  if (!user && url.startsWith('/panel-')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Si está logueado y quiere ir al login, a la home
  if (user && url === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. CANDADO: Panel de administrador
  if (user && url.startsWith('/panel-administrador')) {
    const { data } = await supabase
      .from('empresa_membresias')
      .select('rol')
      .eq('usuario_id', user.id)
      .eq('rol', 'admin')
      .limit(1);

    if (!data || data.length === 0) {
      return NextResponse.redirect(new URL('/panel-guardia', request.url));
    }
  }

  // 4. CANDADO: Panel de guardia
  if (user && url.startsWith('/panel-guardia')) {
    const { data } = await supabase
      .from('membresias')
      .select('rol')
      .eq('usuario_id', user.id)
      .eq('rol', 'guardia')
      .limit(1);

    if (!data || data.length === 0) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 5. CANDADO: Panel de residente (El que faltaba para que Matías no entre)
  if (user && url.startsWith('/panel-residente')) {
    const { data } = await supabase
      .from('membresias')
      .select('rol')
      .eq('usuario_id', user.id)
      .eq('rol', 'residente')
      .limit(1);

    if (!data || data.length === 0) {
      // Si no es residente, lo mandamos a su panel de guardia
      return NextResponse.redirect(new URL('/panel-guardia', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/panel-administrador/:path*', '/panel-guardia/:path*', '/panel-residente/:path*', '/login'],
};