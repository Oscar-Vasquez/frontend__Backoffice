"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar el error en un servicio de análisis o monitoreo
    console.error("Error en la página de operadores:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-slate-50 to-zinc-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg border-red-200">
        <CardHeader className="bg-red-50 border-b border-red-100">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            <CardTitle className="text-red-700">Error al cargar operadores</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-gray-700">
              Se ha producido un error al intentar cargar la lista de operadores. Esto puede deberse a problemas de conexión con el servidor o a un error en la autenticación.
            </p>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Detalles del error:</p>
              <p className="text-sm font-mono bg-gray-100 p-2 rounded">{error.message}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <p className="text-sm text-blue-700">
                <strong>Recomendaciones:</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                <li>Verifica tu conexión a internet</li>
                <li>Comprueba que el servidor backend esté funcionando</li>
                <li>Asegúrate de que tu sesión no haya expirado</li>
                <li>
                  <Link href="/dashboard/users/operator/diagnostico" className="underline">
                    Ejecuta el diagnóstico de conexión
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between bg-gray-50 border-t">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
          >
            Volver al dashboard
          </Button>
          <Button 
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ReloadIcon className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 