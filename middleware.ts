import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Función para verificar si una URL ya tiene un parámetro de redirección
function hasRedirectParam(url: URL): boolean {
  return url.searchParams.has('redirected');
}

// Función para añadir un parámetro de redirección a una URL
function addRedirectParam(url: URL): URL {
  const newUrl = new URL(url);
  newUrl.searchParams.set('redirected', 'true');
  return newUrl;
}

// Función para verificar si hay un ciclo de redirección basado en cookies
function hasRedirectionCycle(request: NextRequest): boolean {
  const redirectCount = request.cookies.get('redirect_count')?.value;
  // Safely parse, defaulting to 0 if cookie is missing or not a number
  return (parseInt(redirectCount ?? '0') || 0) > 3;
}

// Función para incrementar el contador de redirecciones
function incrementRedirectCount(response: NextResponse): NextResponse {
  const redirectCount = response.cookies.get('redirect_count')?.value;
  const count = redirectCount ? parseInt(redirectCount) + 1 : 1;
  response.cookies.set('redirect_count', count.toString(), {
    maxAge: 10, // 10 segundos
    path: '/',
  });
  return response;
}

export function middleware(request: NextRequest) {
  // Verificar si hay un ciclo de redirección
  if (hasRedirectionCycle(request)) {
    console.log('🔄 Detectado ciclo de redirección, permitiendo la navegación');
    const response = NextResponse.next();
    response.cookies.set('redirect_count', '0', {
      maxAge: 0,
      path: '/',
    });
    return response;
  }

  // Verificar si ya hay un parámetro de redirección para evitar ciclos
  if (hasRedirectParam(request.nextUrl)) {
    console.log('🔄 Detectada posible redirección infinita, permitiendo la navegación');
    return NextResponse.next();
  }

  const token = request.cookies.get('workexpress_token')?.value || request.cookies.get('token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/auth/login';
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isRootPath = request.nextUrl.pathname === '/';
  
  // Obtener la URL de referencia para evitar redirecciones infinitas
  const referer = request.headers.get('referer') || '';
  const isComingFromDashboard = referer.includes('/dashboard');
  const isComingFromLogin = referer.includes('/auth/login');

  // Si es la ruta raíz, redirigir según autenticación
  if (isRootPath) {
    if (token) {
      console.log('🏠 Redirigiendo de raíz a dashboard');
      const response = NextResponse.redirect(addRedirectParam(new URL('/dashboard/home', request.url)));
      return incrementRedirectCount(response);
    } else {
      console.log('🏠 Redirigiendo de raíz a login');
      const response = NextResponse.redirect(addRedirectParam(new URL('/auth/login', request.url)));
      return incrementRedirectCount(response);
    }
  }

  // Si no hay token y está intentando acceder al dashboard, redirigir al login
  if (!token && isDashboardRoute) {
    console.log('🔒 No hay token, redirigiendo a login');
    const response = NextResponse.redirect(addRedirectParam(new URL('/auth/login', request.url)));
    // Limpiar cualquier token inválido
    response.cookies.delete('workexpress_token');
    response.cookies.delete('token');
    return incrementRedirectCount(response);
  }

  // Si hay token y está intentando acceder al login, redirigir al dashboard
  // Pero solo si no viene desde el dashboard (para evitar ciclos)
  if (token && isLoginPage && !isComingFromDashboard) {
    console.log('✅ Usuario ya autenticado, redirigiendo a dashboard');
    const response = NextResponse.redirect(addRedirectParam(new URL('/dashboard/home', request.url)));
    return incrementRedirectCount(response);
  }

  // Reiniciar el contador de redirecciones si no hay redirección
  const response = NextResponse.next();
  response.cookies.set('redirect_count', '0', {
    maxAge: 0,
    path: '/',
  });
  return response;
}

// Configurar las rutas que queremos proteger
export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/auth/login'
  ]
};
