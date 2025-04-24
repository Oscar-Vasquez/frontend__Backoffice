'use client';

import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/app/config';
import { toast } from '@/components/ui/use-toast';
import { setCookie, getCookie, deleteCookie } from 'cookies-next';
import { API_URL, AUTH_TOKEN_NAME, AUTH_TOKEN_EXPIRY } from '@/app/config';

// Definir la interfaz para el hook de navegación de autenticación
interface AuthNavigation {
  logout: () => void;
  forceRelogin: () => void;
}

export interface Operator {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  branch_id?: string;
  branch_name?: string;
  branchReference?: string;
  branchName?: string;
  type_operator_id?: string;
  typeOperatorId?: string;
  status?: string;
  photo?: string | null;
  phone?: string | null;
  createdAt?: Date;
  updatedAt?: Date | null;
  lastLoginAt?: Date | null;
  permissions?: string[];
}

/**
 * Servicio de autenticación para manejar operaciones relacionadas con la autenticación
 */
export class AuthService {
  /**
   * Obtiene el token de autenticación del almacenamiento local
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('workexpress_token') || localStorage.getItem('token');
  }

  /**
   * Establece el token de autenticación en el almacenamiento local
   */
  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('workexpress_token', token);
  }

  /**
   * Obtiene el ID del operador del almacenamiento local
   */
  static getOperatorId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('operatorId');
  }

  /**
   * Establece el ID del operador en el almacenamiento local
   */
  static setOperatorId(operatorId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('operatorId', operatorId);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('token');
  }

  /**
   * Limpia la información de autenticación del almacenamiento local
   */
  static clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('workexpress_token');
    localStorage.removeItem('operatorId');
    localStorage.removeItem('permissions');
  }

  /**
   * Cierra la sesión del usuario (CAUSA RECARGA COMPLETA DE PÁGINA)
   * Para navegación del lado del cliente, use el hook useAuthNavigation
   */
  static logout(): void {
    this.clearAuth();
    
    // Mostrar un toast de éxito
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
    
    // Redirigir a la página de inicio de sesión (causa recarga completa)
    if (typeof window !== 'undefined') {
      window.location.href = ROUTES.LOGIN;
    }
  }

  /**
   * Fuerza el reinicio de sesión del usuario (CAUSA RECARGA COMPLETA DE PÁGINA)
   * Para navegación del lado del cliente, use el hook useAuthNavigation
   */
  static forceRelogin(): void {
    this.clearAuth();
    
    // Mostrar un toast de información
    toast({
      title: 'Sesión expirada',
      description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      variant: 'destructive',
    });
    
    // Redirigir a la página de inicio de sesión con el parámetro force=true (causa recarga completa)
    if (typeof window !== 'undefined') {
      window.location.href = `${ROUTES.LOGIN}?force=true`;
    }
  }

  /**
   * Guarda el token de autenticación en cookies y localStorage
   */
  static saveToken(token: string): void {
    console.log('💾 Guardando token de autenticación...');
    
    // Guardar en cookie
    setCookie(AUTH_TOKEN_NAME, token, {
      maxAge: AUTH_TOKEN_EXPIRY,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    // Guardar en localStorage para compatibilidad con verificaciones de autenticación
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('workexpress_token', token);
      console.log('✅ Token guardado en localStorage y cookies');
    }
  }

  static saveOperatorData(operator: Operator): void {
    console.log('🔄 Guardando datos del operador:', operator);
    try {
      localStorage.setItem('operator', JSON.stringify(operator));
      console.log('✅ Datos del operador guardados correctamente');
    } catch (error) {
      console.error('❌ Error al guardar datos del operador:', error);
    }
  }

  static getOperatorData(): Operator | null {
    if (typeof window === 'undefined') return null;
    
    const operatorData = localStorage.getItem('operator');
    if (!operatorData) {
      console.log('⚠️ No se encontraron datos del operador en localStorage');
      return null;
    }
    
    try {
      console.log('🔍 Datos crudos del operador en localStorage:', operatorData);
      
      // Verificar si el JSON es válido antes de parsearlo
      try {
        JSON.parse(operatorData);
      } catch (e) {
        console.error('❌ JSON inválido en localStorage:', e);
        console.log('🔄 Intentando limpiar el localStorage y reintentar');
        localStorage.removeItem('operator');
        return null;
      }
      
      const operator = JSON.parse(operatorData) as Operator;
      console.log('🔍 Datos parseados del operador:', operator);
      
      // Función para detectar placeholders
      const isPlaceholder = (value: string | undefined): boolean => {
        if (!value) return false;
        return value === '3fa85f64-5717-4562-b3fc-2c963f66afa6' || 
               value === '00000000-0000-0000-0000-000000000000' ||
               value.includes('00000000');
      };
      
      // Verificar si hay algún campo que contenga type_operator_id en cualquier formato
      const findTypeOperatorId = (obj: any): string | undefined => {
        if (!obj || typeof obj !== 'object') return undefined;
        
        for (const key in obj) {
          if (/type_?operator_?id/i.test(key) && 
              typeof obj[key] === 'string' && 
              obj[key] && 
              !isPlaceholder(obj[key])) {
            console.log(`✅ Encontrado type_operator_id válido en campo ${key}:`, obj[key]);
            return obj[key];
          }
        }
        
        return undefined;
      };
      
      // Buscar type_operator_id en el objeto
      const foundTypeOperatorId = findTypeOperatorId(operator);
      
      console.log('- type_operator_id antes de sanitizar:', operator.type_operator_id);
      console.log('- typeOperatorId antes de sanitizar:', operator.typeOperatorId);
      console.log('- Valor encontrado en búsqueda profunda:', foundTypeOperatorId);
      
      // Sanitize the operator type ID if it's a placeholder
      if (isPlaceholder(operator.type_operator_id)) {
        console.log('⚠️ Sanitizando type_operator_id placeholder');
        operator.type_operator_id = undefined;
      }
      
      if (isPlaceholder(operator.typeOperatorId)) {
        console.log('⚠️ Sanitizando typeOperatorId placeholder');
        operator.typeOperatorId = undefined;
      }
      
      // Si encontramos un valor en la búsqueda profunda, usarlo
      if (foundTypeOperatorId) {
        console.log('✅ Usando valor encontrado en búsqueda profunda');
        operator.type_operator_id = foundTypeOperatorId;
        operator.typeOperatorId = foundTypeOperatorId;
      }
      
      console.log('- type_operator_id después de sanitizar:', operator.type_operator_id);
      
      // Asegurar consistencia entre campos duplicados
      if (operator.first_name && !operator.firstName) {
        operator.firstName = operator.first_name;
      } else if (operator.firstName && !operator.first_name) {
        operator.first_name = operator.firstName;
      }
      
      if (operator.last_name && !operator.lastName) {
        operator.lastName = operator.last_name;
      } else if (operator.lastName && !operator.last_name) {
        operator.last_name = operator.lastName;
      }
      
      // Asegurar consistencia en campos de sucursal
      if (operator.branch_id && !operator.branchReference) {
        operator.branchReference = operator.branch_id;
      } else if (operator.branchReference && !operator.branch_id) {
        operator.branch_id = operator.branchReference;
      }
      
      if (operator.branch_name && !operator.branchName) {
        operator.branchName = operator.branch_name;
      } else if (operator.branchName && !operator.branch_name) {
        operator.branch_name = operator.branchName;
      }
      
      // Asegurar consistencia en type_operator_id
      if (operator.type_operator_id && !operator.typeOperatorId) {
        console.log('✅ Copiando type_operator_id a typeOperatorId');
        operator.typeOperatorId = operator.type_operator_id;
      } else if (operator.typeOperatorId && !operator.type_operator_id) {
        console.log('✅ Copiando typeOperatorId a type_operator_id');
        operator.type_operator_id = operator.typeOperatorId;
      }
      
      const isValid = this.validateOperatorData(operator);
      console.log('🔍 Validación de datos del operador:', isValid ? 'Válido' : 'Inválido');
      console.log('- type_operator_id final:', operator.type_operator_id);
      
      return isValid ? operator : null;
    } catch (error) {
      console.error('❌ Error parsing operator data:', error);
      return null;
    }
  }

  static validateOperatorData(operator: any): operator is Operator {
    console.log('🔍 Validando datos del operador...');
    
    // Verificar que el operador exista y sea un objeto
    if (!operator || typeof operator !== 'object') {
      console.log('❌ Validación fallida: operador no es un objeto válido');
      return false;
    }
    
    // Verificar ID y email (campos obligatorios)
    if (typeof operator.id !== 'string') {
      console.log('❌ Validación fallida: id no es un string válido');
      return false;
    }
    
    if (typeof operator.email !== 'string') {
      console.log('❌ Validación fallida: email no es un string válido');
      return false;
    }
    
    // Verificar rol (obligatorio)
    if (typeof operator.role !== 'string') {
      console.log('❌ Validación fallida: rol no es un string válido');
      return false;
    }
    
    // Verificar type_operator_id (opcional pero debe ser string si existe)
    if (operator.type_operator_id !== undefined && 
        operator.type_operator_id !== null && 
        typeof operator.type_operator_id !== 'string') {
      console.log('⚠️ Advertencia: type_operator_id existe pero no es un string válido');
      console.log('- Valor actual:', operator.type_operator_id);
      console.log('- Tipo:', typeof operator.type_operator_id);
    } else if (operator.type_operator_id) {
      console.log('✅ type_operator_id es válido:', operator.type_operator_id);
    }
    
    // Si llegamos aquí, el operador tiene los campos mínimos necesarios
    console.log('✅ Validación exitosa: datos del operador válidos (validación mínima)');
    return true;
  }

  static async login(email: string, password: string): Promise<{ token: string; operator: Operator }> {
    try {
      // Limpiar localStorage antes de iniciar sesión para evitar datos corruptos
      this.clearAuth();
      
      console.log(`🔐 Intentando login con email: ${email}`);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Credenciales inválidas');
      }

      const data = await response.json();
      
      console.log('📦 RESPUESTA COMPLETA DEL SERVIDOR:');
      console.log(JSON.stringify(data, null, 2));
      
      // Guardar token - esto guarda en cookie y localStorage
      this.saveToken(data.access_token);
      
      // Extraer datos del operador de la respuesta
      const rawOperator = data.operator || data.user || data.data || data;
      
      console.log('🔍 OBJETO OPERADOR RECIBIDO:');
      console.log(JSON.stringify(rawOperator, null, 2));
      
      // Crear un objeto minimalOperator con los campos necesarios
      const minimalOperator: Operator = {
        id: rawOperator.id,
        email: rawOperator.email,
        firstName: rawOperator.firstName || rawOperator.first_name || '',
        lastName: rawOperator.lastName || rawOperator.last_name || '',
        role: rawOperator.role || 'user',
        branchReference: rawOperator.branchReference || rawOperator.branchId || '',
        type_operator_id: rawOperator.type_operator_id,
        typeOperatorId: rawOperator.type_operator_id || rawOperator.typeOperatorId,
        permissions: rawOperator.permissions || []
      };
      
      // Guardar datos en localStorage
      console.log('💾 Guardando datos del operador:', minimalOperator);
      const operatorJson = JSON.stringify(minimalOperator);
      localStorage.setItem('operator', operatorJson);
      
      // Verificación doble para asegurar que los datos se guardaron
      const savedOperator = localStorage.getItem('operator');
      if (!savedOperator) {
        console.warn('⚠️ No se pudo verificar que los datos del operador se guardaron correctamente');
        // Intento de respaldo
        localStorage.setItem('operator', JSON.stringify({
          id: minimalOperator.id,
          email: email,
          role: minimalOperator.role || 'user'
        }));
      } else {
        console.log('✅ Datos del operador guardados correctamente');
      }
      
      return {
        token: data.access_token,
        operator: minimalOperator,
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      // Limpiar datos en caso de error
      this.clearAuth();
      throw error;
    }
  }

  static cleanLocalStorage(): void {
    console.log('🧹 Limpiando localStorage para eliminar datos corruptos');
    localStorage.removeItem('operator');
    // Mantener el token para no forzar logout
    console.log('✅ localStorage limpiado');
  }
}

/**
 * Hook para manejar la navegación relacionada con la autenticación
 * Utiliza el router de Next.js para navegación del lado del cliente
 */
export function useAuthNavigation(): AuthNavigation {
  const router = useRouter();
  
  return {
    /**
     * Cierra la sesión del usuario y navega a la página de inicio de sesión
     * usando el router de Next.js (sin recarga completa de página)
     */
    logout: () => {
      AuthService.clearAuth();
      
      // Mostrar un toast de éxito
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
      });
      
      // Navegar a la página de inicio de sesión usando el router
      router.push(ROUTES.LOGIN);
    },
    
    /**
     * Fuerza el reinicio de sesión del usuario y navega a la página de inicio de sesión
     * usando el router de Next.js (sin recarga completa de página)
     */
    forceRelogin: () => {
      AuthService.clearAuth();
      
      // Mostrar un toast de información
      toast({
        title: 'Sesión expirada',
        description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        variant: 'destructive',
      });
      
      // Navegar a la página de inicio de sesión con el parámetro force=true usando el router
      router.push(`${ROUTES.LOGIN}?force=true`);
    }
  };
} 