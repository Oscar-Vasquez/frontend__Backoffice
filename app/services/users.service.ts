import { API_URL } from "@/config/constants";
import { WalletsService } from './wallets.service';

// Función para obtener cookies por nombre
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null; // Estamos en el servidor
  }
  
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

interface ApiError {
  message: string;
  details?: string;
  statusCode?: number;
}

export interface SupabaseUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  company?: string;
  phoneNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  status?: string;
  accountStatus: boolean;
  personType: 'natural' | 'juridica';
  assignedLocker?: string;
  birthDate?: string;
  branchReference: {
    path: string;
    id: string;
  } | string;
  subscriptionPlan: {
    path: string;
    id: string;
  } | string;
  typeUserReference: {
    path: string;
    id: string;
  } | string;
  walletReference: {
    path: string;
    id: string;
  } | string;
  isEmailVerified: boolean;
  isVerified: boolean;
  photo?: string;
  planRate: number;
  walletName: string;
  walletAmount: number;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  lastSeen?: string;
  price?: number;
  displayMessage?: string;
  // Campos adicionales para facilitar el uso en el frontend
  branchName?: string;
  branchAddress?: string;
  branchLocation?: string;
  planName?: string;
}

export type FirebaseUser = SupabaseUser;

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  status?: string;
  createdAt?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  country?: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  branchId?: string;
  planId?: string;
  password: string;
  branchReference?: {
    path: string;
    id: string;
  };
  subscriptionPlan?: {
    path: string;
    id: string;
  };
  typeUserReference: {
    path: string;
    id: string;
  };
}

interface PlanInfo {
  id: string;
  planName: string;
  name?: string;
  price: number;
  description: string;
}

export interface BranchInfo {
  id: string;
  name: string;
  shortName?: string;
  address: string;
  location?: string;
  province?: string;
  phone?: string;
  error?: string;
}

interface WalletInfo {
  id: string;
  name: string;
  amount: number;
}

export interface TypeUser {
  id: string;
  name: string;
  description?: string;
}

export class UsersService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  private static getAuthHeaders() {
    // Obtener el token de la cookie
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('workexpress_token='))
      ?.split('=')[1];

    if (!token) {
      throw new Error('No hay sesión activa');
    }

    return {
      'Authorization': `Bearer ${token}`
    };
  }

  private static async fetchWithErrorHandling(url: string, options: RequestInit) {
    try {
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...this.getAuthHeaders()
      };
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers || {})
        },
        credentials: 'include'
      });

      if (response.status === 401) {
        throw new Error('Sesión expirada o no válida');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('Error en la petición:', error);
      throw error;
    }
  }

  static async searchSuggestions(query: string): Promise<FirebaseUser[]> {
      if (!query || query.trim().length < 2) {
      console.log('⚠️ Query muy corta o vacía, se requieren al menos 2 caracteres');
        return [];
      }

    try {
      console.log('🔍 Buscando sugerencias:', query);
      
      // Separar los términos de búsqueda para búsquedas más inteligentes
      const searchTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      console.log('🔍 Términos de búsqueda procesados:', searchTerms);
      
      // Si hay múltiples términos, intentar primero una búsqueda exacta
      if (searchTerms.length > 1) {
        console.log('🔍 Intentando búsqueda con múltiples términos primero');
        
        // Estrategia 1: Buscar coincidencia exacta con la consulta completa
        const headers = await this.getAuthHeaders();
        const exactMatchUrl = `${API_URL}/users/search?q=${encodeURIComponent(query)}&exact=true`;
        
        try {
          const exactMatchResponse = await fetch(exactMatchUrl, { headers });
          if (exactMatchResponse.ok) {
            const exactMatches = await exactMatchResponse.json();
            if (Array.isArray(exactMatches) && exactMatches.length > 0) {
              console.log(`✅ Encontradas ${exactMatches.length} coincidencias exactas`);
              return exactMatches;
            }
            console.log('ℹ️ No se encontraron coincidencias exactas, intentando búsqueda amplia');
          }
        } catch (error) {
          console.error('❌ Error en búsqueda exacta:', error);
        }
        
        // Estrategia 2: Búsqueda con términos combinados (nombre + apellido)
        try {
          // Intentar buscar coincidencias donde el primer término sea el nombre y el segundo apellido
          const combinedSearchUrl = `${API_URL}/users/suggestions?firstName=${encodeURIComponent(searchTerms[0])}&lastName=${encodeURIComponent(searchTerms.slice(1).join(' '))}`;
          
          const combinedResponse = await fetch(combinedSearchUrl, { headers });
          if (combinedResponse.ok) {
            const combinedMatches = await combinedResponse.json();
            if (Array.isArray(combinedMatches) && combinedMatches.length > 0) {
              console.log(`✅ Encontradas ${combinedMatches.length} coincidencias con búsqueda de nombre+apellido`);
              return combinedMatches;
            }
            console.log('ℹ️ No se encontraron coincidencias con búsqueda nombre+apellido');
          }
        } catch (error) {
          console.error('❌ Error en búsqueda combinada:', error);
        }
      }
      
      // Estrategia 3: Caer de vuelta a la búsqueda estándar
      console.log('🔍 Ejecutando búsqueda estándar de sugerencias');
      
      const headers = await this.getAuthHeaders();
      const url = `${API_URL}/users/suggestions?q=${encodeURIComponent(query)}`;
      
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || `Error ${response.status}`);
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        console.warn('⚠️ Las sugerencias no son un array:', data);
        return [];
      }
      
      console.log(`✅ Encontradas ${data.length} sugerencias`);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener sugerencias:', error);
      return [];
    }
  }

  static async getActiveClients(): Promise<FirebaseUser[]> {
    try {
      console.log('🔍 Obteniendo clientes activos...');
      const response = await this.fetchWithErrorHandling(
        `${API_URL}/users/all`,
        {
          method: 'GET'
        }
      );

      if (!Array.isArray(response)) {
        console.error('❌ La respuesta no es un array:', response);
        return [];
      }

      console.log('📦 Datos sin procesar:', response);

      // Función auxiliar para procesar referencias
      const processReference = (ref: any): { path: string; id: string } => {
        if (!ref) return { path: '', id: '' };
        
        // Si ya viene en el formato correcto
        if (typeof ref === 'object' && ref.path && ref.id) {
          return ref;
        }
        
        // Si es un string (formato /collection/id)
        if (typeof ref === 'string') {
          // Limpiar la referencia de espacios y slashes extras
          const cleanRef = ref.trim().replace(/^\/+|\/+$/g, '');
          const parts = cleanRef.split('/');
          
          // Si tiene el formato /collection/id
          if (parts.length === 2) {
            return {
              path: `/${parts[0]}/${parts[1]}`,
              id: parts[1]
            };
          }
          
          // Si solo viene el ID
          if (parts.length === 1) {
            const collection = ref.includes('branch') ? 'branches' :
                              ref.includes('plan') ? 'plans' :
                              ref.includes('type') ? 'typeUsers' :
                              ref.includes('wallet') ? 'wallets' : '';
            return {
              path: `/${collection}/${parts[0]}`,
              id: parts[0]
            };
          }
        }
        
        // Si es un objeto pero no tiene el formato esperado
        if (typeof ref === 'object') {
          const id = ref.id || ref._id || '';
          const path = ref.path || ref._path || '';
          if (id || path) {
            return {
              path: path || `/unknown/${id}`,
              id: id || path.split('/').pop() || ''
            };
          }
        }
        
        return { path: '', id: '' };
      };

      // Procesar el estado de la cuenta correctamente para cada usuario
      const processAccountStatus = (user: any): boolean => {
        // Si es booleano, usar directamente
        if (typeof user.accountStatus === 'boolean') {
          return user.accountStatus;
        }
        
        // Si es string, verificar valores conocidos
        if (typeof user.accountStatus === 'string') {
          return ['true', '1', 'active', 'activo'].includes(user.accountStatus.toLowerCase());
        }
        
        // Si es numérico, 1 es verdadero, 0 es falso
        if (typeof user.accountStatus === 'number') {
          return user.accountStatus === 1;
        }
        
        // Verificar account_status (snake_case)
        if (user.account_status !== undefined) {
          if (typeof user.account_status === 'boolean') {
            return user.account_status;
          }
          if (typeof user.account_status === 'string') {
            return ['true', '1', 'active', 'activo'].includes(user.account_status.toLowerCase());
          }
          if (typeof user.account_status === 'number') {
            return user.account_status === 1;
          }
        }
        
        // Si no hay información clara, asumir activo
        return true;
      };

      // Filtrar solo usuarios activos y mapear los datos
      const activeClients = response
        .filter(user => processAccountStatus(user))
        .map(user => {
          console.log('Procesando usuario:', user.firstName, user.lastName);
          console.log('Referencias originales:', {
            branch: user.branchReference,
            plan: user.subscriptionPlan,
            type: user.typeUserReference,
            wallet: user.walletReference
          });

          const processedUser = {
            id: user.userId || user.id || '',
            email: user.email || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Sin nombre',
            role: user.role || '',
            company: user.company || '',
            phoneNumber: user.phone || '',
            address: user.address || '',
            city: user.city || '',
            country: user.country || '',
            status: user.status || 'active',
            accountStatus: processAccountStatus(user),
            personType: user.personType || 'natural',
            assignedLocker: user.assignedLocker || '',
            birthDate: user.birthDate || '',
            // Procesar todas las referencias
            branchReference: processReference(user.branchReference),
            subscriptionPlan: processReference(user.subscriptionPlan),
            typeUserReference: processReference(user.typeUserReference),
            walletReference: processReference(user.walletReference),
            isEmailVerified: user.isEmailVerified || false,
            isVerified: user.isVerified || false,
            photo: user.photo || '',
            planRate: user.planRate || 0,
            walletName: user.walletName || 'Mi Billetera',
            walletAmount: user.walletAmount || 0,
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || new Date().toISOString(),
            lastLoginAt: user.lastLoginAt || '',
            lastSeen: user.lastSeen || '',
            price: user.price || 0,
            displayMessage: user.displayMessage || ''
          };

          console.log('Referencias procesadas:', {
            branch: processedUser.branchReference,
            plan: processedUser.subscriptionPlan,
            type: processedUser.typeUserReference,
            wallet: processedUser.walletReference
          });

          return processedUser;
        });

      console.log('✅ Clientes activos procesados:', activeClients);
      return activeClients;
    } catch (error) {
      console.error('Error al obtener clientes activos:', error);
      return [];
    }
  }

  // Funciones auxiliares para obtener nombres basados en referencias
  static async getBranchName(branchId: string): Promise<BranchInfo> {
    console.log('UsersService.getBranchName - Iniciando con branchId:', branchId);
    
    if (!branchId) {
      console.error('UsersService.getBranchName - No se proporcionó branchId');
      return {
        id: '',
        name: 'Sin Sucursal',
        shortName: 'N/A',
        address: '',
        location: 'No especificada',
        province: '',
        phone: '',
        error: 'No se proporcionó ID de sucursal'
      };
    }

    // Limpiar el branchId si viene con formato de referencia
    let cleanBranchId = branchId;
    if (branchId.includes('/branches/')) {
      cleanBranchId = branchId.split('/branches/')[1];
    }
    console.log('UsersService.getBranchName - cleanBranchId:', cleanBranchId);

    // Obtener el token
    const token = getCookie('workexpress_token');
    if (!token) {
      console.error('UsersService.getBranchName - No hay token de autenticación');
      return {
        id: cleanBranchId,
        name: 'Error de Autenticación',
        shortName: 'Error',
        address: '',
        location: 'No disponible',
        province: '',
        phone: '',
        error: 'No hay token de autenticación'
      };
    }

    try {
      console.log('UsersService.getBranchName - Obteniendo branch:', cleanBranchId);
      console.log('UsersService.getBranchName - URL:', `${API_URL}/branches/${cleanBranchId}`);
      
      const response = await fetch(`${API_URL}/branches/${cleanBranchId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`UsersService.getBranchName - Error HTTP ${response.status}:`, errorText);
        return {
          id: cleanBranchId,
          name: `Error: ${response.statusText}`,
          shortName: 'Error',
          address: '',
          location: 'No disponible',
          province: '',
          phone: '',
          error: `Error al obtener información de la sucursal: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('UsersService.getBranchName - Datos obtenidos:', data);
      
      return {
        id: data.id,
        name: data.name,
        shortName: data.shortName || data.name,
        address: data.address || '',
        location: data.location || '',
        province: data.province || '',
        phone: data.phone || ''
      };
    } catch (error) {
      console.error('UsersService.getBranchName - Error:', error);
      return {
        id: cleanBranchId,
        name: 'Error al cargar sucursal',
        shortName: 'Error',
        address: '',
        location: 'No disponible',
        province: '',
        phone: '',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  private static async getPlanName(planId: string): Promise<PlanInfo> {
    try {
      if (!planId) {
        console.log('📋 No se proporcionó ID de plan');
        return {
          id: '',
          planName: 'Sin plan',
          price: 0,
          description: 'No especificado'
        };
      }

      // Limpiar el ID del plan (remover /plans/ si existe)
      let cleanPlanId: string;
      if (typeof planId === 'string') {
        // Si es string, usamos split para extraer el ID
        cleanPlanId = planId.includes('/plans/') ? (planId.split('/plans/').pop() || '') : planId;
      } else if (typeof planId === 'object' && planId !== null) {
        // Si es un objeto, intentamos obtener el ID directamente
        const planObject = planId as { id?: string; path?: string };
        cleanPlanId = planObject.id || (planObject.path ? (planObject.path.split('/').pop() || '') : String(planId));
      } else {
        // Si no es string ni objeto, usamos el valor tal cual como string
        cleanPlanId = String(planId);
      }

      // Obtener el token de la cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];
      
      if (!token) {
        console.error('No hay token de autenticación');
        return {
          id: cleanPlanId,
          planName: 'No disponible',
          price: 0,
          description: 'No disponible'
        };
      }

      console.log('📋 Obteniendo información del plan:', {
        originalId: planId,
        cleanId: cleanPlanId
      });

      const response = await fetch(`${API_URL}/plans/${cleanPlanId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Error en la respuesta:', response.status, response.statusText);
        return {
          id: cleanPlanId,
          planName: 'Error al cargar',
          price: 0,
          description: 'No disponible'
        };
      }

      const data = await response.json();
      
      if (!data) {
        return {
          id: cleanPlanId,
          planName: 'Sin datos',
          price: 0,
          description: 'No disponible'
        };
      }

      return {
        id: cleanPlanId,
        planName: data.planName || 'No especificado',
        price: data.price || 0,
        description: data.description || 'No especificado'
      };
    } catch (error) {
      console.error('❌ Error al obtener información del plan:', {
        planId,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
      
      return {
        id: planId,
        planName: 'Error de conexión',
        price: 0,
        description: 'No disponible'
      };
    }
  }

  static async getPlanRate(planId: string): Promise<{ price: number }> {
    try {
      const response = await this.fetchWithErrorHandling(
        `${API_URL}/plans/${planId}`,
        { method: 'GET' }
      );
      return { price: response.price || 0 };
    } catch (error) {
      console.error('Error al obtener tarifa del plan:', error);
      return { price: 0 };
    }
  }

  static async searchUser(query: string): Promise<FirebaseUser | null> {
    try {
      if (!query || query.trim() === '') {
        console.warn('⚠️ Búsqueda vacía');
        return null;
      }
      
      console.log('🔍 Buscando usuario por ID o email:', query);
      
      // Verificar si es un UUID
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);
      
      let endpoint;
      let method;
      let body;
      
      if (isUUID) {
        // Búsqueda directa por ID
        endpoint = `${API_URL}/users/${query}`;
        method = 'GET';
      } else {
        // Búsqueda por email o nombre
        endpoint = `${API_URL}/users/search`;
        method = 'POST';
        body = JSON.stringify({ 
          query,
          searchType: 'exact',
          fields: ['email', 'firstName', 'lastName']
        });
      }
      
      // Obtener el token de autenticación
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];

      if (!token) {
        console.error('No hay token de autenticación');
        return null;
      }

      console.log(`🔍 Consultando endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: method === 'POST' ? body : undefined,
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Si no encontramos el usuario, intentar buscar en sugerencias
        if (response.status === 404 && !isUUID) {
          console.log(`⚠️ Usuario no encontrado por búsqueda directa. Intentando con sugerencias...`);
          const suggestions = await this.searchSuggestions(query);
          
          if (suggestions && suggestions.length > 0) {
            // Tomar el primer resultado de las sugerencias
            console.log(`✅ Usuario encontrado en sugerencias: ${suggestions[0].email}`);
            return suggestions[0];
          }
        }
        
        // Si no es un error 404 o no encontramos nada en sugerencias
        const errorData: ApiError = await response.json();
        console.error(`❌ Error en searchUser: ${errorData.message}`, errorData);
        
        return null;
      }
      
      const data = await response.json();
      
      // Si no hay datos, devolver null
      if (!data || !data.user) {
        console.log(`ℹ️ No se encontraron usuarios que coincidan con: ${query}`);
        return null;
      }
      
      console.log(`🔄 Mapeando usuario de Prisma a formato Firebase:`, data.user);
      
      // Mapear los datos del usuario a FirebaseUser
      const user: FirebaseUser = await this.getUserDetails(data.user.userId || data.user.id);
      
      console.log(`✅ Usuario encontrado:`, { id: user.id, email: user.email });
      return user;
    } catch (error) {
      console.error(`❌ Error en searchUser:`, error);
      return null;
    }
  }

  static async getAllUsers(): Promise<FirebaseUser[]> {
    try {
      console.log('🔍 Obteniendo usuarios...');
      const response = await fetch(`${API_URL}/users/all`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }

      const users = await response.json();
      console.log('✅ Usuarios obtenidos:', users.length);
      
      // DIAGNÓSTICO DE ESTADO DE CUENTA
      console.log('🔍 Datos de estado de cuenta en respuesta:', users.slice(0, 5).map((user: any) => {
        const statusFields = Object.entries(user).filter(([key]) => 
          key.toLowerCase().includes('status') || 
          key.toLowerCase().includes('active')
        );
        
        return {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          estado_campos: statusFields.map(([key, value]) => ({
            campo: key,
            valor: value,
            tipo: typeof value
          }))
        };
      }));
      
      // Añadimos una normalización uniforme de accountStatus antes de devolver los usuarios
      return users.map((user: any) => {
        // MODIFICACIÓN CRÍTICA: Priorizar account_status (campo de la base de datos)
        // sobre accountStatus (campo derivado/generado)
        let accountStatus = true; // Por defecto activo si no se puede determinar
        
        // 1. Verificar primero account_status (snake_case) - PRIORIDAD MÁXIMA
        if (user.account_status !== undefined) {
          if (typeof user.account_status === 'boolean') {
            accountStatus = user.account_status;
            console.log(`✅ Usuario ${user.email}: account_status booleano encontrado: ${accountStatus}`);
          } else if (typeof user.account_status === 'string') {
            accountStatus = ['true', '1', 'active', 'activo'].includes(user.account_status.toLowerCase());
            console.log(`✅ Usuario ${user.email}: account_status string convertido a: ${accountStatus}`);
          } else if (typeof user.account_status === 'number') {
            accountStatus = user.account_status === 1;
            console.log(`✅ Usuario ${user.email}: account_status numérico convertido a: ${accountStatus}`);
          }
        } 
        // 2. Solo si account_status no existe, usar accountStatus
        else if (typeof user.accountStatus === 'boolean') {
          accountStatus = user.accountStatus;
          console.log(`ℹ️ Usuario ${user.email}: usando accountStatus booleano: ${accountStatus}`);
        } else if (typeof user.accountStatus === 'string') {
          accountStatus = ['true', '1', 'active', 'activo'].includes(user.accountStatus.toLowerCase());
          console.log(`ℹ️ Usuario ${user.email}: usando accountStatus string convertido a: ${accountStatus}`);
        } else if (typeof user.accountStatus === 'number') {
          accountStatus = user.accountStatus === 1;
          console.log(`ℹ️ Usuario ${user.email}: usando accountStatus numérico convertido a: ${accountStatus}`);
        } 
        // 3. Como último recurso, buscar otros campos relacionados
        else if (user.active !== undefined) {
          if (typeof user.active === 'boolean') {
            accountStatus = user.active;
          } else if (typeof user.active === 'string') {
            accountStatus = ['true', '1', 'active', 'activo'].includes(user.active.toLowerCase());
          } else if (typeof user.active === 'number') {
            accountStatus = user.active === 1;
          }
          console.log(`⚠️ Usuario ${user.email}: fallback a campo 'active': ${accountStatus}`);
        } else if (user.status !== undefined && typeof user.status !== 'string') {
          if (typeof user.status === 'boolean') {
            accountStatus = user.status;
          } else if (typeof user.status === 'number') {
            accountStatus = user.status === 1;
          }
          console.log(`⚠️ Usuario ${user.email}: fallback a campo 'status': ${accountStatus}`);
        }
        
        // Actualizamos ambos campos para asegurar consistencia
        user.accountStatus = accountStatus;
        user.account_status = accountStatus;
        
        return user;
      });
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      throw error;
    }
  }

  static async createUser(data: CreateUserDto): Promise<User> {
    try {
      console.log('Datos recibidos en createUser:', data);
      const response = await this.fetchWithErrorHandling(
        `${API_URL}/users`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...data,
            branchReference: data.branchReference || {
              path: `/branches/${data.branchId}`,
              id: data.branchId
            },
            subscriptionPlan: data.subscriptionPlan || {
              path: `/plans/${data.planId}`,
              id: data.planId
            },
            typeUserReference: data.typeUserReference // Ya viene con el formato correcto
          }),
        }
      );

      console.log('Respuesta del servidor:', response);
      return response;
    } catch (error) {
      console.error('Error en createUser:', error);
      throw error;
    }
  }

  static async updateUserStatus(userId: string, status: boolean) {
    console.log('🔄 Actualizando estado del usuario:', { 
      userId, 
      nuevoEstado: status,
      estadoString: status ? 'active' : 'inactive'
    });
    
    try {
      const url = `${API_URL}/users/${userId}/status`;
      console.log('🔗 URL de la petición:', url);
      
      const headers = this.getAuthHeaders();
      console.log('🔑 Headers de autenticación:', {
        tieneAutorizacion: 'Authorization' in headers
      });
      
      const bodyData = { status: status ? 'active' : 'inactive' };
      console.log('📦 Datos del body:', bodyData);
      
      const response = await this.fetchWithErrorHandling(url, {
        method: 'PUT',
        body: JSON.stringify(bodyData)
      });

      console.log('✅ Respuesta del servidor:', response);

      return {
        ...response,
        accountStatus: status
      };
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      throw error;
    }
  }

  static async getUserDetails(userId: string): Promise<FirebaseUser> {
    console.log('🔍 Obteniendo detalles del usuario por ID:', userId);
    
    try {
      const userData = await this.fetchWithErrorHandling(`${API_URL}/users/${userId}`, {
        method: 'GET'
      });

      if (!userData) {
        console.error('Usuario no encontrado con ID:', userId);
        throw new Error('Usuario no encontrado');
      }

      console.log('📦 Datos del usuario recibidos:', userData);
      console.log('📸 Propiedades de foto recibidas directamente del backend:');
      console.log('photo:', JSON.stringify(userData.photo));
      console.log('photoURL:', JSON.stringify(userData.photoURL));
      console.log('avatarUrl:', JSON.stringify(userData.avatarUrl));
      console.log('photoUrl:', JSON.stringify(userData.photoUrl));

      // Diagnóstico detallado de propiedades de fotos
      console.log('======= DIAGNÓSTICO DE PROPIEDADES DE FOTO DEL USUARIO =======');
      console.log('photo:', userData.photo);
      console.log('avatarUrl:', userData.avatarUrl);
      console.log('photoURL:', userData.photoURL);
      console.log('photoUrl:', userData.photoUrl);
      console.log('avatar:', userData.avatar);
      console.log('profileImage:', userData.profileImage);
      console.log('picture:', userData.picture);
      console.log('Tipo de userData.photo:', typeof userData.photo);
      console.log('Tipo de userData.photoURL:', typeof userData.photoURL);
      console.log('Existe photo:', 'photo' in userData);
      console.log('Existe photoURL:', 'photoURL' in userData);
      console.log('=========================================');

      // Diagnóstico detallado de referencias
      console.log('======= DIAGNÓSTICO DE REFERENCIAS =======');
      console.log('branchReference (tipo):', typeof userData.branchReference);
      console.log('branchReference (valor):', userData.branchReference);
      console.log('subscriptionPlan (tipo):', typeof userData.subscriptionPlan);
      console.log('subscriptionPlan (valor):', userData.subscriptionPlan);
      console.log('walletReference (tipo):', typeof userData.walletReference);
      console.log('walletReference (valor):', userData.walletReference);
      console.log('branch (tipo):', typeof userData.branch);
      console.log('branch (valor):', userData.branch);
      console.log('============================================');
      
      // Extraer IDs y verificar si ya tenemos los objetos completos
      let branchId: string | undefined;
      let branchInfo: BranchInfo | null = null;
      let planId: string | undefined;
      let planInfo: PlanInfo | null = null;
      let walletId: string | undefined;
      let walletInfo: WalletInfo | null = null;

      // Extraer IDs de las referencias con manejo mejorado para objetos o strings
      if (typeof userData.branchReference === 'string') {
        branchId = userData.branchReference?.split('/').pop();
      } else if (userData.branchReference?.id) {
        branchId = userData.branchReference.id;
      } else if (userData.branchReference?.path) {
        branchId = userData.branchReference.path.split('/').pop();
      } else {
        branchId = userData.branchId;
      }
      
      // Verificar si subscriptionPlan es un objeto o una cadena
      if (typeof userData.subscriptionPlan === 'string') {
        planId = userData.subscriptionPlan?.split('/').pop();
      } else if (userData.subscriptionPlan?.id) {
        planId = userData.subscriptionPlan.id;
      } else if (userData.subscriptionPlan?.path) {
        planId = userData.subscriptionPlan.path.split('/').pop();
      } else {
        planId = userData.planId;
      }
      
      // Extraer ID de wallet con manejo mejorado
      if (typeof userData.walletReference === 'string') {
        walletId = userData.walletReference?.split('/').pop();
      } else if (userData.walletReference?.id) {
        walletId = userData.walletReference.id;
      } else if (userData.walletReference?.path) {
        walletId = userData.walletReference.path.split('/').pop();
      } else {
        walletId = userData.walletId;
      }

      console.log('🔗 Referencias encontradas:', { branchId, planId, walletId });

      // Verificar si ya tenemos los objetos completos en la respuesta
      if (userData.branch && typeof userData.branch === 'object') {
        console.log('✅ Utilizando objeto branch ya presente en la respuesta');
        branchInfo = {
          id: userData.branch.id,
          name: userData.branch.name,
          shortName: userData.branch.shortName || userData.branch.name,
          address: userData.branch.address || '',
          location: userData.branch.city || '',
          province: userData.branch.province || '',
          phone: userData.branch.phone || ''
        };
      }

      if (userData.subscriptionPlan && typeof userData.subscriptionPlan === 'object') {
        console.log('✅ Utilizando objeto subscriptionPlan ya presente en la respuesta');
        planInfo = {
          id: userData.subscriptionPlan.id,
          planName: userData.subscriptionPlan.name || userData.planName || 'Plan Estándar',
          name: userData.subscriptionPlan.name,
          price: userData.subscriptionPlan.price || 0,
          description: userData.subscriptionPlan.description || 'No especificado'
        };
      }

      // Solo hacer llamadas API si no tenemos los objetos completos
      const promises = [];

      if (!branchInfo && branchId) {
        promises.push(this.getBranchName(branchId));
      } else {
        promises.push(Promise.resolve(branchInfo));
      }

      if (!planInfo && planId) {
        promises.push(this.getPlanName(planId));
      } else {
        promises.push(Promise.resolve(planInfo));
      }

      if (walletId) {
        promises.push(this.getWalletInfo(walletId));
      } else {
        promises.push(Promise.resolve(null));
      }

      // Obtener información adicional solo si es necesario
      const [fetchedBranchInfo, fetchedPlanInfo, fetchedWalletInfo] = await Promise.all(promises) as [BranchInfo | null, PlanInfo | null, WalletInfo | null];
      
      branchInfo = branchInfo || fetchedBranchInfo;
      planInfo = planInfo || fetchedPlanInfo;
      walletInfo = fetchedWalletInfo;

      // Generar un nombre completo para el usuario
      const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      
      // Crear un avatar predeterminado en caso de no tener foto
      const defaultAvatar = `https://api.dicebear.com/6.x/personas/svg?seed=${encodeURIComponent(userId)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
      
      // Determinar la foto final explícitamente para depuración
      let finalPhoto = null;
      if (userData.photo && typeof userData.photo === 'string' && userData.photo.trim() !== '') {
        finalPhoto = userData.photo;
        console.log('✅ Usando photo:', finalPhoto);
      } else if (userData.photoURL && typeof userData.photoURL === 'string' && userData.photoURL.trim() !== '') {
        finalPhoto = userData.photoURL;
        console.log('✅ Usando photoURL:', finalPhoto);
      } else if (userData.avatarUrl && typeof userData.avatarUrl === 'string' && userData.avatarUrl.trim() !== '') {
        finalPhoto = userData.avatarUrl;
        console.log('✅ Usando avatarUrl:', finalPhoto);
      } else if (userData.photoUrl && typeof userData.photoUrl === 'string' && userData.photoUrl.trim() !== '') {
        finalPhoto = userData.photoUrl;
        console.log('✅ Usando photoUrl:', finalPhoto);
      } else if (userData.avatar && typeof userData.avatar === 'string' && userData.avatar.trim() !== '') {
        finalPhoto = userData.avatar;
        console.log('✅ Usando avatar:', finalPhoto);
      } else if (userData.profileImage && typeof userData.profileImage === 'string' && userData.profileImage.trim() !== '') {
        finalPhoto = userData.profileImage;
        console.log('✅ Usando profileImage:', finalPhoto);
      } else if (userData.picture && typeof userData.picture === 'string' && userData.picture.trim() !== '') {
        finalPhoto = userData.picture;
        console.log('✅ Usando picture:', finalPhoto);
      } else {
        finalPhoto = defaultAvatar;
        console.log('✅ Usando avatar predeterminado:', finalPhoto);
      }

      console.log('✅ Foto final elegida:', finalPhoto);

      const user: FirebaseUser = {
        ...userData,
        userId: userData.userId || userData.id,
        accountStatus: typeof userData.accountStatus === 'boolean' ? userData.accountStatus : userData.accountStatus === 'active',
        personType: userData.personType || 'natural',
        // Información de la sucursal
        branchName: branchInfo?.name || userData.branchName || 'No asignada',
        branchReference: userData.branchReference || '',
        branchLocation: branchInfo?.location || userData.branchLocation || 'No especificada',
        branchAddress: branchInfo?.address || userData.branchAddress || 'No especificada',
        branchProvince: branchInfo?.province || '',
        branchPhone: branchInfo?.phone || '',
        // Información del plan
        subscriptionPlan: userData.subscriptionPlan || '',
        planName: planInfo?.planName || planInfo?.name || userData.planName || 'No especificado',
        planRate: planInfo?.price || userData.planRate || 0,
        // Información de la billetera
        walletReference: userData.walletReference || '',
        walletName: walletInfo?.name || userData.walletName || 'No especificada',
        walletAmount: walletInfo?.amount || 0,
        // Otros campos
        isEmailVerified: userData.isEmailVerified || false,
        isVerified: userData.isVerified || false,
        // Asignar la foto procesada
        photo: finalPhoto,
        lastLoginAt: userData.lastLoginAt || '',
        lastSeen: userData.lastSeen || '',
        price: planInfo?.price || 0,
        displayMessage: userData.displayMessage || ''
      };
      
      console.log('👤 Usuario procesado por ID:', user);
      console.log('👤 Foto final después de asignación:', user.photo);
      
      return user;
    } catch (error) {
      console.error('❌ Error al obtener detalles del usuario por ID:', error);
      throw error;
    }
  }

  static async registerPayment(invoiceId: string, amount: number) {
    if (!API_URL) {
      throw new Error('URL del API no configurada');
    }

    console.log('💰 Registrando pago:', { invoiceId, amount });
    
    return this.fetchWithErrorHandling(`${API_URL}/payments/invoices/${invoiceId}`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  }

  static async getBranches(): Promise<any[]> {
    return this.fetchWithErrorHandling(`${API_URL}/branches`, {
      method: 'GET'
    });
  }

  static async getPlans(): Promise<any[]> {
    console.log('🔍 Obteniendo planes...');
    const url = `${API_URL}/plans`;
    console.log('🔍 URL:', url);
    
    try {
      const plans = await this.fetchWithErrorHandling(url, {
        method: 'GET'
      });

      console.log('📦 Planes sin procesar:', plans);
      
      // Asegurarnos de que los datos estén completos y bien formateados
      const processedPlans = plans.map((plan: any) => {
        // Asegurarnos de que el ID no incluya el prefijo '/plans/'
        const cleanId = plan.id?.startsWith('/plans/') ? plan.id.split('/').pop() : plan.id;
        
        return {
          id: cleanId,
          planName: plan.planName || plan.name || 'Plan Sin Nombre',
          description: plan.description || '',
          price: parseFloat(plan.price) || 0,
          isActive: Boolean(plan.isActive),
          branchReference: plan.branchReference || '',
          branch: plan.branch || null,
          // Agregar campos adicionales que puedan ser útiles
          features: plan.features || [],
          maxUsers: plan.maxUsers || 0,
          maxBranches: plan.maxBranches || 0
        };
      });

      console.log('📦 Planes procesados:', processedPlans);
      return processedPlans;
    } catch (error) {
      console.error('❌ Error al obtener planes:', error);
      throw error;
    }
  }

  public static async getWalletInfo(walletId: string) {
    try {
      if (!walletId) {
        console.log('💰 No se proporcionó ID de billetera');
        return null;
      }

      // Obtener el token de la cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];
      
      if (!token) {
        console.error('No hay token de autenticación');
        return null;
      }

      console.log('💰 Obteniendo información de billetera:', {
        walletId,
        url: `${API_URL}/wallets/${walletId}`,
        hasToken: !!token
      });

      const response = await fetch(`${API_URL}/wallets/${walletId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Error en la respuesta:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error detallado:', errorText);
        return null;
      }

      const data = await response.json();
      console.log('💰 Datos de billetera recibidos:', data);
      
      return {
        name: data?.name || 'No especificada',
        amount: parseFloat(data?.amount) || 0,
        currency: data?.currency || 'USD'
      };
    } catch (error) {
      console.error('❌ Error al obtener información de billetera:', error);
      return null;
    }
  }

  static async getTypeUsers(): Promise<TypeUser[]> {
    try {
      console.log('🔍 Iniciando petición para obtener tipos de usuario');
      const url = `${API_URL}/users/types`;
      console.log('URL de la petición:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...this.getAuthHeaders()
        },
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('❌ Error en la respuesta:', response.status, response.statusText);
        const errorData = await response.text();
        console.error('Detalles del error:', errorData);
        throw new Error('Error al obtener tipos de usuario');
      }

      const data = await response.json();
      console.log('✅ Datos recibidos:', data);

      if (!data || !Array.isArray(data)) {
        console.error('❌ Respuesta inválida:', data);
        return [];
      }

      const processedTypes = data.map(type => ({
        id: type.id || '',
        name: type.name || 'Sin nombre',
        description: type.description || '',
        isActive: type.isActive !== false,
        createdAt: type.createdAt || new Date().toISOString(),
        updatedAt: type.updatedAt || new Date().toISOString()
      }));

      console.log('✅ Tipos de usuario procesados:', processedTypes);
      return processedTypes;
    } catch (error) {
      console.error('Error al obtener tipos de usuario:', error);
      return [];
    }
  }

  async getUsers(): Promise<FirebaseUser[]> {
    try {
      const response = await fetch('http://localhost:3001/api/v1/firebase/database/users');
      if (!response.ok) {
        throw new Error('Error al obtener los usuarios');
      }
      return response.json();
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  }
}

// Helper function para extraer IDs de referencias
export function getRefId(ref: { path: string; id: string } | string | undefined): string {
  if (!ref) return '';
  if (typeof ref === 'object' && 'id' in ref) return ref.id;
  if (typeof ref === 'string') return ref.split('/').pop() || '';
  return '';
}

export default new UsersService();