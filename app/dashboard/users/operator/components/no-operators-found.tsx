'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ExclamationTriangleIcon,
  InfoCircledIcon,
  ReloadIcon
} from "@radix-ui/react-icons";
import InlineDiagnostics from "./inline-diagnostics";
import useThemeSettingsStore from "@/store/themeSettingsStore";

export function NoOperatorsFound() {
  const { themeColor } = useThemeSettingsStore();
  
  // Obtener el color del tema activo para los botones
  const getThemeColor = () => {
    switch (themeColor) {
      case 'lime':
        return 'border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-800 dark:hover:text-amber-300';
      case 'sky':
        return 'border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-800 dark:hover:text-amber-300';
      case 'emerald':
        return 'border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-800 dark:hover:text-amber-300';
      case 'rose':
        return 'border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-800 dark:hover:text-amber-300';
      case 'amber':
        return 'border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-800 dark:hover:text-amber-300';
      case 'purple':
        return 'border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-800 dark:hover:text-amber-300';
      default:
        return 'border-amber-200 dark:border-amber-800/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-800 dark:hover:text-amber-300';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          <h3 className="text-lg font-medium text-amber-700 dark:text-amber-400">No se encontraron operadores</h3>
        </div>
        <p className="text-amber-700 dark:text-amber-400 mb-4">
          No se pudieron cargar los operadores desde el backend. Esto puede deberse a un problema de conexión o a que no hay operadores registrados.
        </p>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/users/operator/diagnostico">
            <Button 
              variant="outline"
              className={getThemeColor()}
            >
              <InfoCircledIcon className="mr-2 h-4 w-4" />
              Diagnosticar conexión
            </Button>
          </Link>
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className={getThemeColor()}
          >
            <ReloadIcon className="mr-2 h-4 w-4" />
            Recargar página
          </Button>
        </div>
      </div>
      <InlineDiagnostics />
    </div>
  );
} 