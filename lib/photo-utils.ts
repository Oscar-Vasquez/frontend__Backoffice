/**
 * Utilidades para manipulación segura de URLs de fotos
 * Especialmente para manejar fotos de perfiles de operadores.
 */

type PhotoUrlType = 'signed' | 'public';

/**
 * Convierte una URL a formato público (para almacenamiento)
 * pero guarda la URL original en localStorage para referencia futura
 */
export function processPhotoUrl(url: string, operatorId: string): { 
  storageUrl: string;  // URL sin token para almacenamiento seguro
  displayUrl: string;  // URL original con token para vista previa
} {
  if (!url) {
    return { storageUrl: '', displayUrl: '' };
  }
  
  // Guardar la URL original para referencia futura
  try {
    const originalUrls = JSON.parse(localStorage.getItem('operatorPhotos') || '{}');
    originalUrls[operatorId] = url;
    localStorage.setItem('operatorPhotos', JSON.stringify(originalUrls));
  } catch (error) {
    console.error('Error al guardar URL original:', error);
  }
  
  // Para almacenamiento, siempre usar versión pública
  let storageUrl = url;
  
  // Convertir de signed a public y eliminar token para almacenamiento
  if (url.includes('/sign/')) {
    storageUrl = url.replace('/sign/', '/public/');
  }
  
  // Eliminar token para la versión de almacenamiento
  if (storageUrl.includes('?')) {
    storageUrl = storageUrl.split('?')[0];
  }
  
  // Para mostrar, usar la URL original con todos sus tokens
  return {
    storageUrl,  // Versión sin token para backend
    displayUrl: url  // Versión original con token para frontend
  };
}

/**
 * Recupera la URL firmada original de localStorage si existe
 */
export function getOriginalPhotoUrl(url: string, operatorId: string): string {
  if (!url) return url;
  
  try {
    const originalUrls = JSON.parse(localStorage.getItem('operatorPhotos') || '{}');
    const originalUrl = originalUrls[operatorId];
    
    // Si tenemos una URL original guardada y coincide con la base (sin token)
    if (originalUrl && (
      url === originalUrl || 
      originalUrl.startsWith(url) || 
      (url.includes('/public/') && originalUrl.includes('/sign/') && 
       url.replace('/public/', '/sign/') === originalUrl.split('?')[0])
    )) {
      console.log('✅ Recuperada URL original con firma:', originalUrl);
      return originalUrl;
    }
  } catch (error) {
    console.error('Error al recuperar URL original:', error);
  }
  
  return url;
}

/**
 * Determina si una URL es de Supabase Storage
 */
export function isSupabaseStorageUrl(url: string): boolean {
  if (!url) return false;
  
  return url.includes('supabase.co/storage') || 
         url.includes('workexpressimagedata');
}

/**
 * Genera una URL de vista previa de imagen que funcione en todos los casos
 */
export function getPhotoDisplayUrl(photo: string | null, operatorId: string): string {
  if (!photo) return '';
  
  // Si es una URL de Supabase, intentar recuperar la versión firmada
  if (isSupabaseStorageUrl(photo)) {
    return getOriginalPhotoUrl(photo, operatorId);
  }
  
  return photo;
} 