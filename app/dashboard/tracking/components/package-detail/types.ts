import type { TrackingInfo } from '../../services/directTrackingService';

// Extensión de los datos del paquete
export interface ExtendedPackageData extends TrackingInfo {
  status_name?: string;
  updatedAt?: string;
  lastUpdated?: string;
}

// Interfaz para el cliente
export interface Client {
  id: string;
  name: string;
  email: string;
  planRate: number;
  photoUrl?: string;
  // Campos alternativos que podrían contener URLs de imágenes
  photo?: string;
  avatar?: string;
  image?: string;
  profilePic?: string;
  picture?: string;
  planName?: string;
  branchName?: string;
  shipping_insurance?: boolean | string | number;
  userId?: string;
  subscriptionDetails?: {
    planName: string;
    price?: string;
  };
  // Referencias a otros objetos
  branchReference?: string | { id: string; path?: string; name?: string; };
  subscriptionPlan?: string | { id: string; path?: string; name?: string; planName?: string; price?: string; };
  typeUserReference?: string | { id: string; path?: string; };
  walletReference?: string | { id: string; path?: string; };
}

// Datos del formulario de dimensiones
export interface DimensionsFormData {
  length: number;
  width: number;
  height: number;
}

// Props para el componente principal
export interface PackageDetailViewProps {
  package?: ExtendedPackageData;
  themeColor?: string;
  onClientChange?: (packageId: string) => void;
  operatorData?: {
    branchDetails?: {
      name: string;
      id: string;
    };
    id: string;
    name: string;
    branchReference?: string | {
      id: string;
      path?: string;
    };
  };
}

// Props para la sección de peso y estado
export interface WeightStatusSectionProps {
  weight: string;
  volumetricWeight: string;
  currentLocation: string;
  operatorData?: {
    branchDetails?: {
      name: string;
      id: string;
    };
    id?: string;
    name?: string;
    branchReference?: string | {
      id: string;
      path?: string;
    };
  };
  onEditWeightsClick?: () => void;
}

// Props para la tarjeta de estadísticas
export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit?: string;
}

// Props para la sección de dimensiones
export interface DimensionsSectionProps {
  length: number;
  width: number;
  height: number;
  onEditClick: () => void;
}

// Props para el diálogo de dimensiones
export interface DimensionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dimensions: DimensionsFormData;
  isUpdating: boolean;
  onDimensionChange: (field: keyof DimensionsFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

// Props para la sección de cliente
export interface ClientSectionProps {
  client?: Client;
  onClientChange?: (clientId: string) => void;
  packageData?: ExtendedPackageData; // Datos del paquete para mostrar fechas
}

// Props para la sección de fechas
export interface DateInfoSectionProps {
  createdAt?: string | Date | number | any; // Permitir múltiples formatos de fecha
  updatedAt?: string | Date | number | any; // Permitir múltiples formatos de fecha
} 