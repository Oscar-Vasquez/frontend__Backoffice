"use client";

import { useState, useEffect } from "react";
import { OperatorsService } from "@/app/services/operators.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReloadIcon, CheckCircledIcon, CrossCircledIcon, ExclamationTriangleIcon } from "@radix-ui/react-icons";

export default function DiagnosticoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const ejecutarDiagnostico = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const diagnostico = await OperatorsService.diagnosticarConexion();
      setResultado(diagnostico);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-slate-50 to-zinc-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <CardTitle className="text-2xl font-bold">Diagnóstico de Conexión</CardTitle>
            <CardDescription>
              Esta herramienta verifica la conectividad con el backend y el estado de la autenticación.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={ejecutarDiagnostico} 
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Ejecutando diagnóstico...
                    </>
                  ) : (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4" />
                      Ejecutar diagnóstico
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <div className="flex items-center gap-2">
                    <CrossCircledIcon className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Error al ejecutar el diagnóstico</span>
                  </div>
                  <p className="mt-2 text-sm">{error}</p>
                </div>
              )}

              {resultado && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Configuración API</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium text-gray-500">URL del API:</span>
                            <div className="mt-1 p-2 bg-gray-50 rounded-md font-mono text-sm">
                              {resultado.apiUrl}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Estado de Autenticación</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Token presente:</span>
                            {resultado.tokenPresente ? (
                              <Badge className="bg-green-100 text-green-800">Sí</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">No</Badge>
                            )}
                          </div>
                          
                          {resultado.tokenPresente && resultado.tokenParcial && (
                            <div>
                              <span className="text-sm font-medium text-gray-500">Token (parcial):</span>
                              <div className="mt-1 p-2 bg-gray-50 rounded-md font-mono text-sm">
                                {resultado.tokenParcial}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Conectividad Básica</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Health check:</span>
                            {resultado.conectividadApi ? (
                              <Badge className="bg-green-100 text-green-800">OK</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Error</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Endpoint de Operadores</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500">Estado:</span>
                            {resultado.respuestaOperadores.ok ? (
                              <Badge className="bg-green-100 text-green-800">OK</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800">Error {resultado.respuestaOperadores.status}</Badge>
                            )}
                          </div>
                          
                          {resultado.respuestaOperadores.mensaje && (
                            <div>
                              <span className="text-sm font-medium text-gray-500">Mensaje:</span>
                              <div className="mt-1 p-2 bg-gray-50 rounded-md text-sm">
                                {resultado.respuestaOperadores.mensaje}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Cookies Disponibles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {resultado.cookies.length > 0 ? (
                        <div className="max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-md font-mono text-sm">
                          {resultado.cookies.map((cookie: string, index: number) => (
                            <div key={index} className="mb-1">{cookie}</div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 bg-yellow-50 text-yellow-700 rounded-md text-sm">
                          No se encontraron cookies
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-t-4 border-t-blue-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-blue-500" />
                        Diagnóstico y Recomendaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {!resultado.tokenPresente && (
                          <div className="flex items-start gap-2">
                            <CrossCircledIcon className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-red-700">No se encontró token de autenticación</p>
                              <p className="text-sm text-gray-600">Inicia sesión nuevamente para obtener un token válido.</p>
                            </div>
                          </div>
                        )}

                        {resultado.tokenPresente && !resultado.conectividadApi && (
                          <div className="flex items-start gap-2">
                            <CrossCircledIcon className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-red-700">No se pudo conectar con el servidor</p>
                              <p className="text-sm text-gray-600">Verifica que el backend esté en ejecución y que la URL sea correcta: {resultado.apiUrl}</p>
                            </div>
                          </div>
                        )}

                        {resultado.tokenPresente && resultado.conectividadApi && !resultado.respuestaOperadores.ok && (
                          <div className="flex items-start gap-2">
                            <CrossCircledIcon className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-red-700">Error al acceder al endpoint de operadores</p>
                              <p className="text-sm text-gray-600">
                                El servidor respondió con código {resultado.respuestaOperadores.status}. 
                                {resultado.respuestaOperadores.status === 401 && " El token podría ser inválido o haber expirado."}
                              </p>
                            </div>
                          </div>
                        )}

                        {resultado.tokenPresente && resultado.conectividadApi && resultado.respuestaOperadores.ok && (
                          <div className="flex items-start gap-2">
                            <CheckCircledIcon className="h-5 w-5 text-green-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-green-700">Todo funciona correctamente</p>
                              <p className="text-sm text-gray-600">La conexión con el backend y la autenticación están funcionando correctamente.</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="bg-gray-50 border-t flex justify-between">
            <div className="text-sm text-gray-500">
              Fecha: {new Date().toLocaleString()}
            </div>
            {resultado && (
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Reiniciar
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 