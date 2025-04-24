"use client";

import * as React from "react"
import { cn } from "@/app/lib/utils"
import { Search, UserPlus, Mail, UserCheck, User, AlertCircle } from "lucide-react"
import { ExtendedFirebaseUser } from "../types"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  Card,
  CardContent
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BillingSearchProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  suggestions: ExtendedFirebaseUser[];
  showSuggestions: boolean;
  suggestionsRef: React.RefObject<HTMLDivElement>;
  loading: boolean;
  onSearch: () => void;
  onSuggestionClick: (user: ExtendedFirebaseUser) => void;
  enableSuggestions?: () => void;
}

export default function BillingSearch({
  searchQuery,
  onSearchQueryChange,
  suggestions,
  showSuggestions,
  suggestionsRef,
  loading,
  onSearch,
  onSuggestionClick,
  enableSuggestions
}: BillingSearchProps) {
  const [open, setOpen] = React.useState(false);
  const [manuallyToggled, setManuallyToggled] = React.useState(false);
  
  const handleInputChange = (value: string) => {
    if (enableSuggestions) {
      enableSuggestions();
    }
    onSearchQueryChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !loading) {
      onSearch();
    }
  };

  const handleSuggestionSelect = (userId: string) => {
    const user = suggestions.find(user => (user.id || user.userId) === userId);
    if (user) {
      onSuggestionClick(user);
      setOpen(false);
      setManuallyToggled(false);
    }
  };

  // Modificar el estado del Popover basado en los datos de sugerencias y visibilidad
  React.useEffect(() => {
    // Si el usuario ha activado manualmente el popover, mantenerlo abierto
    if (manuallyToggled) {
      return;
    }
    
    if (showSuggestions && suggestions.length > 0) {
      setOpen(true);
    } else if (!showSuggestions) {
      setOpen(false);
    }
  }, [showSuggestions, suggestions, manuallyToggled]);

  // Manejar el click en el input para mostrar todas las sugerencias
  const handleInputClick = () => {
    if (enableSuggestions) {
      enableSuggestions();
    }
    setManuallyToggled(true);
    setOpen(true);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Focus the input when clicking on the container
    const inputElement = e.currentTarget.querySelector('input');
    if (inputElement) {
      inputElement.focus();
    }
    
    handleInputClick();
  };

  // Renderizar el estado vacío con información útil
  const renderEmptyState = () => (
    <div className="flex flex-col items-center text-center py-6">
      <div className="rounded-full bg-muted p-3 mb-2">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <h4 className="text-sm font-medium mb-1">No se encontraron coincidencias</h4>
      <p className="text-xs text-muted-foreground max-w-[220px]">
        Intenta con otro término o un correo electrónico completo
      </p>
    </div>
  );

  // Renderizar cada sugerencia de usuario con un formato mejorado
  const renderSuggestion = (user: ExtendedFirebaseUser, isSelected: boolean) => (
    <div className="flex items-center w-full gap-3">
      {/* Avatar del usuario */}
      {user.photo ? (
        <img 
          src={user.photo} 
          alt={user.firstName}
          className="w-9 h-9 rounded-full object-cover border border-border/40 shadow-sm flex-shrink-0"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-primary" />
        </div>
      )}
      
      {/* Información del usuario */}
      <div className="flex-1 min-w-0">
        <div className="font-medium flex items-center gap-1.5">
          <span className="truncate">{user.firstName} {user.lastName}</span>
          {user.isVerified && (
            <Badge variant="outline" className="h-5 px-1 py-0 text-[10px] font-normal border-primary/20 text-primary bg-primary/5">
              <UserCheck className="h-3 w-3 mr-0.5" />
              <span>Verificado</span>
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
          <Mail className="w-3 h-3 flex-shrink-0 opacity-70" />
          <span className="truncate">{user.email}</span>
        </div>
      </div>
    </div>
  );

  // Filtrar sugerencias basadas en la búsqueda actual
  const filteredSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return suggestions; // Mostrar todas las sugerencias si no hay texto
    }
    
    const query = searchQuery.toLowerCase().trim();
    return suggestions.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const phone = (user.phone || user.phoneNumber || '').toLowerCase();
      
      return fullName.includes(query) || 
             email.includes(query) || 
             phone.includes(query);
    });
  }, [searchQuery, suggestions]);

  return (
    <div className="w-full flex flex-col" ref={suggestionsRef}>
      <Card className="border border-border/40 shadow-sm mb-6 w-full">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/10 rounded-full p-2 flex-shrink-0">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">Buscar Cliente</h2>
              <p className="text-sm text-muted-foreground">
                Busca por nombre completo, correo o teléfono
              </p>
            </div>
          </div>

          <div className="w-full">
            <Popover 
              open={open} 
              onOpenChange={(isOpen) => {
                setOpen(isOpen);
                if (!isOpen) {
                  setManuallyToggled(false);
                }
              }}
            >
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div className="relative flex-grow w-full">
                  <PopoverTrigger asChild>
                    <div 
                      className="flex items-center px-3 min-h-[48px] w-full border rounded-md bg-background shadow-sm group cursor-text relative hover:border-input transition-all duration-200"
                      onClick={handleContainerClick}
                      style={{ borderColor: "hsl(var(--input))" }}
                    >
                      <Search className="h-5 w-5 text-muted-foreground mr-3 group-focus-within:text-primary transition-colors duration-200 flex-shrink-0" />
                      <input
                        ref={(el) => {
                          // Si el input existe y estamos en estado de carga, mantener el foco
                          if (el && loading) {
                            el.focus();
                          }
                        }}
                        value={searchQuery}
                        onChange={(e) => {
                          // Siempre permitir cambios en el input, incluso durante la carga
                          e.stopPropagation(); // Evitar que otros controladores interfieran
                          const newValue = e.target.value;
                          // Actualizar inmediatamente el valor mostrado
                          e.target.value = newValue;
                          handleInputChange(newValue);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !loading) {
                            e.preventDefault();
                            onSearch();
                          }
                        }}
                        className="flex-1 h-12 w-full bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground/70 border-0 focus:outline-none transition-all duration-200"
                        placeholder="Nombre, correo o teléfono del cliente..."
                        style={{ caretColor: 'currentColor', maxWidth: '100%' }}
                        id="client-search-input"
                        autoComplete="off"
                        spellCheck="false"
                      />
                      {loading && (
                        <div className="relative h-5 w-5 animate-spin ml-2 flex-shrink-0">
                          <div className="h-5 w-5 rounded-full border-2 border-solid border-muted-foreground/40 border-t-muted-foreground"></div>
                        </div>
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="p-0 border-border/40 min-w-[320px] animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200" 
                    align="start"
                    sideOffset={5}
                    style={{ width: "var(--radix-popover-trigger-width)" }}
                  >
                    <div className="w-full bg-background rounded-md overflow-hidden">
                      {filteredSuggestions.length > 0 ? (
                        <>
                          <div className="sticky top-0 bg-muted/90 backdrop-blur-sm border-b px-3 py-2 flex items-center justify-between z-10">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center p-1 bg-primary/10 rounded-full">
                                <User className="h-3 w-3 text-primary" />
                              </span>
                              <span className="text-sm font-medium">
                                {filteredSuggestions.length} {filteredSuggestions.length === 1 ? 'cliente' : 'clientes'} 
                                {searchQuery.trim() ? ' encontrados' : ' disponibles'}
                              </span>
                            </div>
                          </div>
                          <div className="max-h-[280px] overflow-auto overscroll-contain">
                            {filteredSuggestions.map((user) => (
                              <div
                                key={user.id || user.userId}
                                onClick={() => handleSuggestionSelect((user.id || user.userId) as string)}
                                className="flex items-center py-2.5 px-3 cursor-pointer hover:bg-accent border-b border-border/20 last:border-0 transition-colors duration-150"
                              >
                                {renderSuggestion(user, false)}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div>{renderEmptyState()}</div>
                      )}
                    </div>
                  </PopoverContent>
                </div>
                <Button
                  onClick={onSearch}
                  disabled={loading || !searchQuery.trim()}
                  className="h-12 sm:w-auto min-w-[120px] transition-all duration-300 ease-in-out shadow-sm flex-shrink-0 text-base hover:shadow-md hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
                  aria-label={loading ? "Buscando..." : "Buscar cliente"}
                >
                  {loading ? (
                    <div className="flex items-center gap-2 animate-pulse">
                      <div className="relative h-5 w-5 animate-spin">
                        <div className="h-5 w-5 rounded-full border-2 border-solid border-primary border-t-transparent"></div>
                      </div>
                      <span>Buscando</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>Buscar</span>
                      <Search className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </div>
            </Popover>
          </div>

          <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1">
            <AlertCircle className="h-3 w-3 mt-0.5 opacity-70" />
            <span>Haz click en el campo de búsqueda para ver todos los clientes</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 