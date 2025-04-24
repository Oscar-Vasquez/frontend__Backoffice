'use client';

import React, { useEffect, useState } from 'react';
import { OperatorActivity } from '../../../types/activities';
import { ActivitiesService } from '../../../services/activities.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  TimelineSeparator
} from '@mui/lab';
import { 
  Box,
  Typography,
  Paper,
  IconButton,
  Drawer,
  CircularProgress,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getActivityIcon, getActivityColor } from '../../../utils/activity-utils';

interface OperatorTimelineProps {
  operator: any;
  isOpen: boolean;
  onClose: () => void;
}

// Mantener un registro de los operadores cuyas actividades ya se han cargado
const loadedOperators = new Set<string>();

const OperatorTimeline: React.FC<OperatorTimelineProps> = ({ operator, isOpen, onClose }) => {
  const [activities, setActivities] = useState<OperatorActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Solo cargar actividades si:
    // 1. El drawer está abierto
    // 2. Hay un operador seleccionado
    // 3. No se han cargado las actividades de este operador antes
    if (isOpen && operator?.id && !loadedOperators.has(operator.id)) {
      const fetchActivities = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await ActivitiesService.getOperatorActivities(operator.id);
          setActivities(data);
          // Marcar este operador como cargado
          loadedOperators.add(operator.id);
        } catch (error) {
          console.error('Error al cargar actividades:', error);
          setError('No se pudieron cargar las actividades. Por favor, intente nuevamente.');
        } finally {
          setLoading(false);
        }
      };

      fetchActivities();
    }
  }, [isOpen, operator?.id]);

  const formatMetadata = (metadata: any) => {
    if (!metadata) return null;
    return Object.entries(metadata).map(([key, value]) => (
      <Typography key={key} variant="body2" color="text.secondary">
        {key.charAt(0).toUpperCase() + key.slice(1)}: {String(value)}
      </Typography>
    ));
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      // Validar que el timestamp sea una fecha válida
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.error('Fecha inválida:', timestamp);
        return 'Fecha no disponible';
      }
      return format(date, 'dd MMM HH:mm', { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha no disponible';
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 400 }, p: 2 }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Actividades de {operator?.name || 'Operador'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : activities.length === 0 ? (
        <Alert severity="info">
          No hay actividades registradas para este operador.
        </Alert>
      ) : (
        <Timeline>
          {activities.map((activity, index) => (
            <TimelineItem key={activity.id || index}>
              <TimelineOppositeContent sx={{ flex: 0.2 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(activity.timestamp)}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot sx={{ bgcolor: getActivityColor(activity.action) }}>
                  {getActivityIcon(activity.action)}
                </TimelineDot>
                {index < activities.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body1">
                    {activity.description}
                  </Typography>
                  {activity.metadata && (
                    <Box sx={{ mt: 1 }}>
                      {formatMetadata(activity.metadata)}
                    </Box>
                  )}
                  {activity.status && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'inline-block',
                        mt: 1,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: activity.status === 'completed' ? 'success.light' : 
                                activity.status === 'pending' ? 'warning.light' : 'error.light',
                        color: activity.status === 'completed' ? 'success.dark' : 
                               activity.status === 'pending' ? 'warning.dark' : 'error.dark'
                      }}
                    >
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </Typography>
                  )}
                </Paper>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Drawer>
  );
};

export default OperatorTimeline; 