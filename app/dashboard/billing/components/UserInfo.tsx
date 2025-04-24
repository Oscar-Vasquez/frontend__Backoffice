"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { 
  User, 
  CheckCircle2, 
  Mail, 
  CalendarDays, 
  MapPin, 
  CreditCard, 
  Wallet, 
  Building2, 
  Phone, 
  AlertCircle,
  Box,
  Info,
  Clock,
  DollarSign,
  Calendar,
  Shield,
  Truck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExtendedFirebaseUser } from "../types";
import { Separator } from "@/components/ui/separator";

interface UserInfoProps {
  user: ExtendedFirebaseUser;
}

export default function UserInfo({ user }: UserInfoProps) {
  // Log para diagnóstico
  console.log('UserInfo recibió:', {
    userObject: user,
    hasBranch: user.branch !== undefined && user.branch !== null,
    hasPlan: user.subscriptionPlan !== undefined && user.subscriptionPlan !== null,
    planPrice: {
      subscriptionPlanPrice: user.subscriptionPlan?.price,
      planRate: user.planRate,
      price: user.price,
      priceType: user.subscriptionPlan?.price ? typeof user.subscriptionPlan.price : 'undefined'
    },
    branchFields: {
      branchName: user.branchName,
      branchObjectName: user.branch?.name,
      branchLocation: user.branchLocation,
      branchObjectLocation: user.branch?.location,
    },
  });
  
  // Verificar si hay información de contacto adicional
  const hasAdditionalContactInfo = user.phone || user.phoneNumber;

  // Formato personalizado para la fecha de nacimiento
  const formatBirthDate = (dateString?: string) => {
    if (!dateString) return 'No registrada';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

  // Formato personalizado para fechas genéricas
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return 'N/A';
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return String(dateString);
    }
  };

  // Formatear precio para mostrar moneda
  const formatCurrency = (amount?: number | string) => {
    if (amount === undefined || amount === null) return 'N/A';
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return 'N/A';
    
    return new Intl.NumberFormat('es-PA', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(numericAmount);
  };

  // Determinar el estado de cuenta basado en diversos campos
  const getAccountStatus = () => {
    // Si existe accountStatus como string, usarlo directamente
    if (typeof user.accountStatus === 'string') {
      return user.accountStatus;
    }
    
    // Si existe accountStatus como boolean, convertirlo
    if (typeof user.accountStatus === 'boolean') {
      return user.accountStatus ? 'active' : 'inactive';
    }
    
    // Si no, inferir del status o disabled
    if (user.status === true && user.disabled !== true) {
      return 'active';
    }
    
    if (user.status === false || user.disabled === true) {
      return 'inactive';
    }
    
    // Valor por defecto
    return 'active';
  };
  
  // Función auxiliar para convertir precio a número
  const parsePrice = (price: any): number | undefined => {
    if (price === undefined || price === null) return undefined;
    const parsed = typeof price === 'string' ? parseFloat(price) : price;
    return !isNaN(parsed) ? parsed : undefined;
  };
  
  // Verificar si existe el objeto plan
  const hasPlan = user.subscriptionPlan !== undefined && user.subscriptionPlan !== null && typeof user.subscriptionPlan === 'object';
  
  // Extraer información del plan que puede venir de diferentes fuentes
  const planInfo = {
    name: user.subscriptionPlan?.name || user.planName || 'No asignado',
    description: user.subscriptionPlan?.description || user.planDescription || '',
    price: parsePrice(user.subscriptionPlan?.price) || parsePrice(user.planRate) || parsePrice(user.price),
    cycle: user.subscriptionPlan?.billing_cycle || user.planFrequency || 'No especificado',
    color: user.subscriptionPlan?.color || '#E86343',
    isActive: hasPlan ? user.subscriptionPlan?.is_active !== false : true,
    id: user.subscriptionPlan?.id || user.planId || '',
  };

  // Verificar si existe el objeto branch
  const hasBranch = user.branch !== undefined && user.branch !== null && typeof user.branch === 'object';
  
  // Extraer información de la sucursal que puede venir de diferentes fuentes
  const branchInfo = {
    name: user.branchName || (hasBranch && user.branch?.name) || 'No asignado',
    address: user.branchAddress || (hasBranch && user.branch?.address) || '',
    province: user.branchProvince || (hasBranch && user.branch?.province) || '',
    city: user.branchCity || (hasBranch && user.branch?.city) || '',
    location: user.branchLocation || '',
    postalCode: user.branchZipcode || (hasBranch && user.branch?.postal_code) || '',
    phone: user.branchPhone || (hasBranch && user.branch?.phone) || '',
    managerName: hasBranch && user.branch?.manager_name ? user.branch?.manager_name : '',
    timezone: hasBranch && user.branch?.timezone ? user.branch?.timezone : '',
    prefix: hasBranch && user.branch?.prefix ? user.branch?.prefix : '',
    id: user.branchId || (hasBranch && user.branch?.id) || '',
  };

  // Obtener la foto del usuario de cualquiera de las propiedades disponibles
  const userPhoto = user.photo || user.photoURL;

  // Verificar el estado de verificación del usuario
  const isVerified = user.isVerified || user.emailVerified || user.isEmailVerified;
  
  const accountStatus = getAccountStatus();

  const hasBranchInfo = branchInfo.name !== 'No asignado' && branchInfo.name !== '';

  // Características del plan formateadas como array para mostrarse como bullets
  const planFeatures = planInfo.description ? planInfo.description.split('\n').filter(Boolean) : [];

  return (
    <Card className="rounded-lg shadow-sm border border-border/40 overflow-hidden">
      {/* Header */}
      <div className="bg-pink-50 dark:bg-pink-950/10 relative p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {userPhoto ? (
              <img 
                src={userPhoto} 
                alt={`${user.firstName} ${user.lastName}`}
                className="w-20 h-20 rounded-full object-cover shadow-sm border-2 border-white"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm border-2 border-white">
                <User className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex items-center mt-1.5 gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="h-3.5 w-3.5" />
                    {user.email}
                  </span>
                  {isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                </div>
                {user.createdAt && (
                  <p className="text-xs mt-1.5 text-slate-500 dark:text-slate-500">
                    Cliente desde: {formatDate(user.createdAt)}
                  </p>
                )}
              </div>
              
              <Badge 
                variant={isVerified ? 'outline' : 'secondary'}
                className="ml-0 sm:ml-auto"
              >
                {isVerified ? 'Verificado' : 'Pendiente de verificación'}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Badge de estado */}
        <div className="absolute top-3 right-3">
          <Badge 
            variant={accountStatus === 'active' ? 'success' : 'warning'} 
            className="px-2 py-1"
          >
            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${accountStatus === 'active' ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`}></span>
            {accountStatus === 'active' ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Columna izquierda */}
          <div className="p-5 space-y-6">
            {/* Información Personal */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">Información Personal</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-slate-500 dark:text-slate-400">Fecha de Nacimiento</h4>
                  <p className="text-sm mt-1">{formatBirthDate(user.birthDate)}</p>
                </div>
                
                {hasAdditionalContactInfo && (
                  <div>
                    <h4 className="text-xs text-slate-500 dark:text-slate-400">Teléfono</h4>
                    <p className="text-sm mt-1">{user.phone || user.phoneNumber}</p>
                  </div>
                )}
                
                {user.address && (
                  <div className="sm:col-span-2">
                    <h4 className="text-xs text-slate-500 dark:text-slate-400">Dirección</h4>
                    <p className="text-sm mt-1">{user.address}</p>
                  </div>
                )}
              </div>
            </div>
            
            <Separator />
            
            {/* Sucursal Asignada */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">Sucursal Asignada</h3>
              </div>
              
              {hasBranchInfo ? (
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-md p-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium">{branchInfo.name}</h4>
                      {branchInfo.prefix && (
                        <Badge variant="outline" className="text-[10px]">
                          {branchInfo.prefix}
                        </Badge>
                      )}
                    </div>
                    
                    {branchInfo.address && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mt-3">
                        <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                        <span>{branchInfo.address}</span>
                      </p>
                    )}
                    
                    {(branchInfo.city || branchInfo.province || branchInfo.postalCode || branchInfo.location) && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-4">
                        {[
                          branchInfo.city, 
                          branchInfo.province,
                          branchInfo.location, 
                          branchInfo.postalCode
                        ].filter(Boolean).join(', ')}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                      {branchInfo.phone && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          <span>{branchInfo.phone}</span>
                        </p>
                      )}
                      
                      {branchInfo.timezone && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>{branchInfo.timezone}</span>
                        </p>
                      )}
                    </div>
                    
                    {branchInfo.managerName && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          <span>Encargado: <span className="font-medium">{branchInfo.managerName}</span></span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-md p-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-500">No tiene sucursal asignada</span>
                </div>
              )}
            </div>
            
            {user.assignedLocker && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium">Locker Asignado</h3>
                  </div>
                  <Badge variant="secondary" className="font-mono">#{user.assignedLocker}</Badge>
                </div>
              </>
            )}
          </div>
          
          {/* Columna derecha */}
          <div className="p-5 space-y-6">
            {/* Información de Plan */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">Información de Plan</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs text-slate-500 dark:text-slate-400">Plan</h4>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className="font-medium"
                      style={{ 
                        backgroundColor: `${planInfo.color}10`, 
                        borderColor: planInfo.color,
                        color: planInfo.color
                      }}
                    >
                      {planInfo.name}
                    </Badge>
                    {planInfo.isActive && <Badge variant="success" className="text-xs">Activo</Badge>}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs text-slate-500 dark:text-slate-400">Precio</h4>
                  <p className="text-sm mt-1">
                    {planInfo.price !== undefined ? formatCurrency(planInfo.price) : 'No especificado'}
                  </p>
                </div>
                
                {planInfo.cycle && (
                  <div>
                    <h4 className="text-xs text-slate-500 dark:text-slate-400">Ciclo de Facturación</h4>
                    <p className="text-sm mt-1">{planInfo.cycle}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-xs text-slate-500 dark:text-slate-400">Billetera</h4>
                  <p className="text-sm mt-1">{user.walletName || 'No asignada'}</p>
                </div>
              </div>
              
              {planFeatures.length > 0 && (
                <div className="bg-primary/5 rounded-md p-4 mt-3">
                  <h4 className="text-xs font-medium mb-3">Características del Plan:</h4>
                  <ul className="space-y-2">
                    {planFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs">
                        <div className="mt-0.5 text-primary">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Información Adicional */}
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-medium">Información Adicional</h3>
              </div>
              
              {user.lastLogin && (
                <div>
                  <h4 className="text-xs text-slate-500 dark:text-slate-400">Último acceso</h4>
                  <p className="text-sm mt-1">{formatDate(user.lastLogin)}</p>
                </div>
              )}
              
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-md p-3">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">ID de Cliente</span>
                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{user.id || user.uid || user.userId}</code>
                  </div>
                  
                  {planInfo.id && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500">ID del Plan</span>
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{planInfo.id}</code>
                    </div>
                  )}
                  
                  {branchInfo.id && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500">ID de Sucursal</span>
                      <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{branchInfo.id}</code>
                    </div>
                  )}
                  
                  {hasBranch && user.branch?.created_at && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-500">Creación de Sucursal</span>
                      <span className="text-xs">{formatDate(user.branch.created_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {user.shipping_insurance !== undefined && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium">Seguro de Envío</h3>
                  </div>
                  <Badge 
                    variant={user.shipping_insurance ? "success" : "outline"} 
                    className="text-xs"
                  >
                    {user.shipping_insurance ? 'Activado' : 'No activado'}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Mensaje de alerta si existe */}
        {user.displayMessage && (
          <div className="p-4 mx-5 mb-5 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200">Información Importante</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                {user.displayMessage}
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-slate-50 dark:bg-slate-800/30 p-4 border-t flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Truck className="h-4 w-4 text-primary" />
          <span>Servicio: <strong>{planInfo.name}</strong></span>
          {planInfo.price !== undefined && (
            <Badge variant="outline" className="ml-2 font-semibold">
              {formatCurrency(planInfo.price)}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="h-8">
            <User className="h-3.5 w-3.5 mr-1.5" />
            <span>Editar Cliente</span>
          </Button>
          <Button size="sm" className="h-8">
            <CreditCard className="h-3.5 w-3.5 mr-1.5" />
            <span>Gestionar Plan</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}