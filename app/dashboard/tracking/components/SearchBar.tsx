'use client';

import React, { useState, useEffect } from 'react';
import { Search, Package, QrCode, X, Clock, ScanBarcode, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  themeColor: string;
}

// Número máximo de búsquedas recientes a mostrar
const MAX_RECENT_SEARCHES = 5;

/**
 * Componente de barra de búsqueda para los envíos
 * Implementa diseño profesional para backoffice corporativo
 * Diseño eficiente y funcional con buenas prácticas de UX
 * Utiliza shadcn UI para consistencia de diseño
 */
const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  isLoading,
  themeColor
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<'tracking' | 'advanced'>('tracking');
  
  // Evita problemas de hidratación y carga las búsquedas recientes
  useEffect(() => {
    setMounted(true);
    
    // Cargar búsquedas recientes del localStorage
    const storedSearches = localStorage.getItem('recentSearches');
    if (storedSearches) {
      try {
        const parsedSearches = JSON.parse(storedSearches);
        if (Array.isArray(parsedSearches)) {
          setRecentSearches(parsedSearches.slice(0, MAX_RECENT_SEARCHES));
        }
      } catch (error) {
        console.error('Error parsing recent searches:', error);
        // Si hay error, inicializar con array vacío
        localStorage.setItem('recentSearches', JSON.stringify([]));
      }
    } else {
      // Inicializar si no existe
      localStorage.setItem('recentSearches', JSON.stringify([]));
    }
  }, []);
  
  // Maneja el envío del formulario de búsqueda
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Por favor ingresa un número de tracking');
      return;
    }
    
    // Añadir a búsquedas recientes si no existe ya
    addToRecentSearches(query.trim());
    
    onSearch(query.trim());
  };

  // Maneja el clic en una búsqueda reciente
  const handleRecentSearch = (term: string) => {
    setQuery(term);
    onSearch(term);
    
    // Mover esta búsqueda al inicio (más reciente)
    addToRecentSearches(term);
  };
  
  // Añade una búsqueda al historial de recientes
  const addToRecentSearches = (term: string) => {
    // Crear nuevo array sin la búsqueda actual (si existe)
    const updatedSearches = recentSearches.filter(search => search !== term);
    
    // Añadir la búsqueda al principio
    updatedSearches.unshift(term);
    
    // Limitar a MAX_RECENT_SEARCHES
    const limitedSearches = updatedSearches.slice(0, MAX_RECENT_SEARCHES);
    
    // Actualizar estado y localStorage
    setRecentSearches(limitedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(limitedSearches));
  };
  
  // Elimina una búsqueda reciente
  const removeRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation(); // Evitar que se propague al botón contenedor
    
    const updatedSearches = recentSearches.filter(search => search !== term);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };
  
  // Limpia todas las búsquedas recientes
  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.setItem('recentSearches', JSON.stringify([]));
    toast.success('Historial de búsquedas borrado');
  };
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="w-full">
      <Tabs 
        defaultValue="tracking" 
        className="w-full mb-5"
        onValueChange={(value) => setSearchType(value as 'tracking' | 'advanced')}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 p-1 bg-muted/50 backdrop-blur-sm">
          <TabsTrigger 
            value="tracking" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
          >
            <Package className="h-4 w-4" />
            <span>Búsqueda por Tracking</span>
          </TabsTrigger>
          <TabsTrigger 
            value="advanced" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200"
          >
            <ScanBarcode className="h-4 w-4" />
            <span>Búsqueda Avanzada</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Campo de búsqueda principal con diseño mejorado */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <QrCode className="h-4 w-4 text-muted-foreground/70" />
            </div>
            
            <Input
              type="text"
              placeholder={searchType === 'tracking' ? "Ingrese número de tracking (WEX123456789)" : "Ingrese cliente, origen o destino"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={`pl-10 h-11 bg-background/80 border-border/60 ${isFocused ? 'border-primary/70 ring-2 ring-primary/20' : ''} transition-all duration-200 focus-visible:ring-primary/30`}
              disabled={isLoading}
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-12 flex items-center pr-2 text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {/* Botón de búsqueda mejorado */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              className="h-11 px-4 sm:px-5 bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg flex-shrink-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando...
                </span>
              ) : (
                <span className="flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                  <ArrowRight className="h-4 w-4 ml-2 opacity-70" />
                </span>
              )}
            </Button>
          </motion.div>
        </div>
        
        {/* Ayuda contextual según tipo de búsqueda */}
        <p className="text-xs text-muted-foreground pl-1 pt-1">
          {searchType === 'tracking' 
            ? "Ingrese el código de seguimiento completo para obtener detalles precisos del envío" 
            : "La búsqueda avanzada permite consultar por datos parciales como cliente o destino"}
        </p>
      </form>
      
      {/* Sección de búsquedas recientes con estilo mejorado */}
      {recentSearches.length > 0 && (
        <div className="mt-5 w-full bg-muted/30 p-3 rounded-lg border border-border/50">
          <div className="flex items-center justify-between w-full mb-2.5">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Búsquedas recientes</span>
            </div>
            {recentSearches.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAllRecentSearches}
                className="h-6 text-xs text-muted-foreground hover:text-foreground hover:bg-background/80"
              >
                Limpiar
              </Button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full">
            {recentSearches.map((term) => (
              <Badge 
                key={term}
                variant="outline"
                className="group cursor-pointer bg-background/60 hover:bg-background transition-colors px-2.5 py-1 text-xs flex items-center"
                onClick={() => handleRecentSearch(term)}
              >
                <span className="text-foreground/90">{term}</span>
                <X 
                  size={14} 
                  onClick={(e) => removeRecentSearch(e, term)}
                  className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-destructive" 
                />
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 