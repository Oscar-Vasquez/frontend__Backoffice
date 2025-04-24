import { toast } from "sonner";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Loader2,
  Bell,
  ShieldCheck,
  AlertOctagon 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastOptions {
  title?: string;
  description: string;
  duration?: number;
  action?: React.ReactNode;
}

const baseStyles = "flex-1 w-full rounded-md shadow-lg border border-l-4 bg-white dark:bg-gray-800 animate-in slide-in-from-bottom-right duration-300";

interface ToastProps {
  title: string;
  description?: string;
}

const toastStyles = {
  success: {
    container: "border-green-500",
    icon: "text-green-500",
    title: "text-green-700 dark:text-green-400",
    description: "text-green-600 dark:text-green-300"
  },
  error: {
    container: "border-red-500",
    icon: "text-red-500",
    title: "text-red-700 dark:text-red-400",
    description: "text-red-600 dark:text-red-300"
  },
  info: {
    container: "border-blue-500",
    icon: "text-blue-500",
    title: "text-blue-700 dark:text-blue-400",
    description: "text-blue-600 dark:text-blue-300"
  },
  warning: {
    container: "border-yellow-500",
    icon: "text-yellow-500",
    title: "text-yellow-700 dark:text-yellow-400",
    description: "text-yellow-600 dark:text-yellow-300"
  },
  loading: {
    container: "border-purple-500",
    icon: "text-purple-500",
    title: "text-purple-700 dark:text-purple-400",
    description: "text-purple-600 dark:text-purple-300"
  },
  security: {
    container: "border-indigo-500",
    icon: "text-indigo-500",
    title: "text-indigo-700 dark:text-indigo-400",
    description: "text-indigo-600 dark:text-indigo-300"
  },
  notification: {
    container: "border-teal-500",
    icon: "text-teal-500",
    title: "text-teal-700 dark:text-teal-400",
    description: "text-teal-600 dark:text-teal-300"
  },
  system: {
    container: "border-gray-500",
    icon: "text-gray-500",
    title: "text-gray-700 dark:text-gray-400",
    description: "text-gray-600 dark:text-gray-300"
  }
};

export const customToast = {
  success: ({ title, description }: ToastProps) => {
    toast(
      <div className="flex items-center gap-3 px-3 py-2">
        <CheckCircle className={cn("h-5 w-5", toastStyles.success.icon)} />
        <div className="flex-1">
          <p className={cn("font-medium", toastStyles.success.title)}>{title}</p>
          {description && <p className={cn("text-sm mt-0.5", toastStyles.success.description)}>{description}</p>}
        </div>
      </div>,
      {
        duration: 3000,
        className: cn(baseStyles, toastStyles.success.container),
        position: "bottom-right"
      }
    );
  },

  error: ({ title, description }: ToastProps) => {
    toast(
      <div className="flex items-center gap-3 px-3 py-2">
        <XCircle className={cn("h-5 w-5", toastStyles.error.icon)} />
        <div className="flex-1">
          <p className={cn("font-medium", toastStyles.error.title)}>{title}</p>
          {description && <p className={cn("text-sm mt-0.5", toastStyles.error.description)}>{description}</p>}
        </div>
      </div>,
      {
        duration: 5000,
        className: cn(baseStyles, toastStyles.error.container),
        position: "bottom-right"
      }
    );
  },

  info: ({ title, description }: ToastProps) => {
    toast(
      <div className="flex items-center gap-3 px-3 py-2">
        <Info className={cn("h-5 w-5", toastStyles.info.icon)} />
        <div className="flex-1">
          <p className={cn("font-medium", toastStyles.info.title)}>{title}</p>
          {description && <p className={cn("text-sm mt-0.5", toastStyles.info.description)}>{description}</p>}
        </div>
      </div>,
      {
        duration: 3000,
        className: cn(baseStyles, toastStyles.info.container),
        position: "bottom-right"
      }
    );
  },

  warning: ({ title, description }: ToastProps) => {
    toast(
      <div className="flex items-center gap-3 px-3 py-2">
        <AlertCircle className={cn("h-5 w-5", toastStyles.warning.icon)} />
        <div className="flex-1">
          <p className={cn("font-medium", toastStyles.warning.title)}>{title}</p>
          {description && <p className={cn("text-sm mt-0.5", toastStyles.warning.description)}>{description}</p>}
        </div>
      </div>,
      {
        duration: 4000,
        className: cn(baseStyles, toastStyles.warning.container),
        position: "bottom-right"
      }
    );
  },

  loading: ({ title = "Procesando", description, duration = 3000, action }: ToastOptions) => {
    toast(
      <div className="flex items-center gap-3 px-3 py-2">
        <Loader2 className={cn("h-5 w-5 animate-spin", toastStyles.loading.icon)} />
        <div className="flex-1">
          <p className={cn("font-medium", toastStyles.loading.title)}>{title}</p>
          {description && <p className={cn("text-sm mt-0.5", toastStyles.loading.description)}>{description}</p>}
        </div>
      </div>,
      {
        duration,
        className: cn(baseStyles, toastStyles.loading.container),
        position: "bottom-right",
        action
      }
    );
  },

  security: ({ title = "Seguridad", description, duration = 4000, action }: ToastOptions) => {
    toast(
      <div className="flex items-center gap-3 px-3 py-2">
        <ShieldCheck className={cn("h-5 w-5", toastStyles.security.icon)} />
        <div className="flex-1">
          <p className={cn("font-medium", toastStyles.security.title)}>{title}</p>
          {description && <p className={cn("text-sm mt-0.5", toastStyles.security.description)}>{description}</p>}
        </div>
      </div>,
      {
        duration,
        className: cn(baseStyles, toastStyles.security.container),
        position: "bottom-right",
        action
      }
    );
  },

  notification: ({ title = "Nueva Notificación", description, duration = 4000, action }: ToastOptions) => {
    toast(
      <div className="flex items-center gap-3 px-3 py-2">
        <Bell className={cn("h-5 w-5", toastStyles.notification.icon)} />
        <div className="flex-1">
          <p className={cn("font-medium", toastStyles.notification.title)}>{title}</p>
          {description && <p className={cn("text-sm mt-0.5", toastStyles.notification.description)}>{description}</p>}
        </div>
      </div>,
      {
        duration,
        className: cn(baseStyles, toastStyles.notification.container),
        position: "bottom-right",
        action
      }
    );
  },

  system: ({ title = "Sistema", description, duration = 4000, action }: ToastOptions) => {
    toast(
      <div className="flex items-center gap-3 px-3 py-2">
        <AlertOctagon className={cn("h-5 w-5", toastStyles.system.icon)} />
        <div className="flex-1">
          <p className={cn("font-medium", toastStyles.system.title)}>{title}</p>
          {description && <p className={cn("text-sm mt-0.5", toastStyles.system.description)}>{description}</p>}
        </div>
      </div>,
      {
        duration,
        className: cn(baseStyles, toastStyles.system.container),
        position: "bottom-right",
        action
      }
    );
  }
}; 