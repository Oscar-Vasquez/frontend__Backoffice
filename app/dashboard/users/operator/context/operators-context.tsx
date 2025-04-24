'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { OperatorsService, Operator } from '@/app/services/operators.service';

// Definir la interfaz para el usuario mapeado
export interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  dateAdded: Date;
  branchName?: string;
  rawData: Operator;
}

// Definir la interfaz para el contexto
interface OperatorsContextType {
  operators: User[];
  isLoading: boolean;
  error: Error | null;
  refreshOperators: () => Promise<void>;
  updateOperator: (id: string, data: any) => Promise<void>;
  createOperator: (data: any) => Promise<Operator>;
}

// Crear el contexto
const OperatorsContext = createContext<OperatorsContextType | undefined>(undefined);

// Proveedor del contexto
export function OperatorsProvider({ children }: { children: ReactNode }) {
  const [operators, setOperators] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Función para mapear operadores
  const mapOperator = useCallback((operator: Operator): User | null => {
    try {
      // Mapear el rol correctamente para la UI
      let mappedRole = operator.role?.toLowerCase() || 'unknown';
      
      // Si el rol es "gerente_de_sucursal", mapearlo a "Gerente De Sucursal" para la UI
      if (mappedRole === 'gerente_de_sucursal') {
        mappedRole = 'Gerente De Sucursal';
      }
      
      return {
        id: operator.operatorId,
        name: `${operator.firstName} ${operator.lastName}`,
        email: operator.email,
        status: operator.status?.toLowerCase() || 'unknown',
        role: mappedRole,
        dateAdded: operator.createdAt,
        branchName: operator.branchName || undefined,
        rawData: operator,
      };
    } catch (error) {
      console.error("Error al mapear operador:", error);
      return null;
    }
  }, []);

  // Función para cargar operadores
  const loadOperators = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedOperators = await OperatorsService.getOperators();
      
      // Map operators efficiently
      const mapped = fetchedOperators
        .map(mapOperator)
        .filter((user): user is User => user !== null);
      
      setOperators(mapped);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Error desconocido'));
    } finally {
      setIsLoading(false);
    }
  }, [mapOperator]);

  // Función para refrescar operadores
  const refreshOperators = useCallback(async () => {
    await loadOperators();
  }, [loadOperators]);

  // Función para actualizar un operador
  const updateOperator = useCallback(async (id: string, data: any) => {
    try {
      // Realizar la actualización en el backend
      const updatedOperator = await OperatorsService.updateOperator(id, data);

      // Actualizar solo el operador modificado en el estado local sin recargar todos
      setOperators(prevOperators => {
        return prevOperators.map(operator => {
          if (operator.id === id) {
            // Construir un nuevo objeto User con los datos actualizados
            return {
              ...operator,
              name: `${updatedOperator.firstName} ${updatedOperator.lastName}`,
              email: updatedOperator.email,
              status: updatedOperator.status,
              role: updatedOperator.role,
              branchName: updatedOperator.branchName ?? undefined,
              rawData: updatedOperator
            };
          }
          return operator;
        });
      });

      // Log de éxito
      console.log(`✅ Operador ${id} actualizado correctamente en el estado local`);
    } catch (error) {
      console.error(`❌ Error al actualizar operador ${id}:`, error);
      // Si hay un error, refrescar todos los operadores para asegurar consistencia
      await refreshOperators();
      throw error;
    }
  }, []);

  // Función para crear un operador
  const createOperator = useCallback(async (data: any) => {
    try {
      // Crear el nuevo operador en el backend
      const newOperator = await OperatorsService.createOperator(data);
      
      // Mapear el nuevo operador al formato de la interfaz User
      const mappedNewOperator = mapOperator(newOperator);
      
      if (mappedNewOperator) {
        // Actualizar el estado local añadiendo el nuevo operador
        setOperators(prevOperators => [...prevOperators, mappedNewOperator]);
        console.log(`✅ Nuevo operador ${newOperator.operatorId} añadido correctamente al estado local`);
      } else {
        console.error('❌ No se pudo mapear correctamente el nuevo operador');
        // Si hay un error en el mapeo, refrescar todos los operadores para asegurar consistencia
        await refreshOperators();
      }
      
      return newOperator;
    } catch (error) {
      console.error('❌ Error al crear operador:', error);
      throw error;
    }
  }, [mapOperator, refreshOperators]);

  // Cargar operadores al montar el componente
  useEffect(() => {
    loadOperators();
  }, [loadOperators]);

  return (
    <OperatorsContext.Provider
      value={{
        operators,
        isLoading,
        error,
        refreshOperators,
        updateOperator,
        createOperator
      }}
    >
      {children}
    </OperatorsContext.Provider>
  );
}

// Hook personalizado para usar el contexto
export function useOperators() {
  const context = useContext(OperatorsContext);
  if (context === undefined) {
    throw new Error('useOperators debe ser usado dentro de un OperatorsProvider');
  }
  return context;
} 