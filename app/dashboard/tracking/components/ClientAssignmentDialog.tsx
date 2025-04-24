import React, { memo, useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  AlertCircle, 
  Loader2, 
  BadgeCheck, 
  Users 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Definición local de las interfaces para evitar problemas de importación
interface Client {
  id: string;
  name: string;
  email: string;
  planRate: number;
  photo?: string;
  planName?: string;
  branchName?: string;
}

interface SelectableItem {
  id: string;
  name: string;
}

interface ClientAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  themeColor: string;
  clients: Client[];
  filteredClients: Client[];
  isLoadingClients: boolean;
  isAssigningClient: boolean;
  error: string | null;
  clientSearchQuery: string;
  selectedClient: SelectableItem | null;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectClient: (client: Client) => void;
  onConfirmAssign: () => void;
}

// Cliente para esqueleto de carga
const ClientSkeleton = () => (
  <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 mr-3"></div>
        <div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
      <div className="text-right">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  </div>
);

/**
 * Componente para mostrar el diálogo de asignación de cliente
 * Utilizamos memo para evitar re-renderizados innecesarios
 */
export const ClientAssignmentDialog: React.FC<ClientAssignmentDialogProps> = memo(({
  isOpen,
  onOpenChange,
  themeColor,
  clients,
  filteredClients,
  isLoadingClients,
  isAssigningClient,
  error,
  clientSearchQuery,
  selectedClient,
  onSearchChange,
  onSelectClient,
  onConfirmAssign
}) => {
  // Estado local para controlar la cantidad de clientes a mostrar
  const [visibleClientsCount, setVisibleClientsCount] = useState(20);
  const clientsContainerRef = useRef<HTMLDivElement>(null);
  
  // Función para mostrar más clientes al hacer scroll
  const handleScroll = () => {
    const container = clientsContainerRef.current;
    if (!container) return;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    // Si llegamos cerca del final (80% del scroll), cargar más clientes
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      setVisibleClientsCount(prev => prev + 20);
    }
  };
  
  // Reset el contador de clientes visibles cuando cambia la lista filtrada
  useEffect(() => {
    setVisibleClientsCount(20);
  }, [filteredClients.length]);
  
  // Función helper para obtener la clase correcta basada en el tema
  const getThemeColorClass = (baseClass: string, shade: number) => {
    // Definir colores compatibles con Tailwind
    const validColors = ['blue', 'red', 'green', 'yellow', 'purple', 'pink', 'indigo', 'gray'];
    const color = validColors.includes(themeColor) ? themeColor : 'blue';
    return `${baseClass}-${color}-${shade}`;
  };
  
  // Limitar la cantidad de clientes a mostrar para mejorar el rendimiento
  const visibleClients = filteredClients.slice(0, visibleClientsCount);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          animation: 'dialog-content-show 150ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <style jsx global>{`
          @keyframes dialog-content-show {
            from {
              opacity: 0;
              transform: translate(-50%, -48%) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }
        `}</style>
        
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">Asignar cliente al paquete</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Selecciona un cliente para asignar a este paquete
            {isLoadingClients ? null : (
              <span className="text-xs font-normal ml-2">
                Mostrando {visibleClients.length} de {filteredClients.length} clientes
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar cliente por nombre o email"
              className="pl-10"
              value={clientSearchQuery}
              onChange={onSearchChange}
            />
          </div>
        </div>
        
        <div 
          className="flex-1 overflow-y-auto min-h-[200px] max-h-[400px]"
          ref={clientsContainerRef}
          onScroll={handleScroll}
        >
          {error && (
            <div className="text-center p-4 text-red-500">
              <AlertCircle className="h-6 w-6 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          )}
          
          {isLoadingClients ? (
            <div className="space-y-2">
              {/* Mostrar varios skeletons para indicar la carga */}
              {[...Array(5)].map((_, i) => (
                <ClientSkeleton key={i} />
              ))}
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              <Users className="h-6 w-6 mx-auto mb-2" />
              <p>No se encontraron clientes</p>
            </div>
          ) : (
            <div className="space-y-2">
              {visibleClients.map((client) => (
                <div
                  key={client.id}
                  className={cn(
                    "p-3 rounded-lg cursor-pointer transition-colors border",
                    selectedClient?.id === client.id 
                      ? cn(
                          getThemeColorClass('bg', 100),
                          getThemeColorClass('dark:bg', 900) + '/30',
                          getThemeColorClass('border', 200),
                          getThemeColorClass('dark:border', 800)
                        )
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 border-transparent'
                  )}
                  onClick={() => onSelectClient(client)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center uppercase font-bold text-sm mr-3">
                        {client.name?.substring(0, 2) || client.email?.substring(0, 2) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{client.name || 'Usuario'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{client.email}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {client.branchName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-700 dark:text-gray-300">${client.planRate.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{client.planName}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {visibleClients.length < filteredClients.length && (
                <div className="text-center py-2 text-sm text-gray-500">
                  Scroll para cargar más clientes...
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="lg" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={onConfirmAssign}
            disabled={!selectedClient || isAssigningClient}
            className={cn(
              "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800",
              "text-white font-medium",
              !selectedClient ? "opacity-50" : "opacity-100"
            )}
          >
            {isAssigningClient ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Asignando...
              </>
            ) : (
              <>
                <BadgeCheck className="h-5 w-5 mr-2" />
                Confirmar Asignación
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}); 