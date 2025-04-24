'use client';

import { API_URL } from '@/app/config';
import { AuthService } from './auth.service';
import { OperatorsService, Operator } from './operators.service';

export interface OperatorType {
  id: string;
  name: string;
  description?: string;
  permissions?: Record<string, boolean>;
  created_at: Date;
  updated_at?: Date;
}

interface CreateOperatorTypeDto {
  name: string;
  description?: string;
  permissions?: Record<string, boolean>;
}

interface UpdateOperatorTypeDto {
  name?: string;
  description?: string;
  permissions?: Record<string, boolean>;
}

export class OperatorTypesService {
  private static getHeaders() {
    const token = AuthService.getToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  static async getOperatorTypes(): Promise<OperatorType[]> {
    try {
      const response = await fetch(`${API_URL}/operator-types`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener los tipos de operadores');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching operator types:', error);
      throw error;
    }
  }

  static async getOperatorType(id: string): Promise<OperatorType> {
    try {
      const response = await fetch(`${API_URL}/operator-types/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al obtener el tipo de operador');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching operator type with id ${id}:`, error);
      throw error;
    }
  }

  static async createOperatorType(data: CreateOperatorTypeDto): Promise<OperatorType> {
    try {
      const response = await fetch(`${API_URL}/operator-types`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al crear el tipo de operador');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating operator type:', error);
      throw error;
    }
  }

  static async updateOperatorType(id: string, data: UpdateOperatorTypeDto): Promise<OperatorType> {
    try {
      const response = await fetch(`${API_URL}/operator-types/${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar el tipo de operador');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating operator type with id ${id}:`, error);
      throw error;
    }
  }

  static async deleteOperatorType(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/operator-types/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar el tipo de operador');
      }
    } catch (error) {
      console.error(`Error deleting operator type with id ${id}:`, error);
      throw error;
    }
  }

  static async getOperatorPermissions(operatorId?: string): Promise<Record<string, boolean>> {
    let operator: Operator | null = null;
    try {
      // If operatorId is provided, fetch the full operator data
      if (operatorId) {
        console.log(`🔍 Obteniendo datos completos del operador con ID: ${operatorId}`);
        operator = await OperatorsService.getOperator(operatorId);
      } else {
        // Otherwise, get data from localStorage via AuthService
        console.log('🔍 Obteniendo datos del operador desde AuthService');
        const authServiceOperator = AuthService.getOperatorData();
        // Map the result from AuthService to match the Operator type from OperatorsService
        if (authServiceOperator) {
          operator = {
            // Ensure all required fields from OperatorsService.Operator are mapped
            operatorId: authServiceOperator.id, // Map id to operatorId
            email: authServiceOperator.email,
            firstName: authServiceOperator.firstName || authServiceOperator.first_name || '',
            lastName: authServiceOperator.lastName || authServiceOperator.last_name || '',
            role: authServiceOperator.role,
            status: authServiceOperator.status || 'unknown', // Add status if missing
            createdAt: authServiceOperator.createdAt || new Date(), // Add createdAt if missing
            // Map other potentially relevant fields, ensuring compatibility
            branchReference: authServiceOperator.branchReference,
            branchName: authServiceOperator.branchName,
            // Revert to simpler assignment as target type allows null
            type_operator_id: authServiceOperator.type_operator_id || authServiceOperator.typeOperatorId,
            photo: authServiceOperator.photo,
            phone: authServiceOperator.phone ?? undefined,
            // Add other fields from OperatorsService.Operator definition as needed, 
            // using undefined or default values if not available in AuthService.Operator
            branchAddress: undefined,
            branchProvince: undefined,
            branchCity: undefined,
            typeOperatorName: undefined,
            updatedAt: authServiceOperator.updatedAt,
            lastLoginAt: authServiceOperator.lastLoginAt,
            // Remove properties not present in authServiceOperator
            // birth_date: authServiceOperator.birth_date,
            // hire_date: authServiceOperator.hire_date,
            // personal_id: authServiceOperator.personal_id,
            // address: authServiceOperator.address,
            emergency_contact: undefined, // Map if available
            skills: undefined, // Map if available
          };
        } else {
          operator = null;
        }
      }
      
      console.log('👤 Operador para permisos:', operator);

      // If no operator data could be obtained, return basic permissions
      if (!operator) {
        console.log('⚠️ No se pudo obtener información del operador, asignando permisos básicos');
        return { home: true };
      }
      
      // Now 'operator' is guaranteed to be of type Operator (or was handled if null)
      
      // If operator is admin, return all permissions as true
      if (operator?.role?.toLowerCase() === 'admin' || 
          operator?.role?.toLowerCase().includes('admin')) {
        console.log('✅ Usuario es administrador, todos los permisos concedidos');
        return {
          home: true,
          tracking: true,
          billing: true,
          invoices: true,
          clients: true,
          operators: true,
          operator_types: true,
          plans: true,
          branches: true,
          emails: true,
        };
      }

      // Verificar type_operator_id en todas las posibles propiedades
      // Use only type_operator_id as typeOperatorId doesn't exist on the Operator type
      const typeOperatorId = operator?.type_operator_id;
      console.log('🔍 ID del tipo de operador:', typeOperatorId);

      // If operator has no type_operator_id, return basic permissions
      if (!typeOperatorId) {
        console.log('⚠️ Usuario no tiene type_operator_id, asignando permisos básicos');
        return {
          home: true,
          // Si el rol incluye "gerente", dar acceso a algunas secciones básicas
          // Now operator is of type Operator, role exists
          ...(operator?.role?.toLowerCase().includes('gerente') ? {
            tracking: true,
            billing: true,
            invoices: true,
            clients: true,
            branches: true,
          } : {})
        };
      }

      // Check if the typeOperatorId is the placeholder UUID
      if (typeOperatorId === '3fa85f64-5717-4562-b3fc-2c963f66afa6') {
        console.log('⚠️ ID del tipo de operador es un placeholder, asignando permisos básicos');
        return {
          home: true,
          // Si el rol incluye "gerente", dar acceso a algunas secciones básicas
          // Now operator is of type Operator, role exists
          ...(operator?.role?.toLowerCase().includes('gerente') ? {
            tracking: true,
            billing: true,
            invoices: true,
            clients: true,
            branches: true,
          } : {})
        };
      }

      // Get operator type permissions
      try {
        console.log('🔍 Obteniendo tipo de operador con ID:', typeOperatorId);
        const operatorType = await this.getOperatorType(typeOperatorId);
        console.log('📋 Tipo de operador obtenido:', operatorType);
        
        // Corregir posibles errores en los nombres de los permisos
        const permissions = operatorType.permissions || {};
        
        // Corregir "traking" a "tracking" si existe
        if (permissions.traking && !permissions.tracking) {
          permissions.tracking = permissions.traking;
        }
        
        console.log('🔑 Permisos finales:', permissions);
        return permissions;
      } catch (error) {
        console.error('❌ Error al obtener tipo de operador:', error);
        // Si hay un error al obtener el tipo de operador, asignar permisos básicos
        return {
          home: true,
          // Si el rol incluye "gerente", dar acceso a algunas secciones básicas
          // Now operator is of type Operator, role exists
          ...(operator?.role?.toLowerCase().includes('gerente') ? {
            tracking: true,
            billing: true,
            invoices: true,
            clients: true,
            branches: true,
          } : {})
        };
      }
    } catch (error) {
      console.error('❌ Error al obtener permisos:', error);
      // Devolver permisos básicos en caso de error
      return {
        home: true
      };
    }
  }
} 