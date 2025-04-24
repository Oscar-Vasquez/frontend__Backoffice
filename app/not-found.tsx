'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from './hooks/useNavigation';
import { FileQuestion, Home, Search } from 'lucide-react';

export default function NotFound() {
  const navigation = useNavigation();
  
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-blue-600">
            <FileQuestion className="h-5 w-5" />
            <CardTitle>Página no encontrada</CardTitle>
          </div>
          <CardDescription>
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          <div className="text-8xl font-bold text-gray-200 dark:text-gray-800">404</div>
          <Search className="h-16 w-16 text-gray-300 dark:text-gray-700 mt-4" />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigation.back()}
            className="flex items-center gap-2"
          >
            Volver atrás
          </Button>
          <Button 
            onClick={() => navigation.goToDashboard()}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Ir al Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 