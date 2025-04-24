'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  ReloadIcon, 
  ExclamationTriangleIcon, 
  CheckCircledIcon, 
  CrossCircledIcon,
  InfoCircledIcon
} from '@radix-ui/react-icons';
import { OperatorsService } from '@/app/services/operators.service';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

export default function InlineDiagnostics() {
  const [loading, setLoading] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    bucketExists: boolean;
    publicAccess: boolean;
    error?: string;
  } | null>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      // Diagnóstico de la API
      const results = await OperatorsService.diagnosticarConexion();
      setDiagnosticResults(results);
      
      // Diagnóstico de Supabase Storage
      await checkSupabaseStorage();
    } catch (error) {
      console.error("Error al ejecutar diagnósticos:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkSupabaseStorage = async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setSupabaseStatus({
          connected: false,
          bucketExists: false,
          publicAccess: false,
          error: "No se encontraron las variables de entorno de Supabase"
        });
        return;
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Verificar conexión
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        setSupabaseStatus({
          connected: false,
          bucketExists: false,
          publicAccess: false,
          error: bucketsError.message
        });
        return;
      }
      
      // Verificar si existe el bucket workexpressimagedata
      let bucketExists = false;
      
      if (buckets) {
        bucketExists = buckets.some(bucket => bucket.name === 'workexpressimagedata');
      }
      
      // Si el bucket no existe, intentar crearlo
      if (!bucketExists) {
        try {
          console.log("Intentando crear el bucket 'workexpressimagedata'...");
          const { error: createBucketError } = await supabase.storage.createBucket('workexpressimagedata', {
            public: true
          });
          
          if (createBucketError) {
            console.error("Error al crear el bucket:", createBucketError);
            setSupabaseStatus({
              connected: true,
              bucketExists: false,
              publicAccess: false,
              error: `No se pudo crear el bucket: ${createBucketError.message}`
            });
            return;
          }
          
          // Verificar que el bucket se haya creado correctamente
          const { data: updatedBuckets } = await supabase.storage.listBuckets();
          if (updatedBuckets) {
            bucketExists = updatedBuckets.some(bucket => bucket.name === 'workexpressimagedata');
          }
          console.log("Bucket creado correctamente:", bucketExists);
        } catch (error) {
          console.error("Error al crear el bucket:", error);
        }
      }
      
      // Intentar acceder a un archivo de prueba para verificar acceso público
      let publicAccess = false;
      
      if (bucketExists) {
        try {
          // Crear un archivo de prueba temporal
          const testFilePath = `test/diagnostic-${Date.now()}.txt`;
          const { error: uploadError } = await supabase.storage
            .from('workexpressimagedata')
            .upload(testFilePath, new Blob(['test']), {
              cacheControl: '0',
              upsert: true
            });
          
          if (!uploadError) {
            // Intentar crear una URL firmada
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('workexpressimagedata')
              .createSignedUrl(testFilePath, 3600); // 1 hora
            
            if (!signedUrlError && signedUrlData?.signedUrl) {
              // Verificar si la URL es accesible
              try {
                const response = await fetch(signedUrlData.signedUrl, { method: 'HEAD' });
                publicAccess = response.ok;
              } catch (error) {
                console.error("Error al verificar URL firmada:", error);
              }
            }
            
            // Eliminar el archivo de prueba
            await supabase.storage
              .from('workexpressimagedata')
              .remove([testFilePath]);
          } else {
            console.error("Error al subir archivo de prueba:", uploadError);
          }
        } catch (error) {
          console.error("Error al verificar acceso público:", error);
        }
      }
      
      setSupabaseStatus({
        connected: true,
        bucketExists,
        publicAccess
      });
      
    } catch (error) {
      setSupabaseStatus({
        connected: false,
        bucketExists: false,
        publicAccess: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <Card className="bg-white/80 border-white/50 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Diagnóstico del sistema</CardTitle>
        <CardDescription>
          Información de diagnóstico para solucionar problemas de conexión
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <ReloadIcon className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span>Ejecutando diagnósticos...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* API Status */}
            {diagnosticResults && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Estado de la API</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500">URL de la API:</span>
                    <div className="font-mono text-xs mt-1 bg-white p-1 rounded border border-gray-200">
                      {diagnosticResults.apiUrl}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500">Token presente:</span>
                    <div className="flex items-center mt-1">
                      {diagnosticResults.tokenPresente ? (
                        <CheckCircledIcon className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <CrossCircledIcon className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      {diagnosticResults.tokenPresente ? "Sí" : "No"}
                      {diagnosticResults.tokenParcial && (
                        <span className="ml-2 font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                          {diagnosticResults.tokenParcial}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500">Conectividad API:</span>
                    <div className="flex items-center mt-1">
                      {diagnosticResults.conectividadApi ? (
                        <CheckCircledIcon className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <CrossCircledIcon className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      {diagnosticResults.conectividadApi ? "Conectado" : "No conectado"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500">Respuesta operadores:</span>
                    <div className="flex items-center mt-1">
                      {diagnosticResults.respuestaOperadores.ok ? (
                        <CheckCircledIcon className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <CrossCircledIcon className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      {diagnosticResults.respuestaOperadores.status} 
                      {diagnosticResults.respuestaOperadores.mensaje && (
                        <span className="ml-2 text-xs text-gray-500 truncate max-w-[150px]">
                          {diagnosticResults.respuestaOperadores.mensaje}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Supabase Storage Status */}
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">Estado de Supabase Storage</h3>
              {supabaseStatus ? (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500">Conexión a Supabase:</span>
                    <div className="flex items-center mt-1">
                      {supabaseStatus.connected ? (
                        <CheckCircledIcon className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <CrossCircledIcon className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      {supabaseStatus.connected ? "Conectado" : "No conectado"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500">Bucket 'workexpressimagedata':</span>
                    <div className="flex items-center mt-1">
                      {supabaseStatus.bucketExists ? (
                        <CheckCircledIcon className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <CrossCircledIcon className="h-4 w-4 text-red-600 mr-1" />
                      )}
                      {supabaseStatus.bucketExists ? "Existe" : "No existe"}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-gray-500">Acceso público:</span>
                    <div className="flex items-center mt-1">
                      {supabaseStatus.publicAccess ? (
                        <CheckCircledIcon className="h-4 w-4 text-green-600 mr-1" />
                      ) : (
                        <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 mr-1" />
                      )}
                      {supabaseStatus.publicAccess ? "Configurado" : "No configurado"}
                    </div>
                  </div>
                  {supabaseStatus.error && (
                    <div className="bg-red-50 p-2 rounded-lg col-span-2">
                      <span className="text-red-600">Error:</span>
                      <div className="font-mono text-xs mt-1 bg-white p-1 rounded border border-red-200 text-red-700">
                        {supabaseStatus.error}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <ReloadIcon className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                  <span>Verificando Supabase Storage...</span>
                </div>
              )}
              
              {supabaseStatus && !supabaseStatus.bucketExists && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    Bucket no encontrado
                  </div>
                  <p className="mb-2">
                    El bucket 'workexpressimagedata' no existe en tu proyecto de Supabase. Este bucket es necesario para almacenar las imágenes de los operadores.
                  </p>
                  <div className="bg-white p-2 rounded border border-red-200 text-xs font-mono">
                    1. Ve al panel de Supabase &gt; Storage<br />
                    2. Haz clic en "New Bucket"<br />
                    3. Crea un bucket con el nombre exacto: <span className="font-bold">workexpressimagedata</span><br />
                    4. Marca la opción "Public bucket" si está disponible
                  </div>
                </div>
              )}
              
              {supabaseStatus && supabaseStatus.bucketExists && !supabaseStatus.publicAccess && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    Problema con las políticas de acceso
                  </div>
                  <p className="mb-2">
                    El bucket 'workexpressimagedata' existe pero no tiene configuradas correctamente las políticas de acceso.
                  </p>
                  <div className="bg-white p-2 rounded border border-amber-200 text-xs font-mono">
                    1. Ve al panel de Supabase &gt; Storage &gt; Policies<br />
                    2. Selecciona el bucket 'workexpressimagedata'<br />
                    3. Haz clic en "Add Policy"<br />
                    4. Configura una política SELECT para acceso público:<br />
                    &nbsp;&nbsp;- Tipo: SELECT<br />
                    &nbsp;&nbsp;- Nombre: "Permitir acceso público de lectura"<br />
                    &nbsp;&nbsp;- Roles: public (anon, authenticated)<br />
                    &nbsp;&nbsp;- Definición: bucket_id = 'workexpressimagedata'<br />
                    5. Configura también políticas para INSERT y DELETE
                  </div>
                </div>
              )}
              
              {supabaseStatus && supabaseStatus.error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <div className="flex items-center gap-2 font-medium mb-1">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    Error de Supabase
                  </div>
                  <p className="mb-2">
                    Se ha producido un error al interactuar con Supabase Storage:
                  </p>
                  <div className="bg-white p-2 rounded border border-red-200 text-xs font-mono overflow-auto">
                    {supabaseStatus.error}
                  </div>
                  <p className="mt-2">
                    Posibles soluciones:
                  </p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Verifica que las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén correctamente configuradas</li>
                    <li>Asegúrate de que tu proyecto de Supabase esté activo y funcionando</li>
                    <li>Verifica que tu cuenta tenga permisos para crear buckets y gestionar Storage</li>
                  </ul>
                </div>
              )}
            </div>
            
            {/* Diagnóstico de la última imagen subida */}
            {supabaseStatus && supabaseStatus.bucketExists && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900">Diagnóstico de imágenes</h3>
                
                {(() => {
                  // Intentar obtener información de la última imagen subida
                  const lastUploadedImageStr = typeof window !== 'undefined' ? localStorage.getItem('lastUploadedImage') : null;
                  let lastUploadedImage = null;
                  
                  if (lastUploadedImageStr) {
                    try {
                      lastUploadedImage = JSON.parse(lastUploadedImageStr);
                    } catch (e) {
                      console.error("Error al parsear datos de localStorage:", e);
                    }
                  }
                  
                  if (lastUploadedImage) {
                    return (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm">
                        <div className="flex items-center gap-2 font-medium mb-2 text-blue-700">
                          <InfoCircledIcon className="h-4 w-4" />
                          Última imagen subida
                        </div>
                        
                        <div className="space-y-2 text-xs">
                          <div className="bg-white p-2 rounded border border-blue-100">
                            <div className="font-medium text-blue-700 mb-1">Ruta del archivo:</div>
                            <div className="font-mono text-gray-700 break-all">{lastUploadedImage.path}</div>
                          </div>
                          
                          <div className="bg-white p-2 rounded border border-blue-100">
                            <div className="font-medium text-blue-700 mb-1">URL firmada:</div>
                            <div className="font-mono text-gray-700 break-all">{lastUploadedImage.signedUrl}</div>
                            <div className="mt-1 flex justify-end">
                              <a 
                                href={lastUploadedImage.signedUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs"
                              >
                                Probar URL
                              </a>
                            </div>
                          </div>
                          
                          <div className="bg-white p-2 rounded border border-blue-100">
                            <div className="font-medium text-blue-700 mb-1">URL pública:</div>
                            <div className="font-mono text-gray-700 break-all">{lastUploadedImage.publicUrl}</div>
                            <div className="mt-1 flex justify-end">
                              <a 
                                href={lastUploadedImage.publicUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs"
                              >
                                Probar URL
                              </a>
                            </div>
                          </div>
                          
                          <div className="p-2 bg-yellow-50 border border-yellow-100 rounded">
                            <p className="text-yellow-700">
                              <strong>Nota:</strong> Si las URLs no funcionan, asegúrate de que las políticas de acceso estén correctamente configuradas.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-500">
                        No hay información de imágenes recientes. Sube una imagen para ver el diagnóstico.
                      </div>
                    );
                  }
                })()}
              </div>
            )}
            
            <div className="flex justify-end mt-4">
              <Button 
                onClick={runDiagnostics} 
                disabled={loading}
                variant="outline"
                className="text-sm"
              >
                {loading ? (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                    Ejecutando...
                  </>
                ) : (
                  <>
                    <ReloadIcon className="mr-2 h-4 w-4" />
                    Ejecutar diagnóstico
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 