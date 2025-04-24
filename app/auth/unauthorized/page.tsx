'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/app/config';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { AuthService } from '@/app/services/auth.service';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleBackToDashboard = () => {
    router.push(ROUTES.DASHBOARD);
  };

  const handleLogout = () => {
    AuthService.logout();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-amber-200">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <ShieldAlert className="h-8 w-8 text-amber-600" />
            </div>
            <CardTitle className="text-center text-2xl">Acceso Denegado</CardTitle>
            <CardDescription className="text-center">
              No tienes permisos para acceder a esta sección.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-2">
            <p className="text-gray-500">
              Si crees que deberías tener acceso a esta sección, por favor contacta al administrador del sistema.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full" 
              variant="default" 
              onClick={handleBackToDashboard}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
            <Button 
              className="w-full" 
              variant="outline" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 