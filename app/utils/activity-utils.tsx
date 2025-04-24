import React from 'react';
import {
  Package,
  DollarSign,
  User,
  LogIn,
  LogOut,
  Activity,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

export const getActivityIcon = (action: string) => {
  switch (action) {
    case 'PACKAGE_CREATED':
    case 'PACKAGE_ASSIGNED':
    case 'PACKAGE_USER_UPDATED':
    case 'PACKAGE_STATUS_UPDATED':
      return <Package className="h-4 w-4" />;
    case 'INVOICE_CREATED':
      return <DollarSign className="h-4 w-4" />;
    case 'USER_CREATED':
    case 'USER_UPDATED':
    case 'USER_DELETED':
      return <User className="h-4 w-4" />;
    case 'LOGIN':
      return <LogIn className="h-4 w-4" />;
    case 'LOGOUT':
      return <LogOut className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

export const getActivityColor = (action: string) => {
  switch (action) {
    case 'PACKAGE_CREATED':
      return '#4caf50'; // Verde
    case 'PACKAGE_ASSIGNED':
      return '#2196f3'; // Azul
    case 'PACKAGE_USER_UPDATED':
      return '#ff9800'; // Naranja
    case 'PACKAGE_STATUS_UPDATED':
      return '#9c27b0'; // Morado
    case 'INVOICE_CREATED':
      return '#00bcd4'; // Cyan
    case 'USER_CREATED':
      return '#2196f3'; // Azul
    case 'USER_UPDATED':
      return '#ff9800'; // Naranja
    case 'USER_DELETED':
      return '#f44336'; // Rojo
    case 'LOGIN':
      return '#4caf50'; // Verde
    case 'LOGOUT':
      return '#9e9e9e'; // Gris
    default:
      return '#9e9e9e'; // Gris por defecto
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-3 w-3" />;
    case 'pending':
      return <Clock className="h-3 w-3" />;
    case 'failed':
      return <XCircle className="h-3 w-3" />;
    default:
      return null;
  }
}; 