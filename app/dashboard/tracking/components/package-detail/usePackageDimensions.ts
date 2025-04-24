"use client";

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ExtendedPackageData } from './types';

interface DimensionsFormData {
  length: number;
  width: number;
  height: number;
}

/**
 * Hook personalizado para gestionar la edición de dimensiones del paquete
 */
export function usePackageDimensions(packageData: ExtendedPackageData | undefined) {
  // Estado para los datos del formulario
  const [dimensions, setDimensions] = useState<DimensionsFormData>({
    length: packageData?.length || 0,
    width: packageData?.width || 0,
    height: packageData?.height || 0
  });

  // Estado para controlar la apertura del diálogo
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  
  // Estado para controlar la carga durante la actualización
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Efecto para actualizar las dimensiones cuando cambian los datos del paquete
  useEffect(() => {
    if (packageData) {
      setDimensions({
        length: packageData.length || 0,
        width: packageData.width || 0,
        height: packageData.height || 0
      });
    }
  }, [packageData]);

  // Función para actualizar los valores del formulario
  const handleDimensionChange = useCallback((field: keyof DimensionsFormData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // Validar que el valor sea un número positivo
      if (value && Number(value) >= 0) {
        setDimensions(prev => ({
          ...prev,
          [field]: Number(value)
        }));
      }
    };
  }, []);

  // Función para actualizar las dimensiones en el servidor
  const handleUpdateDimensions = useCallback(async () => {
    // Validar que tengamos un paquete para actualizar
    if (!packageData?.id) {
      toast.error('No se puede actualizar el paquete', {
        description: 'No se encontró la información del paquete'
      });
      return null;
    }

    try {
      // Activar estado de carga
      setIsUpdating(true);
      
      // Obtener token para la solicitud
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Preparar los datos para enviar
      const dimensionsData = {
        length: dimensions.length,
        width: dimensions.width,
        height: dimensions.height
      };

      // Enviar la solicitud al servidor
      const response = await fetch(`http://localhost:3001/api/v1/packages/${packageData.id}/dimensions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(dimensionsData)
      });

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar las dimensiones');
      }

      // Obtener los datos actualizados
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      toast.success('Dimensiones actualizadas con éxito', {
        description: `${dimensions.length}cm × ${dimensions.width}cm × ${dimensions.height}cm`
      });
      
      // Cerrar el diálogo
      setIsEditDialogOpen(false);
      
      // Retornar los datos actualizados para que el componente padre pueda actualizar su estado
      return data;

    } catch (error) {
      console.error('Error al actualizar dimensiones:', error);
      toast.error('Error al actualizar las dimensiones', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
      return null;
    } finally {
      // Desactivar estado de carga
      setIsUpdating(false);
    }
  }, [packageData, dimensions]);

  return {
    dimensions,
    isEditDialogOpen,
    isUpdating,
    setIsEditDialogOpen,
    handleDimensionChange,
    handleUpdateDimensions
  };
} 