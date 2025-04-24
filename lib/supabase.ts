import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Creación del cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: fetch,
  },
});

/**
 * Convierte una URL de Supabase al formato público
 * Reemplaza '/sign/' con '/public/' y elimina tokens
 */
export function convertToPublicUrl(url: string): string {
  if (!url) return url;
  
  try {
    // Convertir de signed a public
    if (url.includes('/sign/')) {
      url = url.replace('/sign/', '/public/');
    }
    
    // Eliminar parámetros de consulta (tokens)
    if (url.includes('?')) {
      url = url.split('?')[0];
    }
    
    return url;
  } catch (error) {
    console.error('Error al convertir URL:', error);
    return url;
  }
}

/**
 * Método para subir un archivo a Supabase Storage
 */
export async function uploadFileToSupabase(
  file: File, 
  bucket: string = 'workexpressimagedata', 
  folderPath: string = 'operators'
): Promise<{url: string | null, error: Error | null}> {
  try {
    // Verificar que Supabase está configurado
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase no está configurado correctamente. Verifique las variables de entorno.');
    }
    
    // Crear un nombre de archivo único
    const fileExt = file.name.split('.').pop();
    const fileName = `${folderPath}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    
    // Verificar/crear el bucket si es necesario
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucket);
      
      if (bucketError && bucketError.message.includes('not found')) {
        // El bucket no existe, intentar crearlo
        const { error: createBucketError } = await supabase.storage.createBucket(bucket, {
          public: false,
          allowedMimeTypes: ['image/*'],
          fileSizeLimit: 5 * 1024 * 1024, // 5MB
        });
        
        if (createBucketError) {
          console.error('Error al crear el bucket:', createBucketError);
          throw createBucketError;
        }
      } else if (bucketError) {
        console.error('Error al verificar el bucket:', bucketError);
        throw bucketError;
      }
    } catch (bucketError) {
      console.error('Error al verificar/crear el bucket:', bucketError);
      // Continuamos de todos modos por si el error es solo de permisos
    }
    
    // Subir el archivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error('Error al subir el archivo:', uploadError);
      throw uploadError;
    }
    
    console.log('Archivo subido correctamente:', uploadData);
    
    // Obtener la URL pública
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
      
    // Siempre usar la URL pública para evitar problemas con tokens
    let fileUrl = publicUrlData.publicUrl;
    console.log('URL pública obtenida:', fileUrl);
    
    // Asegurar que sea una URL pública accesible
    if (fileUrl.includes('/sign/')) {
      fileUrl = convertToPublicUrl(fileUrl);
      console.log('URL convertida a formato público:', fileUrl);
    }
    
    return { url: fileUrl, error: null };
  } catch (error) {
    console.error('Error en uploadFileToSupabase:', error);
    return { url: null, error: error instanceof Error ? error : new Error('Error desconocido') };
  }
}

/**
 * Método para eliminar un archivo de Supabase Storage
 */
export async function deleteFileFromSupabase(fileUrl: string, bucket: string = 'workexpressimagedata'): Promise<boolean> {
  try {
    // Extraer la ruta del archivo de la URL
    const urlParts = fileUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const folderPath = urlParts[urlParts.length - 2];
    const filePath = `${folderPath}/${fileName}`;
    
    // Eliminar el archivo
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
      
    if (error) {
      console.error('Error al eliminar el archivo:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error en deleteFileFromSupabase:', error);
    return false;
  }
}

export default supabase; 