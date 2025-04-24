'use client';

import { API_URL } from '@/app/config';
import { AuthService } from './auth.service';

/**
 * Clase para manejar errores de API
 */
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Servicio de API mejorado que maneja errores de autenticación
 * y proporciona métodos para realizar solicitudes HTTP
 */
export class ApiClient {
  /**
   * Obtiene los headers de autenticación
   */
  static getHeaders(contentType = 'application/json') {
    const token = AuthService.getToken();
    return {
      'Content-Type': contentType,
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

  /**
   * Maneja los errores de respuesta
   */
  static async handleResponse(response: Response) {
    if (response.ok) {
      // Para respuestas 204 No Content
      if (response.status === 204) {
        return null;
      }
      
      // Para otras respuestas exitosas
      try {
        return await response.json();
      } catch (e) {
        // Si no es JSON, devolver el texto
        return await response.text();
      }
    }

    // Manejar errores
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: 'Error desconocido' };
    }

    // Manejar errores de autenticación
    if (response.status === 401) {
      console.error('Error de autenticación:', errorData);
      
      // No redirigir automáticamente, dejar que el componente lo maneje
      // usando el hook useNavigation
      AuthService.clearAuth();
      
      throw new ApiError(
        response.status,
        errorData.message || 'Sesión expirada o inválida',
        errorData
      );
    }

    throw new ApiError(
      response.status,
      errorData.message || `Error ${response.status}`,
      errorData
    );
  }

  /**
   * Realiza una solicitud GET
   */
  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${API_URL}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    
    return this.handleResponse(response);
  }

  /**
   * Realiza una solicitud POST
   */
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    
    return this.handleResponse(response);
  }

  /**
   * Realiza una solicitud PUT
   */
  static async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    
    return this.handleResponse(response);
  }

  /**
   * Realiza una solicitud PATCH
   */
  static async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include',
    });
    
    return this.handleResponse(response);
  }

  /**
   * Realiza una solicitud DELETE
   */
  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    
    return this.handleResponse(response);
  }

  /**
   * Realiza una solicitud para subir archivos
   */
  static async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    // Get original headers (including Content-Type)
    const originalHeaders = this.getHeaders();
    // Create new headers object specifically for upload, omitting Content-Type
    const uploadHeaders = {
        Authorization: originalHeaders.Authorization,
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      // Use the new headers object that doesn't have Content-Type
      headers: uploadHeaders, 
      body: formData,
      credentials: 'include',
    });
    
    return this.handleResponse(response);
  }
} 