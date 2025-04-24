"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Search, Truck, CircleAlert, PackageSearch, ArrowRight, Package, MapPin, Calendar, User, X, ExternalLink } from "lucide-react";
import { packagesService } from "@/app/services/packages.service";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Tipo para el paquete
interface PackageDetails {
  id: string;
  tracking_number?: string;
  trackingNumber?: string;
  package_status?: string;
  packageStatus?: string;
  weight?: number;
  created_at?: string;
  createdAt?: string;
  // Posibles propiedades para referencia al usuario
  user_id?: string;
  userId?: string;
  client_id?: string;
  clientId?: string;
  // Posibles formatos de datos de usuario
  users?: {
    id?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    firstName?: string;
    name?: string;
    email?: string;
    photo_url?: string;
    photoURL?: string;
  };
  client?: {
    id?: string;
    name?: string;
    email?: string;
  };
  user?: {
    id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  branch?: {
    name: string;
    province?: string;
  };
  branches?: {
    name: string;
    province?: string;
  };
  operator?: {
    name: string;
  };
  branchName?: string;
  branch_name?: string;
  branch_id?: string;
  branchId?: string;
}

export default function TrackingSearchCard() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundPackage, setFoundPackage] = useState<PackageDetails | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      toast({
        title: "Error de búsqueda",
        description: "Por favor ingresa un número de tracking válido",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setFoundPackage(null);
    
    try {
      // Verificar si el paquete existe
      const result = await packagesService.findByTracking(trackingNumber.trim());
      
      if (result) {
        setFoundPackage(result);
        toast({
          title: "Paquete encontrado",
          description: `Paquete con tracking ${trackingNumber} encontrado.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Paquete no encontrado",
          description: "No se encontró ningún paquete con ese número de tracking",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error al buscar el paquete:', error);
      toast({
        title: "Error de búsqueda",
        description: "Ocurrió un error al buscar el paquete",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewAll = () => {
    router.push('/dashboard/tracking');
  };

  const handleClearSearch = () => {
    setTrackingNumber('');
    setFoundPackage(null);
  };

  const handleViewDetails = () => {
    if (foundPackage) {
      const tracking = foundPackage.tracking_number || foundPackage.trackingNumber;
      router.push(`/dashboard/tracking?tracking=${tracking}`);
    }
  };

  // Función para obtener la etiqueta de estado
  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
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

  // Función para formatear la fecha
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Fecha no disponible';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Obtener nombre del cliente
  const getClientName = (pkg: PackageDetails) => {
    // Función auxiliar para construir nombre completo desde diferentes propiedades
    const buildFullName = (first?: string, last?: string) => {
      const fullName = `${first || ''} ${last || ''}`.trim();
      return fullName || undefined;
    };

    try {
      // 1. Verificar estructura "users"
      if (pkg.users) {
        // Intentar obtener el nombre completo usando first_name/last_name o firstName/lastName
        const fullName = buildFullName(
          pkg.users.first_name || pkg.users.firstName,
          pkg.users.last_name || pkg.users.lastName
        );
        if (fullName) return fullName;
        
        // Si hay name directo
        if (pkg.users.name) return pkg.users.name;
        
        // Usar email como último recurso
        if (pkg.users.email) return pkg.users.email.split('@')[0];
      }
      
      // 2. Verificar estructura "user"
      if (pkg.user) {
        // Intentar obtener el nombre completo (solo usar camelCase)
        const fullName = buildFullName(
          pkg.user.firstName,
          pkg.user.lastName
        );
        if (fullName) return fullName;
        
        // Si hay name directo
        if (pkg.user.name) return pkg.user.name;
        
        // Usar email como último recurso
        if (pkg.user.email) return pkg.user.email.split('@')[0];
      }
      
      // 3. Verificar estructura "client"
      if (pkg.client) {
        if (pkg.client.name) return pkg.client.name;
        if (pkg.client.email) return pkg.client.email.split('@')[0];
      }
      
      // 4. Verificar IDs que indican presencia de cliente
      if (pkg.user_id || pkg.userId || pkg.client_id || pkg.clientId) {
        return 'Cliente asignado';
      }
      
      // 5. Si llegamos aquí, no hay cliente
      return 'Cliente no asignado';
    } catch (error) {
      console.error('Error al obtener nombre del cliente:', error);
      return 'Cliente asignado'; // Valor predeterminado en caso de error
    }
  };

  // Obtener sucursal
  const getBranchName = (pkg: PackageDetails) => {
    try {
      // Verificar si existe branch
      if (pkg.branch && typeof pkg.branch === 'object') {
        if (pkg.branch.name) return pkg.branch.name;
        if (pkg.branch.province) return `Sucursal en ${pkg.branch.province}`;
      }
      
      // Verificar si existe branches
      if (pkg.branches && typeof pkg.branches === 'object') {
        if (pkg.branches.name) return pkg.branches.name;
        if (pkg.branches.province) return `Sucursal en ${pkg.branches.province}`;
      }
      
      // Verificar si existe branchName directamente en el paquete
      if (pkg.branchName) return pkg.branchName;
      
      // Verificar si existe branch_name directamente en el paquete
      if (pkg.branch_name) return pkg.branch_name;
      
      // Verificar si existe branch_id o branchId
      if (pkg.branch_id || pkg.branchId) return 'Sucursal asignada';
      
      // Si no hay información de sucursal
      return 'Sucursal no asignada';
    } catch (error) {
      console.error('Error al obtener nombre de la sucursal:', error);
      return 'Sucursal asignada'; // Valor predeterminado en caso de error
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Truck className="h-5 w-5 text-green-500" />
          Buscar Paquete
        </CardTitle>
        <CardDescription>Consulta rápida de envíos por tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Ingresa el número de tracking"
              className="pl-9 pr-4"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              disabled={isSearching}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isSearching || !trackingNumber.trim()}
            >
              {isSearching ? (
                <>
                  <PackageSearch className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <PackageSearch className="mr-2 h-4 w-4" />
                  Buscar Paquete
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleViewAll}
            >
              Ver Todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
        
        {/* Resultados del paquete */}
        {foundPackage && (
          <div className="mt-6 bg-muted/30 border rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <Package className="h-5 w-5 text-primary mr-2" />
                <h3 className="font-medium">Información del Paquete</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearSearch} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <Separator className="my-2" />
            
            <div className="space-y-3 my-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Tracking:</div>
                <div className="font-medium">{foundPackage.tracking_number || foundPackage.trackingNumber}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Estado:</div>
                <div>{getStatusBadge(foundPackage.package_status || foundPackage.packageStatus)}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Peso:</div>
                <div>{foundPackage.weight ? `${foundPackage.weight} kg` : 'No disponible'}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Fecha:</div>
                <div className="text-sm">{formatDate(foundPackage.created_at || foundPackage.createdAt)}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Cliente:</div>
                <div className="text-sm truncate max-w-[60%] text-right">{getClientName(foundPackage)}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">Sucursal:</div>
                <div className="text-sm truncate max-w-[60%] text-right">{getBranchName(foundPackage)}</div>
              </div>
            </div>
            
            <Button 
              onClick={handleViewDetails} 
              className="w-full mt-3"
              variant="outline"
            >
              Ver detalles completos
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* Mensaje informativo (solo mostrar si no hay resultados) */}
        {!foundPackage && (
          <div className="mt-6 bg-muted/50 p-3 rounded-lg">
            <div className="flex">
              <div className="mr-3 flex-shrink-0">
                <CircleAlert className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Ingresa el número de tracking completo (incluidos letras y números) 
                  para obtener información detallada sobre el estado del envío.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 