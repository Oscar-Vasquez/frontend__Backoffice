"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Receipt, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceFilter } from "../types";

interface InvoiceFiltersProps {
  onFilterChange: (filter: InvoiceFilter) => void;
  onSearchChange: (search: string) => void;
  currentFilter: InvoiceFilter;
  searchValue: string;
}

export default function InvoiceFilters({
  onFilterChange,
  onSearchChange,
  currentFilter = 'todos',
  searchValue = ''
}: InvoiceFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 sm:pb-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
        <div className="relative w-full sm:w-60 md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar en facturas..." 
            className="pl-9"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="relative z-50">
          <Select 
            defaultValue={currentFilter} 
            onValueChange={(value) => onFilterChange(value as InvoiceFilter)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={5} className="z-[100] min-w-[8rem]">
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendientes">Pendientes</SelectItem>
              <SelectItem value="pagados">Pagados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
} 