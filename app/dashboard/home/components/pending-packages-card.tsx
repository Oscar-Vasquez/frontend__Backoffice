"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, PackageOpen, Package, CircleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

// Polyfill para AbortSignal.timeout que no está disponible en todos los navegadores
if (!AbortSignal.timeout) {
  AbortSignal.timeout = function timeout(ms: number) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(new DOMException("TimeoutError", "TimeoutError")), ms);
    return controller.signal;
  };
}

interface Package {
  id: string;
  trackingNumber: string;
  packageStatus: string;
  weight: number;
  createdAt: string;
  client?: {
    name: string;
    photo?: string;
  };
}

// Process photo URL to ensure it has a proper format
const processPhotoUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  
  // Trim any whitespace
  url = url.trim();
  
  // If empty string after trim, return undefined
  if (!url) return undefined;
  
  // If already starts with http, return as is
  if (url.startsWith('http')) return url;
  
  // Add https:// if missing
  return `https://${url}`;
};

export default function PendingPackagesCard() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchPendingPackages = async () => {
      try {
        setLoading(true);
        
        // Obtener el token de autenticación
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('workexpress_token='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('No hay sesión activa');
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
        // Usar el endpoint correcto para obtener paquetes pendientes
        // Este endpoint devuelve datos paginados con un campo 'data' que contiene los paquetes
        const response = await fetch(`${apiUrl}/packages?status=pending&take=5&orderBy=created_at:desc`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          // Establecer un timeout para la solicitud para evitar que se quede colgado indefinidamente
          signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) {
          throw new Error(`Error al obtener los paquetes pendientes: ${response.status}`);
        }

        const responseData = await response.json();
        
        // Verificar que la respuesta tenga el formato esperado
        // El backend real devuelve { data: [...], meta: {...} }
        if (!responseData || !responseData.data) {
          throw new Error('Formato de respuesta inesperado desde el API');
        }
        
        // Transformar la estructura de datos según el formato del API real
        const formattedPackages = responseData.data.map((pkg: any) => ({
          id: pkg.id,
          trackingNumber: pkg.tracking_number || '',
          packageStatus: pkg.package_status || 'pending',
          weight: pkg.weight ? Number(pkg.weight) : 0,
          createdAt: pkg.created_at || new Date().toISOString(),
          client: pkg.users ? {
            name: `${pkg.users.first_name || ''} ${pkg.users.last_name || ''}`.trim() || 'Cliente',
            photo: processPhotoUrl(pkg.users.photo_url || pkg.users.photo || pkg.users.avatarUrl)
          } : undefined
        }));
        
        // Los datos ya vienen ordenados desde el API, pero por si acaso
        setPackages(formattedPackages);
      } catch (error) {
        console.error('Error al obtener paquetes pendientes:', error);
        setError('No se pudieron cargar los paquetes pendientes');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingPackages();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">Pendiente</Badge>;
      case 'in_transit':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500">En tránsito</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">Entregado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleViewAllPackages = () => {
    router.push('/dashboard/tracking');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <PackageOpen className="h-5 w-5 text-orange-500" />
            Paquetes Pendientes
          </CardTitle>
          <CardDescription>Envíos que requieren atención</CardDescription>
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <PackageOpen className="h-5 w-5 text-orange-500" />
            Paquetes Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <CircleAlert className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <PackageOpen className="h-5 w-5 text-orange-500" />
          Paquetes Pendientes
        </CardTitle>
        <CardDescription>Envíos que requieren atención</CardDescription>
      </CardHeader>
      <CardContent>
        {packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No hay paquetes pendientes</p>
          </div>
        ) : (
          <ScrollArea className="h-[250px] pr-4">
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div key={pkg.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10 border">
                    {pkg.client?.photo ? (
                      <AvatarImage 
                        src={pkg.client.photo} 
                        alt={pkg.client?.name || 'Cliente'} 
                        onError={(e) => {
                          console.log('Error loading client image:', pkg.client?.photo);
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pkg.client?.name || 'Cliente')}&background=random&color=fff&size=128&bold=true`;
                        }}
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {pkg.client?.name ? pkg.client.name.charAt(0).toUpperCase() : 'P'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium truncate">{pkg.trackingNumber}</p>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatDate(pkg.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(pkg.packageStatus)}
                      </div>
                    </div>
                    {pkg.client?.name && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        Cliente: {pkg.client.name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleViewAllPackages}>
            Ver todos los paquetes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 