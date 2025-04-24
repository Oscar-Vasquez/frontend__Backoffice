// API configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Authentication configuration
export const AUTH_TOKEN_NAME = 'workexpress_token';
export const AUTH_TOKEN_EXPIRY = 60 * 60 * 24; // 24 hours in seconds

// Application routes
export const ROUTES = {
  LOGIN: '/auth/login',
  DASHBOARD: '/dashboard/home',
  UNAUTHORIZED: '/auth/unauthorized',
};

// Permission configuration
export const PERMISSIONS = {
  HOME: 'home',
  TRACKING: 'tracking',
  BILLING: 'billing',
  INVOICES: 'invoices',
  CLIENTS: 'clients',
  OPERATORS: 'operators',
  OPERATOR_TYPES: 'operator_types',
  PLANS: 'plans',
  BRANCHES: 'branches',
  EMAILS: 'emails',
  CASH_CLOSURES: 'cash_closures',
};

// Permission labels (for UI display)
export const PERMISSION_LABELS: Record<string, string> = {
  [PERMISSIONS.HOME]: 'Dashboard',
  [PERMISSIONS.TRACKING]: 'Rastreo',
  [PERMISSIONS.BILLING]: 'Facturación',
  [PERMISSIONS.INVOICES]: 'Facturas',
  [PERMISSIONS.CLIENTS]: 'Clientes',
  [PERMISSIONS.OPERATORS]: 'Operadores',
  [PERMISSIONS.OPERATOR_TYPES]: 'Tipos de Operadores',
  [PERMISSIONS.PLANS]: 'Planes',
  [PERMISSIONS.BRANCHES]: 'Sucursales',
  [PERMISSIONS.EMAILS]: 'Emails',
  [PERMISSIONS.CASH_CLOSURES]: 'Cierre de Caja',
};

// Variables globales para controlar el estado de la aplicación
declare global {
  interface Window {
    // Estado de redirección
    isRedirecting: boolean;
    
    // Contador de intentos de redirección para detectar ciclos
    redirectAttempts: number;
    
    // Timestamp del último intento de redirección
    lastRedirectAttempt: number;
    
    // Función para gestionar redirecciones de forma segura
    safeRedirect: (url: string) => void;
    
    // Función para verificar si se debe permitir una redirección
    shouldAllowRedirect: () => boolean;
  }
}

// Inicializar las variables globales si estamos en el navegador
if (typeof window !== 'undefined') {
  // Estado de redirección
  window.isRedirecting = window.isRedirecting || false;
  
  // Contador de intentos de redirección
  window.redirectAttempts = window.redirectAttempts || 0;
  
  // Timestamp del último intento de redirección
  window.lastRedirectAttempt = window.lastRedirectAttempt || 0;
  
  // Función para gestionar redirecciones de forma segura
  window.safeRedirect = (url: string) => {
    // Si ya estamos redirigiendo, no hacer nada
    if (window.isRedirecting) {
      console.log('🛑 Ya hay una redirección en progreso, evitando ciclo');
      return;
    }
    
    // Verificar si se debe permitir la redirección
    if (!window.shouldAllowRedirect()) {
      console.log('🛑 Demasiados intentos de redirección, evitando ciclo');
      return;
    }
    
    // Marcar que estamos redirigiendo
    window.isRedirecting = true;
    
    // Incrementar el contador de intentos
    window.redirectAttempts++;
    
    // Actualizar el timestamp
    window.lastRedirectAttempt = Date.now();
    
    // Redirigir
    console.log(`🔄 Redirigiendo a: ${url}`);
    window.location.href = url;
  };
  
  // Función para verificar si se debe permitir una redirección
  window.shouldAllowRedirect = () => {
    const now = Date.now();
    const timeSinceLastRedirect = now - window.lastRedirectAttempt;
    
    // Si han pasado menos de 2 segundos desde el último intento y ya hemos intentado más de 3 veces,
    // no permitir la redirección
    if (timeSinceLastRedirect < 2000 && window.redirectAttempts > 3) {
      return false;
    }
    
    // Si han pasado más de 10 segundos desde el último intento, reiniciar el contador
    if (timeSinceLastRedirect > 10000) {
      window.redirectAttempts = 0;
    }
    
    return true;
  };
  
  // Reiniciar el estado de redirección cuando la página se carga completamente
  window.addEventListener('load', () => {
    window.isRedirecting = false;
  });
} 