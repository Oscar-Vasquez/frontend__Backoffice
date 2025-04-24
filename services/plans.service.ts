import { Plan } from "@/types/plans";
import { ApiResponse } from "@/types/api-response";

interface CreatePlanDto {
  planName: string;
  description: string;
  price: number;
  branchReference: string;
}

interface UpdatePlanDto extends Partial<CreatePlanDto> {}

export class PlansService {
  private readonly apiUrl: string;
  
  constructor() {
    this.apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/plans`;
  }

  // Obtener los headers con el token actualizado en cada llamada
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('workexpress_token') || localStorage.getItem('token');
    
    if (!token) {
      console.warn('No se encontró token de autenticación en localStorage');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  async getAll(): Promise<Plan[]> {
    try {
      const response = await fetch(this.apiUrl, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada o no autorizada. Por favor inicie sesión nuevamente.');
        }
        throw new Error('Error al cargar los planes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en PlansService.getAll:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Plan> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada o no autorizada. Por favor inicie sesión nuevamente.');
        }
        throw new Error(`Error al cargar el plan con ID ${id}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error en PlansService.getById(${id}):`, error);
      throw error;
    }
  }

  async create(planData: CreatePlanDto): Promise<Plan> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(planData)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada o no autorizada. Por favor inicie sesión nuevamente.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el plan');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en PlansService.create:', error);
      throw error;
    }
  }

  async update(id: string, planData: UpdatePlanDto): Promise<Plan> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(planData)
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada o no autorizada. Por favor inicie sesión nuevamente.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el plan');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error en PlansService.update(${id}):`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesión expirada o no autorizada. Por favor inicie sesión nuevamente.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar el plan');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error en PlansService.delete(${id}):`, error);
      throw error;
    }
  }
  
  async getByBranch(branchReference: string): Promise<Plan[]> {
    try {
      // Normalizar el formato de la referencia de la sucursal
      const formattedBranchRef = branchReference.startsWith('/branches/') 
        ? branchReference 
        : `/branches/${branchReference}`;
        
      // Obtenemos todos los planes y filtramos por sucursal en el cliente
      const allPlans = await this.getAll();
      return allPlans.filter(plan => plan.branchReference === formattedBranchRef);
    } catch (error) {
      console.error(`Error en PlansService.getByBranch(${branchReference}):`, error);
      throw error;
    }
  }
} 