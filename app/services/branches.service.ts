import { getCookie } from 'cookies-next';

export interface Branch {
  id: string;
  name: string;
  address?: string;
  province?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  prefix?: string;
  company_id?: string;
  manager_name?: string;
  opening_hours?: string;
  timezone?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface CreateBranchDto {
  name: string;
  address?: string;
  province?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  prefix?: string;
  company_id?: string;
  manager_name?: string;
  opening_hours?: string;
  timezone?: string;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  province?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  prefix?: string;
  company_id?: string;
  manager_name?: string;
  opening_hours?: string;
  timezone?: string;
}

export class BranchesService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  private static async getAuthHeaders() {
    const token = getCookie('workexpress_token');

    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getBranches(): Promise<Branch[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      console.log('🔄 Obteniendo sucursales...');
      
      const response = await fetch(`${this.API_URL}/branches`, {
        method: 'GET',
        headers,
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/auth/login';
          throw new Error('No autenticado');
        }
        throw new Error(`Error al obtener sucursales: ${response.status}`);
      }

      const data = await response.json();
      
      // Mapear fechas a objetos Date
      return data.map((branch: any) => ({
        ...branch,
        created_at: branch.created_at ? new Date(branch.created_at) : new Date(),
        updated_at: branch.updated_at ? new Date(branch.updated_at) : undefined
      }));
    } catch (error) {
      console.error('❌ Error al obtener sucursales:', error);
      throw error;
    }
  }

  static async getBranch(id: string): Promise<Branch> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.API_URL}/branches/${id}`, {
        method: 'GET',
        headers,
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/auth/login';
          throw new Error('No autenticado');
        }
        throw new Error(`Error al obtener sucursal: ${response.status}`);
      }

      const branch = await response.json();
      
      return {
        ...branch,
        created_at: branch.created_at ? new Date(branch.created_at) : new Date(),
        updated_at: branch.updated_at ? new Date(branch.updated_at) : undefined
      };
    } catch (error) {
      console.error(`❌ Error al obtener sucursal ${id}:`, error);
      throw error;
    }
  }

  static async createBranch(data: CreateBranchDto): Promise<Branch> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.API_URL}/branches`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/auth/login';
          throw new Error('No autenticado');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al crear sucursal: ${response.status}`);
      }

      const branch = await response.json();
      
      return {
        ...branch,
        created_at: branch.created_at ? new Date(branch.created_at) : new Date(),
        updated_at: branch.updated_at ? new Date(branch.updated_at) : undefined
      };
    } catch (error) {
      console.error('❌ Error al crear sucursal:', error);
      throw error;
    }
  }

  static async updateBranch(id: string, data: UpdateBranchDto): Promise<Branch> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.API_URL}/branches/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/auth/login';
          throw new Error('No autenticado');
        }
        throw new Error(`Error al actualizar sucursal: ${response.status}`);
      }

      const branch = await response.json();
      
      return {
        ...branch,
        created_at: branch.created_at ? new Date(branch.created_at) : new Date(),
        updated_at: branch.updated_at ? new Date(branch.updated_at) : undefined
      };
    } catch (error) {
      console.error(`❌ Error al actualizar sucursal ${id}:`, error);
      throw error;
    }
  }

  static async deleteBranch(id: string): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.API_URL}/branches/${id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/auth/login';
          throw new Error('No autenticado');
        }
        throw new Error(`Error al eliminar sucursal: ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ Error al eliminar sucursal ${id}:`, error);
      throw error;
    }
  }
} 