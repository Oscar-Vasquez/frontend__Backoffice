"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Ban, 
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  CreditCard,
  Building2,
  Paperclip,
  Send,
  X
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useThemeSettingsStore from "@/store/themeSettingsStore";

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

export interface TableUser {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status?: string;
  accountStatus: boolean;
  branchName: string;
  branchReference: string;
  branchLocation?: string;
  branchAddress?: string;
  subscriptionPlan: string;
  planName: string;
  planRate?: number;
  walletReference: string;
  walletName: string;
  walletAmount?: number;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
  lastSeen?: string;
  photo?: string;
  avatarUrl?: string;
  personType?: 'natural' | 'juridica';
}

interface UsersTableProps {
  users: TableUser[];
  onUpdateStatus: (userId: string, newStatus: boolean) => void;
}

export default function UsersTable({ users, onUpdateStatus }: UsersTableProps) {
  const { themeColor } = useThemeSettingsStore();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [actionType, setActionType] = useState<'activate' | 'deactivate'>('activate');
  const [currentUser, setCurrentUser] = useState<TableUser | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    attachments: [] as File[]
  });
  const [selectedUserForEmail, setSelectedUserForEmail] = useState<TableUser | null>(null);

  const handleStatusChange = (userId: string, currentStatus: boolean) => {
    setSelectedUser(userId);
    setActionType(currentStatus ? 'deactivate' : 'activate');
    setIsConfirmOpen(true);
    
    // Log para diagnóstico
    console.log('🔍 Iniciando cambio de estado:', {
      userId,
      currentStatus,
      actionType: currentStatus ? 'deactivate' : 'activate',
      newStatusWillBe: !currentStatus
    });
  };

  const handleConfirmAction = () => {
    if (selectedUser) {
      const newStatus = actionType === 'activate';
      const userId = selectedUser;
      const action = actionType;
      
      // Log para diagnóstico
      console.log('✅ Confirmando acción:', {
        userId,
        actionType: action,
        newStatus
      });
      
      // Primero limpiar el estado para evitar problemas de diálogos en cascada
      setIsConfirmOpen(false);
      setSelectedUser(null);
      setActionType('activate'); // Reset al valor predeterminado
      
      // Luego llamar a la función de actualización después de un pequeño delay
      // para asegurar que la UI se ha actualizado
      setTimeout(() => {
        onUpdateStatus(userId, newStatus);
      }, 50);
    }
  };

  const handleUserClick = (user: TableUser) => {
    setCurrentUser(user);
    setIsProfileOpen(true);
  };

  const handleOpenEmailModal = (user: TableUser, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUserForEmail(user);
    setIsEmailModalOpen(true);
  };

  const handleSendEmail = async () => {
    if (!selectedUserForEmail) return;
    
    // Aquí iría la lógica para enviar el email
    console.log('Enviando email a:', selectedUserForEmail.email, emailData);
    
    // Resetear el formulario
    setEmailData({
      subject: '',
      message: '',
      attachments: []
    });
    setIsEmailModalOpen(false);
    setSelectedUserForEmail(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setEmailData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(e.target.files || [])]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setEmailData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const getThemeGradient = () => {
    switch (themeColor) {
      case 'lime':
        return 'from-lime-600 to-green-600';
      case 'sky':
        return 'from-sky-600 to-blue-600';
      case 'emerald':
        return 'from-emerald-600 to-teal-600';
      case 'rose':
        return 'from-rose-600 to-pink-600';
      case 'amber':
        return 'from-amber-600 to-orange-600';
      case 'purple':
        return 'from-purple-600 to-indigo-600';
      case 'slate':
        return 'from-slate-600 to-zinc-600';
      case 'neutral':
        return 'from-neutral-600 to-gray-600';
      default:
        return 'from-blue-600 to-indigo-600';
    }
  };

  const getThemeHoverGradient = () => {
    switch (themeColor) {
      case 'lime':
        return 'hover:from-lime-700 hover:to-green-700';
      case 'sky':
        return 'hover:from-sky-700 hover:to-blue-700';
      case 'emerald':
        return 'hover:from-emerald-700 hover:to-teal-700';
      case 'rose':
        return 'hover:from-rose-700 hover:to-pink-700';
      case 'amber':
        return 'hover:from-amber-700 hover:to-orange-700';
      case 'purple':
        return 'hover:from-purple-700 hover:to-indigo-700';
      case 'slate':
        return 'hover:from-slate-700 hover:to-zinc-700';
      case 'neutral':
        return 'hover:from-neutral-700 hover:to-gray-700';
      default:
        return 'hover:from-blue-700 hover:to-indigo-700';
    }
  };

  const getThemeShadow = () => {
    switch (themeColor) {
      case 'lime':
        return 'shadow-lime-600/20 hover:shadow-lime-600/30';
      case 'sky':
        return 'shadow-sky-600/20 hover:shadow-sky-600/30';
      case 'emerald':
        return 'shadow-emerald-600/20 hover:shadow-emerald-600/30';
      case 'rose':
        return 'shadow-rose-600/20 hover:shadow-rose-600/30';
      case 'amber':
        return 'shadow-amber-600/20 hover:shadow-amber-600/30';
      case 'purple':
        return 'shadow-purple-600/20 hover:shadow-purple-600/30';
      case 'slate':
        return 'shadow-slate-600/20 hover:shadow-slate-600/30';
      case 'neutral':
        return 'shadow-neutral-600/20 hover:shadow-neutral-600/30';
      default:
        return 'shadow-blue-600/20 hover:shadow-blue-600/30';
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
            <TableHead className="dark:text-gray-300">Cliente</TableHead>
            <TableHead className="dark:text-gray-300">Email</TableHead>
            <TableHead className="dark:text-gray-300">Estado</TableHead>
            <TableHead className="dark:text-gray-300">Fecha de Registro</TableHead>
            <TableHead className="text-right dark:text-gray-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" onClick={() => handleUserClick(user)}>
              <TableCell className="font-medium dark:text-gray-300">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage 
                      src={processPhotoUrl(user.avatarUrl || user.photo)} 
                      onError={(e) => {
                        console.log('Error loading user image:', user.avatarUrl || user.photo);
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user.firstName} ${user.lastName}`)}&background=random&color=fff&size=128&bold=true`;
                      }}
                    />
                    <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium dark:text-gray-200">{user.firstName} {user.lastName}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="dark:text-gray-300">{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.accountStatus ? 'success' : 'destructive'} className="px-3 py-1 text-sm">
                  {user.accountStatus ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="dark:text-gray-300">
                {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4 dark:text-gray-300" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px] dark:bg-gray-800 dark:border-gray-700">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(user.id, user.accountStatus);
                      }}
                      className={`text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        user.accountStatus ? 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300' : 'text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300'
                      }`}
                    >
                      {user.accountStatus ? (
                        <>
                          <Ban className="h-4 w-4 mr-2" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => handleOpenEmailModal(user, e)}
                      className="text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar mensaje
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Diálogo de Confirmación */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'activate' ? '¿Activar cliente?' : '¿Desactivar cliente?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'activate' 
                ? 'El cliente podrá acceder a todos los servicios nuevamente.'
                : 'El cliente no podrá acceder a los servicios mientras esté desactivado.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={actionType === 'activate' ? 'bg-green-600' : 'bg-red-600'}
            >
              {actionType === 'activate' ? 'Activar' : 'Desactivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Perfil */}
      <AlertDialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Perfil del Cliente
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Detalles del perfil del cliente, incluyendo información de contacto, sucursal asignada, plan de servicio y fechas importantes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {currentUser && (
            <div className="relative">
              {/* Fondo decorativo */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-red-500 to-red-600 rounded-t-lg" />
              
              <div className="relative pt-16 px-6">
                {/* Avatar y nombre */}
                <div className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage 
                      src={processPhotoUrl(currentUser.avatarUrl || currentUser.photo)} 
                      onError={(e) => {
                        console.log('Error loading user profile image:', currentUser.avatarUrl || currentUser.photo);
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(`${currentUser.firstName} ${currentUser.lastName}`)}&background=random&color=fff&size=128&bold=true`;
                      }}
                    />
                    <AvatarFallback className="text-2xl bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="mt-4 text-2xl font-bold">
                    {currentUser.firstName} {currentUser.lastName}
                  </h2>
                  <Badge 
                    variant={currentUser.accountStatus ? "default" : "destructive"}
                    className="capitalize"
                  >
                    Cliente {currentUser.accountStatus ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>

                <ScrollArea className="mt-6 h-[400px] pr-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Información de Contacto */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5 text-red-500" />
                        Información de Contacto
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">Email: {currentUser.email}</p>
                        <p className="text-gray-600">Teléfono: {currentUser.phone || 'No especificado'}</p>
                      </div>

                      <Separator />

                      {/* Información de Sucursal */}
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-red-500" />
                        Sucursal Asignada
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          Nombre: {currentUser.branchName || 'No asignada'}
                        </p>
            
                        <p className="text-gray-600">
                          Dirección: {currentUser.branchAddress || 'No especificada'}
                        </p>
                      </div>
                    </div>

                    {/* Información de Plan y Billetera */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Package className="h-5 w-5 text-red-500" />
                        Plan de cliente
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          Plan: {currentUser.planName || 'No especificado'}
                        </p>
                        <br />
                        
                        
                      </div>

                      <Separator />

                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-red-500" />
                        Billetera
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          Nombre: {currentUser.walletName || 'No asignada'}
                        </p>
                        
                      </div>
                    </div>

                    {/* Fechas Importantes */}
                    <div className="col-span-2 space-y-4">
                      <Separator />
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-red-500" />
                        Fechas Importantes
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Fecha de Registro</p>
                          <p className="font-medium">
                            {currentUser.createdAt ? formatDate(new Date(currentUser.createdAt)) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Último Acceso</p>
                          <p className="font-medium">
                            {currentUser.lastSeen && currentUser.lastSeen !== 'null' 
                              ? formatDate(new Date(currentUser.lastSeen)) 
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
                    Cerrar
                  </Button>
                  <Button
                    variant={currentUser.accountStatus ? 'destructive' : 'default'}
                    onClick={() => {
                      // Guardar los valores que necesitamos antes de cerrar el diálogo
                      const userId = currentUser.id;
                      const currentStatus = currentUser.accountStatus;
                      
                      // Log para diagnóstico
                      console.log('🔄 Actualizando desde perfil:', {
                        userId,
                        currentStatus,
                        newStatus: !currentStatus
                      });
                      
                      // Primero cerrar el perfil y limpiar completamente su estado
                      setIsProfileOpen(false);
                      setCurrentUser(null);
                      
                      // Esperar a que se cierre el perfil antes de abrir el diálogo de confirmación
                      setTimeout(() => {
                        handleStatusChange(userId, currentStatus);
                      }, 100); // Incrementar el tiempo de espera para asegurar el cierre completo
                    }}
                  >
                    {currentUser.accountStatus ? (
                      <>
                        <Ban className="h-4 w-4 mr-2" />
                        Desactivar Cliente
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Activar Cliente
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Envío de Email */}
      <AlertDialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <AlertDialogContent className="max-w-4xl p-0 bg-white/95 backdrop-blur-xl border-0 shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none" />
          <div className={`absolute inset-0 bg-gradient-to-tr from-${themeColor}-500/[0.02] via-${themeColor}-500/[0.02] to-${themeColor}-500/[0.02] pointer-events-none`} />
          
          {/* Header con gradiente */}
          <div className={`relative bg-gradient-to-r ${getThemeGradient()} p-6`}>
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
            <div className="relative flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Nuevo Mensaje
                </h2>
                <p className="text-white/80 text-sm">
                  Envía un mensaje personalizado a tu cliente
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEmailModalOpen(false)}
                className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* Destinatario con diseño mejorado */}
            <div className={`flex items-center gap-4 p-4 bg-gradient-to-r from-${themeColor}-50 to-${themeColor}-50/50 rounded-xl border border-${themeColor}-100/50`}>
              <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                <AvatarImage src={selectedUserForEmail?.avatarUrl} />
                <AvatarFallback className={`bg-${themeColor}-100 text-${themeColor}-700 font-medium`}>
                  {selectedUserForEmail?.firstName?.[0]}{selectedUserForEmail?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-gray-900">
                  {selectedUserForEmail?.firstName} {selectedUserForEmail?.lastName}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  {selectedUserForEmail?.email}
                </p>
              </div>
            </div>

            {/* Formulario con diseño mejorado */}
            <div className="grid grid-cols-1 gap-6">
              {/* Asunto */}
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                  Asunto del mensaje
                </Label>
                <div className="relative group">
                  <Input
                    id="subject"
                    value={emailData.subject}
                    onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Escribe un asunto claro y conciso..."
                    className={`h-11 pl-4 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-lg`}
                  />
                </div>
              </div>

              {/* Editor de Mensaje */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700 flex items-center justify-between">
                  <span>Contenido del mensaje</span>
                  <span className="text-xs text-gray-400 font-normal">
                    Usa Markdown para dar formato
                  </span>
                </Label>
                <div className="relative group">
                  <Textarea
                    id="message"
                    value={emailData.message}
                    onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Escribe tu mensaje aquí..."
                    className={`min-h-[200px] p-4 bg-gray-50/50 border-gray-200 focus:border-${themeColor}-500 focus:ring-${themeColor}-500/20 transition-all duration-300 rounded-lg resize-none`}
                  />
                  <div className={`absolute inset-0 border border-gray-200 rounded-lg pointer-events-none transition-all duration-300 group-focus-within:border-${themeColor}-500 group-focus-within:ring-4 group-focus-within:ring-${themeColor}-500/20`} />
                </div>
              </div>

              {/* Archivos Adjuntos con Drag & Drop */}
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Archivos adjuntos
                </Label>
                
                <div className="relative">
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    multiple
                  />
                  <Label
                    htmlFor="file-upload"
                    className="group relative flex flex-col items-center gap-4 p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className={`p-3 bg-${themeColor}-100 rounded-xl text-${themeColor}-600 group-hover:scale-110 transition-transform duration-300`}>
                      <Paperclip className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Arrastra archivos aquí o haz clic para seleccionar
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Soporta cualquier tipo de archivo hasta 10MB
                      </p>
                    </div>
                  </Label>
                </div>

                {/* Lista de archivos con animación */}
                {emailData.attachments.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {emailData.attachments.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-${themeColor}-50 rounded-lg`}>
                            <Paperclip className={`h-4 w-4 text-${themeColor}-500`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 truncate max-w-[300px]">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer con efectos */}
          <div className="p-6 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>Se enviará inmediatamente</span>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="h-10 px-4 text-gray-600 hover:text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSendEmail}
                  className={`h-10 px-6 relative overflow-hidden bg-gradient-to-r ${getThemeGradient()} ${getThemeHoverGradient()} text-white shadow-lg ${getThemeShadow()} transition-all duration-300 rounded-lg`}
                >
                  <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
                  <span className="relative flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Enviar mensaje
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}