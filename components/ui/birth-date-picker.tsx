import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, subYears, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BirthDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  error?: boolean;
}

export function BirthDatePicker({ value, onChange, error }: BirthDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(value?.getFullYear() || new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(value?.getMonth() || 0);
  const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());
  const maxDate = subYears(new Date(), 18);
  const minDate = subYears(new Date(), 100);

  const years = Array.from({ length: 83 }, (_, i) => maxDate.getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i);

  useEffect(() => {
    if (value) {
      setSelectedYear(value.getFullYear());
      setSelectedMonth(value.getMonth());
      setCurrentMonth(value);
    }
  }, [value]);

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    setSelectedYear(newYear);
    const newDate = new Date(currentMonth);
    newDate.setFullYear(newYear);
    setCurrentMonth(newDate);
  };

  const handleMonthChange = (month: string) => {
    const newMonth = parseInt(month);
    setSelectedMonth(newMonth);
    const newDate = new Date(currentMonth);
    newDate.setMonth(newMonth);
    setCurrentMonth(newDate);
  };

  const onMonthNavigate = (action: 'prev' | 'next') => {
    const newDate = action === 'prev' 
      ? subMonths(currentMonth, 1)
      : addMonths(currentMonth, 1);
    
    setCurrentMonth(newDate);
    setSelectedYear(newDate.getFullYear());
    setSelectedMonth(newDate.getMonth());
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full justify-start text-left font-normal bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm",
          "hover:bg-white/90 dark:hover:bg-gray-900/90 transition-all duration-200",
          "border border-gray-200 dark:border-gray-800",
          !value && "text-muted-foreground",
          error && "border-red-500 hover:border-red-600",
          "shadow-sm hover:shadow-md",
          "rounded-xl"
        )}
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
        {value ? (
          <span className="text-gray-900 dark:text-gray-100 font-medium">
            {format(value, "PP", { locale: es })}
          </span>
        ) : (
          <span className="text-gray-500">Seleccione fecha de nacimiento</span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 rounded-2xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-0 shadow-2xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Seleccionar Fecha de Nacimiento
            </DialogTitle>
          </DialogHeader>
          
          <motion.div 
            className="p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between space-x-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-2 rounded-full",
                  "bg-gray-100 dark:bg-gray-800",
                  "hover:bg-gray-200 dark:hover:bg-gray-700",
                  "transition-colors duration-200"
                )}
                onClick={() => onMonthNavigate('prev')}
              >
                <ChevronLeft className="h-5 w-5 text-primary" />
              </motion.button>

              <div className="flex-1 flex space-x-2">
                <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
                  <SelectTrigger className="bg-gray-100 dark:bg-gray-800 border-0 rounded-xl">
                    <SelectValue placeholder="Mes" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl">
                    {months.map(month => (
                      <SelectItem 
                        key={month} 
                        value={month.toString()}
                        className="cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                      >
                        {format(new Date(2000, month, 1), "MMMM", { locale: es })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="bg-gray-100 dark:bg-gray-800 border-0 rounded-xl">
                    <SelectValue placeholder="Año" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl">
                    {years.map(year => (
                      <SelectItem 
                        key={year} 
                        value={year.toString()}
                        className="cursor-pointer hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                      >
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "p-2 rounded-full",
                  "bg-gray-100 dark:bg-gray-800",
                  "hover:bg-gray-200 dark:hover:bg-gray-700",
                  "transition-colors duration-200"
                )}
                onClick={() => onMonthNavigate('next')}
              >
                <ChevronRight className="h-5 w-5 text-primary" />
              </motion.button>
            </div>

            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Calendar
                mode="single"
                selected={value}
                onSelect={(date) => {
                  onChange(date);
                  if (date) setIsOpen(false);
                }}
                month={currentMonth}
                defaultMonth={currentMonth}
                disabled={(date) =>
                  date > maxDate || date < minDate
                }
                className="rounded-xl border-0"
                classNames={{
                  day_selected: "bg-primary !text-white hover:bg-primary/90 rounded-lg transition-all duration-200 transform hover:scale-110",
                  day_today: "bg-accent/20 text-accent-foreground font-semibold rounded-lg",
                  day_outside: "text-muted-foreground opacity-50 hover:bg-primary/5 rounded-lg transition-colors",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                  nav_button: "hidden",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-10 font-medium text-[0.9rem] mb-2",
                  row: "flex w-full mt-2",
                  cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                    "first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg"
                  ),
                  day: cn(
                    "h-10 w-10 p-0 font-normal hover:bg-primary/10 rounded-lg transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "aria-selected:bg-primary aria-selected:text-white aria-selected:hover:bg-primary/90"
                  )
                }}
                initialFocus
              />
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
} 