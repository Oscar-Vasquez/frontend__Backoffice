"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { addDays, format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  initialDateFrom?: Date;
  initialDateTo?: Date;
  onUpdate?: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({
  initialDateFrom,
  initialDateTo,
  onUpdate,
  className,
}: DateRangePickerProps) {
  // Inicializar estado con las fechas proporcionadas o valores predeterminados
  const [date, setDate] = React.useState<DateRange | undefined>(
    initialDateFrom
      ? {
          from: initialDateFrom,
          to: initialDateTo || undefined,
        }
      : undefined
  );
  
  // Ref para guardar la última fecha usada para prevenir loops infinitos
  const lastReportedValue = React.useRef<string | null>(null);

  // Manejador para cambios en la fecha seleccionada
  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    
    // Solo disparar onUpdate si el callback existe y la fecha ha cambiado realmente
    if (onUpdate) {
      // Crear una representación en cadena de texto para comparar fechas
      const newDateStr = selectedDate ? 
        `${selectedDate.from?.getTime()}-${selectedDate.to?.getTime()}` : 
        'null';
      
      // Solo actualizar si la fecha es diferente a la última reportada
      if (newDateStr !== lastReportedValue.current) {
        lastReportedValue.current = newDateStr;
        onUpdate(selectedDate);
      }
    }
  };

  // Actualizar el estado interno cuando cambian las props iniciales
  React.useEffect(() => {
    const newInitialDate = initialDateFrom
      ? {
          from: initialDateFrom,
          to: initialDateTo || undefined,
        }
      : undefined;
    
    // Solo actualizar si es diferente
    const currentFromTime = date?.from?.getTime();
    const currentToTime = date?.to?.getTime();
    const newFromTime = newInitialDate?.from?.getTime();
    const newToTime = newInitialDate?.to?.getTime();
    
    if (
      (!date && newInitialDate) || 
      (date && !newInitialDate) ||
      currentFromTime !== newFromTime ||
      currentToTime !== newToTime
    ) {
      setDate(newInitialDate);
    }
  }, [initialDateFrom, initialDateTo]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal border-primary/30 shadow-sm",
              !date && "text-muted-foreground",
              date && "bg-primary/5 text-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary/70" />
            {date?.from ? (
              date.to ? (
                <>
                  <span className="font-medium">{format(date.from, "dd MMM yyyy", { locale: es })}</span>
                  <span className="mx-1 text-muted-foreground">-</span>
                  <span className="font-medium">{format(date.to, "dd MMM yyyy", { locale: es })}</span>
                </>
              ) : (
                <span className="font-medium">{format(date.from, "dd MMM yyyy", { locale: es })}</span>
              )
            ) : (
              <span>Seleccionar fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-primary/20 shadow-lg" align="start">
          <div className="p-3 border-b border-muted/30 bg-muted/10">
            <h3 className="text-sm font-medium text-primary/80">Seleccionar rango de fechas</h3>
          </div>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from || new Date()}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={es}
            className="p-3"
            classNames={{
              day_selected: "bg-primary text-primary-foreground",
              day_range_middle: "bg-primary/20 text-primary-foreground",
              day_range_end: "bg-primary text-primary-foreground",
              day_range_start: "bg-primary text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
            }}
          />
          <div className="p-3 border-t border-muted/30 flex justify-end space-x-2 bg-muted/10">
            <Button 
              size="sm" 
              variant="outline" 
              className="text-sm"
              onClick={() => handleSelect(undefined)}
            >
              Limpiar
            </Button>
            <Button 
              size="sm" 
              className="bg-primary text-white text-sm"
              onClick={() => handleSelect(date)}
            >
              Aplicar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 