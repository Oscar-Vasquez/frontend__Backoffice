import { useState, memo } from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Operator } from '@/types/operators';
import dynamic from 'next/dynamic';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2 } from "lucide-react";

const OperatorTimeline = dynamic(() => import('./operator-timeline'), {
  ssr: false
});

interface OperatorsListProps {
  operators: Operator[];
}

const OperatorsList = memo(function OperatorsList({ operators }: OperatorsListProps) {
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');

  // Obtener lista única de sucursales
  const branches = Array.from(new Set(operators.map(op => op.branchName).filter(Boolean)));

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
      inactive: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
      pending: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
    } as const;
    type StatusKey = keyof typeof colors;
    
    const lowerStatus = status.toLowerCase() as StatusKey;
    return colors[lowerStatus] || colors.pending;
  };

  const handleOperatorClick = (operator: Operator) => {
    setSelectedOperator(operator);
    setIsTimelineOpen(true);
  };

  // Filtrar operadores
  const filteredOperators = operators.filter(operator => {
    const matchesSearch = searchQuery.toLowerCase() === '' ||
      `${operator.firstName} ${operator.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      operator.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBranch = selectedBranch === 'all' || operator.branchName === selectedBranch;

    return matchesSearch && matchesBranch;
  });

  return (
    <>
      <div className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Barra de búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Selector de Sucursal */}
          <div className="w-full sm:w-[200px]">
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger>
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrar por Sucursal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Sucursales</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch} value={branch || ''}>
                    {branch || 'Sin Asignar'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de Operadores */}
        <div className="space-y-2">
          {filteredOperators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron operadores que coincidan con los filtros
            </div>
          ) : (
            filteredOperators.map((operator) => (
              <div
                key={operator.id}
                className="p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => handleOperatorClick(operator)}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-border">
                    <AvatarImage src={operator.photo} alt={`${operator.firstName} ${operator.lastName}`} />
                    <AvatarFallback className="bg-primary/10">
                      {operator.firstName[0]}{operator.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-medium truncate">
                        {operator.firstName} {operator.lastName}
                      </h3>
                      <Badge variant="secondary" className={getStatusColor(operator.status)}>
                        {operator.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {operator.email}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        Rol: {operator.role}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {operator.branchName && (
                        <Badge variant="outline" className="text-xs">
                          {operator.branchName}
                        </Badge>
                      )}
                      {operator.lastActivity && (
                        <span className="text-xs text-muted-foreground">
                          Última actividad: {formatDistanceToNow(operator.lastActivity, { addSuffix: true, locale: es })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <OperatorTimeline
        operator={selectedOperator}
        isOpen={isTimelineOpen}
        onClose={() => {
          setIsTimelineOpen(false);
          setSelectedOperator(null);
        }}
      />
    </>
  );
});

export { OperatorsList }; 