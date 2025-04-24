'use client';

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL } from '@/app/config';
import { AuthService } from './auth.service';
import { toast } from '@/components/ui/use-toast';

// Crear una instancia de axios con la URL base
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar el token de autenticación a las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = AuthService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // En lugar de redireccionar directamente, limpiar la autenticación
      // La redirección se manejará en los componentes usando useNavigation
      AuthService.clearAuth();
      
      // Mostrar un toast de error
      toast({
        title: 'Sesión expirada',
        description: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        variant: 'destructive',
      });
      
      // No redireccionamos aquí, dejamos que los componentes manejen la redirección
      // usando el hook useNavigation
    }
    
    return Promise.reject(error);
  }
);

// Funciones para realizar solicitudes HTTP
export const apiGet = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return api.get<T>(url, config).then((response) => response.data);
};

export const apiPost = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.post<T>(url, data, config).then((response) => response.data);
};

export const apiPut = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.put<T>(url, data, config).then((response) => response.data);
};

export const apiDelete = <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  return api.delete<T>(url, config).then((response) => response.data);
};

export const apiPatch = <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  return api.patch<T>(url, data, config).then((response) => response.data);
};

export default api; 