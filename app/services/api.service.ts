import axios, { AxiosInstance } from 'axios';

export class ApiService {
  private static instance: AxiosInstance;

  private static getInstance(): AxiosInstance {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Interceptor para añadir el token
      this.instance.interceptors.request.use((config) => {
        const token = typeof window !== 'undefined' ? 
          document.cookie
            .split('; ')
            .find(row => row.startsWith('workexpress_token='))
            ?.split('=')[1] : null;

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });

      // Interceptor para manejar errores
      this.instance.interceptors.response.use(
        response => response,
        error => {
          if (error.response?.status === 401) {
            // Redirigir al login si el token expiró
            window.location.href = '/auth/login';
          }
          return Promise.reject(error);
        }
      );
    }
    return this.instance;
  }

  static async get(url: string, config = {}) {
    return this.getInstance().get(url, config);
  }

  static async post(url: string, data = {}, config = {}) {
    return this.getInstance().post(url, data, config);
  }

  static async put(url: string, data = {}, config = {}) {
    return this.getInstance().put(url, data, config);
  }

  static async delete(url: string, config = {}) {
    return this.getInstance().delete(url, config);
  }

  static async patch(url: string, data = {}, config = {}) {
    return this.getInstance().patch(url, data, config);
  }
} 