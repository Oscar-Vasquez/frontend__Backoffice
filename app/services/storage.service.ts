import { getCookie } from 'cookies-next';

/**
 * Servicio para manejar operaciones de almacenamiento en Supabase
 */
export class StorageService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  private static readonly STORAGE_API_ENDPOINT = `${StorageService.API_URL}/storage`;

  /**
   * Sube un archivo al almacenamiento de Supabase
   * @param file Archivo a subir
   * @param path Ruta donde guardar el archivo
   * @param bucket Nombre del bucket de almacenamiento (opcional)
   * @param previousUrl URL anterior para borrar si existe (opcional)
   * @returns URL del archivo subido
   */
  static async uploadFile(file: File, path: string, bucket?: string, previousUrl?: string | null): Promise<string> {
    try {
      const token = getCookie('workexpress_token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', path);
      
      if (bucket) {
        formData.append('bucket', bucket);
      }
      
      if (previousUrl) {
        formData.append('previousUrl', previousUrl);
      }
      
      // URL del endpoint de subida
      const uploadUrl = `${this.STORAGE_API_ENDPOINT}/upload`;
      console.log(`Subiendo archivo a ${uploadUrl}`);
      
      // Realizar petición para subir archivo
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error al subir archivo: ${response.status}`);
      }
      
      const responseData = await response.json();
      
      if (!responseData.url) {
        throw new Error('No se recibió la URL del archivo subido');
      }
      
      return responseData.url;
    } catch (error) {
      console.error('Error en uploadFile:', error);
      throw error;
    }
  }
  
  /**
   * Elimina un archivo del almacenamiento de Supabase
   * @param url URL del archivo a eliminar
   * @returns Resultado de la operación
   */
  static async deleteFile(url: string): Promise<boolean> {
    try {
      const token = getCookie('workexpress_token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      // URL del endpoint de eliminación
      const deleteUrl = `${this.STORAGE_API_ENDPOINT}/delete`;
      
      // Realizar petición para eliminar archivo
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error al eliminar archivo: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error en deleteFile:', error);
      throw error;
    }
  }
  
  /**
   * Verifica si una URL es de Supabase Storage
   */
  static isSupabaseUrl(url: string): boolean {
    return url?.includes('supabase.co/storage') || false;
  }
  
  /**
   * Extrae el nombre del archivo de una URL de Supabase
   */
  static getFileNameFromUrl(url: string): string {
    try {
      if (!url) return '';
      
      // Extraer el nombre del archivo de la URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      return fileName || '';
    } catch (error) {
      console.error('Error al extraer nombre de archivo:', error);
      return '';
    }
  }
} 