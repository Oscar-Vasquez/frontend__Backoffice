"use client";

import { useState, useMemo, useCallback, memo, useEffect } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnFiltersState,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { 
  DotsHorizontalIcon,
  CaretSortIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
  EyeOpenIcon,
  GearIcon,
  PersonIcon,
  ExitIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  Cross2Icon,
  MixerHorizontalIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { OperatorsService, Operator } from "@/app/services/operators.service";
import useThemeSettingsStore from "@/store/themeSettingsStore";
import { useOperators } from "./context/operators-context";
import { getPhotoDisplayUrl } from "@/lib/photo-utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

// Definir la interfaz para los usuarios mapeados
interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  role: string;
  dateAdded: Date;
  branchName?: string;
  rawData: Operator;
}

// Interfaces para los componentes de diálogo
interface PermissionDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedUser: User) => void;
}

interface EditOperatorDialogProps {
  operator: Operator;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedOperator: Operator) => void;
}

interface OperatorDetailsDialogProps {
  operator: Operator;
  trigger: React.ReactNode;
}

// Dynamically import heavy components
const PermissionDialog = dynamic<PermissionDialogProps>(() => import("./permission-dialog").then(mod => mod.default), {
  ssr: false
});

const EditOperatorDialog = dynamic<EditOperatorDialogProps>(() => import("./edit-operator-dialog").then(mod => mod.default), {
  ssr: false
});

const OperatorDetailsDialog = dynamic<OperatorDetailsDialogProps>(() => import("./operator-details-dialog").then(mod => mod.default), {
  ssr: false
});

interface DataTableProps {
  data: User[];
}

// Status badge component to reduce re-renders
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, { label: string; className: string; icon: any }> = {
    active: { 
      label: "Activo", 
      className: "bg-emerald-50 text-emerald-700 border-emerald-100 group-hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30 dark:group-hover:bg-emerald-900/30",
      icon: PersonIcon
    },
    inactive: { 
      label: "Inactivo", 
      className: "bg-gray-50 text-gray-700 border-gray-100 group-hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700 dark:group-hover:bg-gray-800/70",
      icon: ExitIcon
    },
    pending: { 
      label: "Pendiente", 
      className: "bg-amber-50 text-amber-700 border-amber-100 group-hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30 dark:group-hover:bg-amber-900/30",
      icon: GearIcon
    },
    onboarded: { 
      label: "Incorporado", 
      className: "bg-blue-50 text-blue-700 border-blue-100 group-hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30 dark:group-hover:bg-blue-900/30",
      icon: PersonIcon
    },
  };

  const { label, className, icon: Icon } = statusMap[status] || { 
    label: status, 
    className: "bg-gray-50 text-gray-700 border-gray-100 group-hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700 dark:group-hover:bg-gray-800/70",
    icon: PersonIcon
  };

  return (
    <div className="flex items-center gap-2 group">
      <Badge 
        variant="outline"
        className={cn(
          "font-medium border px-2.5 py-0.5 text-xs flex items-center gap-1",
          className
        )}
      >
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    </div>
  );
};

// User avatar component to reduce re-renders
const UserAvatar = ({ user }: { user: User }) => {
  const [imageError, setImageError] = useState(false);
  const { themeColor } = useThemeSettingsStore();
  
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  
  const branchName = user.branchName;
  const hasPhoto = user.rawData?.photo && 
                  user.rawData.photo !== "null" && 
                  user.rawData.photo !== "undefined" && 
                  user.rawData.photo.trim() !== "";
  
  // Verificar si la URL es de Supabase Storage
  const isSupabaseUrl = hasPhoto && (
    user.rawData?.photo?.includes('supabase') || 
    user.rawData?.photo?.includes('storage') || 
    user.rawData?.photo?.includes('workexpressimagedata')
  );
  
  // URL de la foto con manejo de fallback
  // Usar getPhotoDisplayUrl para asegurar que usamos la URL firmada si está disponible
  const photoUrl = hasPhoto 
    ? getPhotoDisplayUrl(user.rawData?.photo || null, user.rawData?.operatorId || '')
    : `/avatars/default.png`;

  // Obtener el gradiente del tema activo
  const getThemeGradient = () => {
    switch (themeColor) {
      case 'lime':
        return 'from-lime-500 to-green-600';
      case 'sky':
        return 'from-sky-500 to-blue-600';
      case 'emerald':
        return 'from-emerald-500 to-teal-600';
      case 'rose':
        return 'from-rose-500 to-pink-600';
      case 'amber':
        return 'from-amber-500 to-orange-600';
      case 'purple':
        return 'from-purple-500 to-indigo-600';
      case 'slate':
        return 'from-slate-500 to-gray-600';
      case 'stone':
        return 'from-stone-500 to-gray-600';
      case 'neutral':
        return 'from-neutral-500 to-gray-600';
      case 'indigo':
      default:
        return 'from-indigo-500 to-blue-600';
    }
  };
  
  return (
    <div className="flex items-center gap-3 -ml-4">
      <div className="relative">
        <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
          {!imageError && hasPhoto ? (
            <AvatarImage 
              src={photoUrl || ''} 
              alt={user.name} 
              className="object-cover" 
              onError={(e) => {
                console.log(`❌ Error cargando imagen: ${photoUrl}`);
                
                // Intentar recuperar URL firmada alternativa si es posible
                if (user.rawData?.photo) {
                  const alternativeSignedUrl = getPhotoDisplayUrl(user.rawData.photo, user.rawData.operatorId || '');
                  if (alternativeSignedUrl && alternativeSignedUrl !== photoUrl) {
                    console.log('🔄 Intentando recuperar con URL firmada alternativa:', alternativeSignedUrl);
                    e.currentTarget.src = alternativeSignedUrl;
                    return;
                  }
                }
                
                // Si no se pudo recuperar, mostrar fallback
                setImageError(true);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <AvatarFallback className={`bg-gradient-to-br ${getThemeGradient()} text-white font-medium`}>
              {initials}
            </AvatarFallback>
          )}
        </Avatar>
        
        {branchName && (
          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getThemeGradient()} flex items-center justify-center`}>
              <HomeIcon className="h-3 w-3 text-white" />
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">{user.name}</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
        
      </div>
    </div>
  );
};

// Branch display component
const BranchDisplay = ({ branchName }: { branchName: string | undefined }) => {
  const { themeColor } = useThemeSettingsStore();
  
  // Obtener el gradiente del tema activo
  const getThemeGradient = () => {
    switch (themeColor) {
      case 'lime':
        return 'from-lime-500 to-green-600';
      case 'sky':
        return 'from-sky-500 to-blue-600';
      case 'emerald':
        return 'from-emerald-500 to-teal-600';
      case 'rose':
        return 'from-rose-500 to-pink-600';
      case 'amber':
        return 'from-amber-500 to-orange-600';
      case 'purple':
        return 'from-purple-500 to-indigo-600';
      case 'slate':
        return 'from-slate-500 to-gray-600';
      case 'stone':
        return 'from-stone-500 to-gray-600';
      case 'neutral':
        return 'from-neutral-500 to-gray-600';
      case 'indigo':
      default:
        return 'from-indigo-500 to-blue-600';
    }
  };
  
  if (!branchName) {
    return <span className="text-gray-400 dark:text-gray-500 text-sm italic">No asignada</span>;
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${getThemeGradient()} flex items-center justify-center`}>
        <HomeIcon className="h-3.5 w-3.5 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{branchName}</span>
    </div>
  );
};

// Componente de filtros avanzados para la tabla
interface AdvancedFiltersProps {
  table: any;
  data: User[];
  branches: string[];
  roles: string[];
  statuses: string[];
}

const AdvancedFilters = ({ table, data, branches, roles, statuses }: AdvancedFiltersProps) => {
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const uniqueBranches = useMemo(() => branches, [branches]);
  const uniqueRoles = useMemo(() => roles, [roles]);
  const uniqueStatuses = useMemo(() => statuses, [statuses]);
  
  // Aplicar filtro global
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (nameFilter) {
        table.getColumn('name')?.setFilterValue(nameFilter);
      } else {
        table.getColumn('name')?.setFilterValue('');
      }
      
      if (emailFilter) {
        table.getColumn('email')?.setFilterValue(emailFilter);
      } else {
        table.getColumn('email')?.setFilterValue('');
      }
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [nameFilter, emailFilter, table]);
  
  const resetFilters = () => {
    setNameFilter('');
    setEmailFilter('');
    table.resetColumnFilters();
  };
  
  return (
    <>
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full md:w-80">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Buscar por nombre o apellido..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="pl-9 pr-9 h-10"
            />
            {nameFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                onClick={() => setNameFilter('')}
              >
                <Cross2Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="sr-only">Limpiar búsqueda</span>
              </Button>
            )}
          </div>
          
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            className="h-10 gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <MixerHorizontalIcon className="h-4 w-4" />
            {!showFilters ? "Filtros" : "Ocultar filtros"}
            {table.getState().columnFilters.length > 0 && (
              <Badge className="ml-1 bg-blue-600 text-white h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {table.getState().columnFilters.length}
              </Badge>
            )}
          </Button>
          
          {table.getState().columnFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 gap-1 text-gray-500 dark:text-gray-400"
              onClick={resetFilters}
            >
              <ReloadIcon className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total: {table.getFilteredRowModel().rows.length} operadores
          </span>
        </div>
      </div>
      
      {showFilters && (
        <Card className="mb-6 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por Correo */}
              <div className="space-y-2">
                <Label htmlFor="email-filter">Correo electrónico</Label>
                <div className="relative">
                  <Input
                    id="email-filter"
                    placeholder="Buscar por correo..."
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="w-full"
                  />
                  {emailFilter && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                      onClick={() => setEmailFilter('')}
                    >
                      <Cross2Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Filtro por Sucursal */}
              <div className="space-y-2">
                <Label htmlFor="branch-filter">Sucursal</Label>
                <Select
                  onValueChange={(value) => {
                    table.getColumn('branchName')?.setFilterValue(value === "all" ? "" : value);
                  }}
                  defaultValue="all"
                >
                  <SelectTrigger id="branch-filter" className="w-full">
                    <SelectValue placeholder="Todas las sucursales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las sucursales</SelectItem>
                    {uniqueBranches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch || "Sin asignar"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtro por Estado */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">Estado</Label>
                <Select
                  onValueChange={(value) => {
                    table.getColumn('status')?.setFilterValue(value === "all" ? "" : value);
                  }}
                  defaultValue="all"
                >
                  <SelectTrigger id="status-filter" className="w-full">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "active" ? "Activo" : 
                         status === "inactive" ? "Inactivo" : 
                         status === "pending" ? "Pendiente" : 
                         status === "onboarded" ? "Incorporado" : status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Filtro por Rol */}
              <div className="space-y-2">
                <Label htmlFor="role-filter">Rol</Label>
                <Select
                  onValueChange={(value) => {
                    table.getColumn('role')?.setFilterValue(value === "all" ? "" : value);
                  }}
                  defaultValue="all"
                >
                  <SelectTrigger id="role-filter" className="w-full">
                    <SelectValue placeholder="Todos los roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los roles</SelectItem>
                    {uniqueRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role === "admin" ? "Administrador" : 
                         role === "manager" ? "Gerente" : 
                         role === "Gerente De Sucursal" ? "Gerente De Sucursal" : 
                         role === "staff" ? "Operador" : role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

// Memoize the UsersDataTable component to prevent unnecessary re-renders
const UsersDataTable = memo(({ data }: DataTableProps) => {
  const { updateOperator } = useOperators();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPermissions, setShowPermissions] = useState(false);
  const [showEditOperator, setShowEditOperator] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  
  // Extraer valores únicos para filtros
  const uniqueBranches = useMemo(() => {
    const branches = new Set<string>();
    data.forEach(user => {
      if (user.branchName) branches.add(user.branchName);
    });
    return Array.from(branches);
  }, [data]);
  
  const uniqueRoles = useMemo(() => {
    const roles = new Set<string>();
    data.forEach(user => {
      if (user.role) roles.add(user.role);
    });
    return Array.from(roles);
  }, [data]);
  
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    data.forEach(user => {
      if (user.status) statuses.add(user.status);
    });
    return Array.from(statuses);
  }, [data]);

  // Memoize the columns definition to prevent re-renders
  const columns = useMemo<ColumnDef<User>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todo"
          className="translate-y-[2px] data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
          className="translate-y-[2px] data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium text-gray-600 dark:text-gray-300 -ml-4"
        >
          Nombre
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <UserAvatar user={row.original} />,
      filterFn: (row, id, value) => {
        return row.getValue<string>(id).toLowerCase().includes(value.toLowerCase())
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium text-gray-600 dark:text-gray-300"
        >
          Email
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        return <span className="text-sm text-gray-600 dark:text-gray-300">{row.getValue("email")}</span>
      },
      filterFn: (row, id, value) => {
        return row.getValue<string>(id).toLowerCase().includes(value.toLowerCase())
      },
    },
    {
      accessorKey: "branchName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium text-gray-600 dark:text-gray-300"
        >
          Sucursal
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <BranchDisplay branchName={row.getValue("branchName")} />,
      filterFn: (row, id, value) => {
        const branchName = row.getValue<string | undefined>(id);
        if (!branchName && value === "Sin asignar") return true;
        return branchName?.includes(value) || false;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium text-gray-600 dark:text-gray-300"
        >
          Estado
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
      filterFn: (row, id, value) => {
        return row.getValue<string>(id) === value;
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium text-gray-600 dark:text-gray-300"
        >
          Rol
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        const roleMap: Record<string, { label: string; className: string }> = {
          admin: { 
            label: "Administrador", 
            className: "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/30"
          },
          manager: { 
            label: "Gerente", 
            className: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/30"
          },
          "Gerente De Sucursal": { 
            label: "Gerente De Sucursal", 
            className: "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/30"
          },
          staff: { 
            label: "Operador", 
            className: "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800/30"
          },
        };

        const { label, className } = roleMap[role] || { 
          label: role, 
          className: "bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/30"
        };

        return (
          <Badge 
            variant="outline"
            className={cn(
              "font-medium border px-2.5 py-0.5 text-xs",
              className
            )}
          >
            {label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return row.getValue<string>(id) === value;
      },
    },
    {
      accessorKey: "dateAdded",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium text-gray-600 dark:text-gray-300"
        >
          Fecha
          <CaretSortIcon className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("dateAdded");
        const formatted = date instanceof Date 
          ? date.toLocaleDateString('es-ES', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })
          : typeof date === 'string'
            ? new Date(date).toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })
            : 'Fecha desconocida';
        
        return <span className="text-sm text-gray-600 dark:text-gray-300">{formatted}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        
        const handleViewDetails = () => {
          setSelectedUser(user);
          setShowDetails(true);
        };
        
        const handleEditUser = () => {
          setSelectedUser(user);
          setShowEditOperator(true);
        };
        
        const handleViewPermissions = () => {
          setSelectedUser(user);
          setShowPermissions(true);
        };
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={handleViewDetails} className="cursor-pointer">
                <EyeOpenIcon className="mr-2 h-4 w-4" />
                <span>Ver detalles</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditUser} className="cursor-pointer">
                <GearIcon className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleViewPermissions} className="cursor-pointer">
                <PersonIcon className="mr-2 h-4 w-4" />
                <span>Permisos</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  // Memoize the table instance
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Memoized handlers
  const handleClosePermissions = useCallback(() => {
    setShowPermissions(false);
  }, []);

  const handleCloseEditOperator = useCallback(() => {
    setShowEditOperator(false);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setShowDetails(false);
  }, []);

  return (
    <div className="space-y-4">
      <AdvancedFilters 
        table={table} 
        data={data}
        branches={uniqueBranches}
        roles={uniqueRoles}
        statuses={uniqueStatuses}
      />
      
      <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-gray-200 dark:border-gray-700 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-gray-600 dark:text-gray-300 font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex-1 text-sm text-gray-500 dark:text-gray-400">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span>
              {table.getFilteredSelectedRowModel().rows.length} de{" "}
              {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
            </span>
          )}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Filas por página
            </p>
            <select
              className="h-9 w-[70px] rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la primera página</span>
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la página anterior</span>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la página siguiente</span>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la última página</span>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {selectedUser && showPermissions && (
        <PermissionDialog
          user={selectedUser}
          open={showPermissions}
          onOpenChange={setShowPermissions}
          onSave={(updatedUser) => {
            if (updatedUser && updateOperator) {
              updateOperator(updatedUser.id, updatedUser.rawData);
            }
          }}
        />
      )}

      {selectedUser && showEditOperator && (
        <EditOperatorDialog
          operator={selectedUser.rawData}
          open={showEditOperator}
          onOpenChange={(open) => {
            setShowEditOperator(open);
          }}
          onSave={(updatedOperator) => {
            console.log("📊 Operador actualizado desde el diálogo de edición:", updatedOperator);
            if (updatedOperator && updateOperator) {
              // Actualizar el operador en el contexto para refrescar la tabla sin recargar la página
              try {
                updateOperator(selectedUser.id, updatedOperator)
                  .then(() => {
                    console.log("✅ Tabla de datos actualizada exitosamente");
                  })
                  .catch(error => {
                    console.error("❌ Error al actualizar la tabla de datos:", error);
                  });
              } catch (error) {
                console.error("❌ Error al procesar la actualización:", error);
              }
            }
          }}
        />
      )}

      {selectedUser && selectedUser.rawData && showDetails && (
        <OperatorDetailsDialog
          operator={selectedUser.rawData}
          trigger={
            <div className="hidden">
              <Button
                ref={(btnEl) => {
                  if (showDetails && btnEl) {
                    setTimeout(() => btnEl.click(), 0);
                    
                    const handleClickOutside = () => {
                      setShowDetails(false);
                      document.removeEventListener('click', handleClickOutside);
                    };
                    
                    setTimeout(() => {
                      document.addEventListener('click', handleClickOutside);
                    }, 100);
                  }
                }}
              />
            </div>
          }
        />
      )}
    </div>
  );
});

// Add display name for debugging
UsersDataTable.displayName = 'UsersDataTable';

export default UsersDataTable; 