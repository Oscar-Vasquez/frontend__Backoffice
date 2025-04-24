'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from './hooks/useNavigation';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const navigation = useNavigation();
  
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            <CardTitle>Algo salió mal</CardTitle>
          </div>
          <CardDescription>
            Ha ocurrido un error inesperado en la aplicación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
            <p className="font-mono">{error.message}</p>
            {error.digest && (
              <p className="mt-2 text-xs">
                Error ID: <code>{error.digest}</code>
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigation.goToDashboard()}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Ir al Dashboard
          </Button>
          <Button 
            onClick={() => reset()}
            className="flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Intentar de nuevo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 