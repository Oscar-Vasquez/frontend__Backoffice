import { useState } from "react";
import { Search, X, Filter, CalendarIcon, ArrowDownUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransactionFilter, TransactionCategory, SortOrder } from "../types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem 
} from "@/components/ui/dropdown-menu";

interface ExpenseFiltersProps {
  expenseFilter: TransactionFilter;
  setExpenseFilter: (filter: TransactionFilter) => void;
  expenseSearch: string;
  setExpenseSearch: (search: string) => void;
  dateRange: { from: Date | undefined; to: Date | undefined };
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  categories: TransactionCategory[];
  selectedCategories: string[];
  toggleCategory: (categoryId: string) => void;
  resetCategories: () => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
}

export default function ExpenseFilters({
  expenseFilter,
  setExpenseFilter,
  expenseSearch,
  setExpenseSearch,
  dateRange,
  setDateRange,
  categories,
  selectedCategories,
  toggleCategory,
  resetCategories,
  sortOrder,
  setSortOrder
}: ExpenseFiltersProps) {
  const [open, setOpen] = useState(false);
  
  // Determinar si hay algún filtro activo
  const hasActiveFilters = 
    expenseFilter !== 'todos' || 
    expenseSearch !== '' || 
    dateRange.from !== undefined || 
    dateRange.to !== undefined || 
    selectedCategories.length > 0;
  
  // Función para formatear fecha
  const formatDate = (date: Date | undefined): string => {
    try {
      if (!date) return '';
      
      // Verifica si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn(`Fecha inválida: ${date}`);
        return '';
      }
      
      return format(date, 'PPP', { locale: es });
    } catch (error) {
      console.error(`Error al formatear fecha: ${date}`, error);
      return '';
    }
  };
  
  // Generar texto para el rango de fechas
  const dateRangeText = (): string => {
    if (dateRange.from && dateRange.to) {
      return `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
    }
    if (dateRange.from) {
      return `Desde ${formatDate(dateRange.from)}`;
    }
    if (dateRange.to) {
      return `Hasta ${formatDate(dateRange.to)}`;
    }
    return 'Seleccionar fechas';
  };
  
  // Texto para el botón de ordenación
  const sortOrderText = sortOrder === 'desc' ? 'Más recientes' : 'Más antiguos';
  
  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setExpenseFilter('todos');
    setExpenseSearch('');
    setDateRange({ from: undefined, to: undefined });
    resetCategories();
  };
  
  // Función para encontrar nombre de categoría por ID
  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Desconocida';
  };
  
  // Función para obtener color de categoría por ID
  const getCategoryColor = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : '#cbd5e1';
  };
  
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="space-y-4">
        <div className="flex flex-col space-y-2">
          <h3 className="text-sm font-medium">Filtros</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar en descripción..."
                className="pl-8"
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
              />
              {expenseSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 w-9 rounded-lg p-0"
                  onClick={() => setExpenseSearch('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 min-w-[120px]"
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline truncate max-w-[100px]">{dateRangeText()}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  locale={es}
                  selected={{
                    from: dateRange.from,
                    to: dateRange.to,
                  }}
                  onSelect={(range: any) => {
                    setDateRange(range);
                    setOpen(false);
                  }}
                  initialFocus
                />
                {(dateRange.from || dateRange.to) && (
                  <div className="p-3 border-t flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDateRange({ from: undefined, to: undefined })}
                    >
                      Limpiar
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 flex gap-1",
                    selectedCategories.length > 0 && "bg-secondary text-secondary-foreground"
                  )}
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Categorías</span>
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72" align="start">
                <div className="space-y-4">
                  <h4 className="font-medium">Filtrar por categoría</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((category) => {
                      const isSelected = selectedCategories.includes(category.id);
                      return (
                        <button
                          key={category.id}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                            isSelected
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-card hover:bg-secondary/30"
                          )}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="truncate">{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                  {selectedCategories.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={resetCategories}
                    >
                      Limpiar selección
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1"
                >
                  <ArrowDownUp className="h-4 w-4" />
                  <span className="hidden sm:inline">{sortOrderText}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as SortOrder)}>
                  <DropdownMenuRadioItem value="desc">Más recientes</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="asc">Más antiguos</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Mostrar filtros seleccionados */}
        {hasActiveFilters && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs text-muted-foreground">Filtros activos</h3>
              <Button variant="link" size="sm" className="h-auto p-0" onClick={clearAllFilters}>
                Limpiar todo
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {expenseFilter !== 'todos' && (
                <Badge variant="outline" className="gap-1">
                  {expenseFilter === 'recientes' ? 'Recientes' : 'Mayores a $500'}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => setExpenseFilter('todos')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {(dateRange.from || dateRange.to) && (
                <Badge variant="outline" className="gap-1">
                  {dateRangeText()}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => setDateRange({ from: undefined, to: undefined })}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {selectedCategories.map((categoryId) => (
                <Badge
                  key={categoryId}
                  variant="outline"
                  className="gap-1"
                  style={{ 
                    borderColor: getCategoryColor(categoryId),
                    backgroundColor: `${getCategoryColor(categoryId)}10`
                  }}
                >
                  {getCategoryName(categoryId)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1"
                    onClick={() => toggleCategory(categoryId)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Botones de filtro rápido */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={expenseFilter === 'todos' ? "secondary" : "outline"}
            size="sm"
            onClick={() => setExpenseFilter('todos')}
          >
            Todos
          </Button>
          <Button
            variant={expenseFilter === 'recientes' ? "secondary" : "outline"}
            size="sm"
            onClick={() => setExpenseFilter('recientes')}
          >
            Últimos 30 días
          </Button>
          <Button
            variant={expenseFilter === 'mayores' ? "secondary" : "outline"}
            size="sm"
            onClick={() => setExpenseFilter('mayores')}
          >
            Mayores a $500
          </Button>
        </div>
      </div>
    </div>
  );
} 