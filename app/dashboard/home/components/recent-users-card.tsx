"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, CircleAlert, User, Users, Building } from "lucide-react";
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

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  photo?: string;
  accountStatus: boolean;
  planName?: string;
  branchName?: string;
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

export default function RecentUsersCard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRecentUsers = async () => {
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
        // Usar el endpoint correcto para obtener los usuarios
        const response = await fetch(`${apiUrl}/users/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          // Establecer un timeout para la solicitud para evitar que se quede colgado indefinidamente
          signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) {
          throw new Error(`Error al obtener los usuarios: ${response.status}`);
        }

        const data = await response.json();
        
        // Transformar la estructura de datos de acuerdo al formato devuelto por el API
        // En el backend real, los campos pueden tener nombres diferentes
        const formattedUsers = data.map((user: any) => {
          // Detectar el estado de la cuenta usando diferentes propiedades posibles
          // En el backend real se usan formatos distintos: status, disabled, account_status
          const isActive = 
            // Si existe status directo como boolean, usarlo
            typeof user.status === 'boolean' ? user.status : 
            // Si existe disabled, lo invertimos (disabled: false significa activo)
            typeof user.disabled === 'boolean' ? !user.disabled :
            // Verificar account_status o accountStatus
            user.account_status || user.accountStatus || false;
            
          return {
            id: user.id,
            firstName: user.first_name || user.firstName || '',
            lastName: user.last_name || user.lastName || '',
            email: user.email || '',
            createdAt: user.created_at || user.createdAt || new Date().toISOString(),
            photo: processPhotoUrl(user.photo_url || user.photoURL || user.photo || user.avatarUrl),
            accountStatus: isActive,
            planName: user.planName || (user.subscriptionPlan ? user.subscriptionPlan.name : (user.plans ? user.plans.name : '')),
            branchName: user.branchName || (user.branch ? user.branch.name : (user.branches ? user.branches.name : ''))
          };
        });
        
        // Ordenar por fecha de creación descendente (más recientes primero)
        const sortedUsers = formattedUsers.sort((a: UserData, b: UserData) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        // Limitamos a 5 usuarios para la tarjeta
        setUsers(sortedUsers.slice(0, 5));
      } catch (error) {
        console.error('Error al obtener usuarios recientes:', error);
        setError('No se pudieron cargar los usuarios recientes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUsers();
  }, []);

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500">Activo</Badge>
    ) : (
      <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500">Inactivo</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const handleViewAllUsers = () => {
    router.push('/dashboard/users/clients');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Usuarios Recientes
          </CardTitle>
          <CardDescription>Últimos clientes registrados</CardDescription>
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
            <Users className="h-5 w-5 text-blue-500" />
            Usuarios Recientes
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
          <Users className="h-5 w-5 text-blue-500" />
          Usuarios Recientes
        </CardTitle>
        <CardDescription>Últimos clientes registrados</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <User className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No hay usuarios recientes</p>
          </div>
        ) : (
          <ScrollArea className="h-[250px] pr-4">
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10 border">
                    {user.photo ? (
                      <AvatarImage 
                        src={user.photo} 
                        alt={`${user.firstName} ${user.lastName}`} 
                        onError={(e) => {
                          console.log('Error loading image:', user.photo);
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user.firstName} ${user.lastName}`)}&background=random&color=fff&size=128&bold=true`;
                        }}
                      />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{user.email}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(user.accountStatus)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                      {user.branchName && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Building className="h-3 w-3 mr-1" />
                          <span className="truncate">{user.branchName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleViewAllUsers}>
            Ver todos los usuarios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 