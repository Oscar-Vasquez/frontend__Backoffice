import { useCallback } from 'react';
import { ActivitiesService } from '@/app/services/activities.service';
import { AuthService } from '@/app/services/auth.service';
import { ActivityAction } from '@/app/types/activities';

export const useActivityLogging = () => {
  const logActivity = useCallback(async ({
    action,
    description,
    entityType,
    entityId,
    metadata
  }: {
    action: ActivityAction;
    description: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, any>;
  }) => {
    const operator = AuthService.getOperatorData();

    if (!operator) {
      console.warn('No se puede registrar actividad: Operador no autenticado o datos no disponibles en localStorage');
      return;
    }

    try {
      await ActivitiesService.createActivity({
        operatorId: operator.id,
        operatorName: `${operator.firstName || operator.first_name || 'Usuario'} ${operator.lastName || operator.last_name || 'Desconocido'}`.trim(),
        action,
        description,
        entityType,
        entityId,
        metadata
      });
    } catch (error) {
      console.error('Error al registrar actividad:', error);
    }
  }, []);

  return { logActivity };
}; 