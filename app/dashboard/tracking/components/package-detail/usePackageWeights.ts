import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { ExtendedPackageData } from './types';

interface WeightFormData {
  weight: number;
  volumetricWeight: number;
}

/**
 * Hook personalizado para gestionar la edición de pesos del paquete
 */
export function usePackageWeights(packageData: ExtendedPackageData | undefined) {
  // Estado para los datos del formulario
  const [weights, setWeights] = useState<WeightFormData>({
    weight: packageData?.weight || 0,
    volumetricWeight: packageData?.volumetricWeight || 0
  });

  // Estado para controlar la apertura del diálogo
  const [isWeightDialogOpen, setIsWeightDialogOpen] = useState<boolean>(false);
  
  // Estado para controlar la carga durante la actualización
  const [isUpdatingWeights, setIsUpdatingWeights] = useState<boolean>(false);

  // Función para actualizar los valores del formulario
  const handleWeightChange = useCallback((field: keyof WeightFormData) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
      // Validar que el valor sea un número positivo
      if (value && Number(value) >= 0) {
        setWeights(prev => ({
          ...prev,
          [field]: Number(value)
        }));
      }
    };
  }, []);

  // Función para actualizar los pesos en el servidor
  const handleUpdateWeights = useCallback(async () => {
    // Validar que tengamos un paquete para actualizar
    if (!packageData?.id) {
      toast.error('No se puede actualizar el paquete', {
        description: 'No se encontró la información del paquete'
      });
      return;
    }

    try {
      // Activar estado de carga
      setIsUpdatingWeights(true);
      
      // Obtener token para la solicitud
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Preparar los datos para enviar
      const weightData = {
        weight: weights.weight,
        volumetric_weight: weights.volumetricWeight
      };

      // Enviar la solicitud al servidor
      const response = await fetch(`http://localhost:3001/api/v1/packages/${packageData.id}/weights`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(weightData)
      });

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar los pesos');
      }

      // Obtener los datos actualizados
      const data = await response.json();
      
      // Mostrar mensaje de éxito
      toast.success('Pesos actualizados con éxito', {
        description: `Peso: ${weights.weight}kg, Volumétrico: ${weights.volumetricWeight}kg`
      });
      
      // Cerrar el diálogo
      setIsWeightDialogOpen(false);
      
      // Retornar los datos actualizados para que el componente padre pueda actualizar su estado
      return data;

    } catch (error) {
      console.error('Error al actualizar pesos:', error);
      toast.error('Error al actualizar los pesos', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
      return null;
    } finally {
      // Desactivar estado de carga
      setIsUpdatingWeights(false);
    }
  }, [packageData, weights]);

  // Efecto para actualizar el estado cuando cambian los datos del paquete
  useEffect(() => {
    if (packageData) {
      setWeights({
        weight: packageData.weight || 0,
        volumetricWeight: packageData.volumetricWeight || 0
      });
    }
  }, [packageData]);

  return {
    weights,
    isWeightDialogOpen,
    isUpdatingWeights,
    setIsWeightDialogOpen,
    handleWeightChange,
    handleUpdateWeights
  };
} 