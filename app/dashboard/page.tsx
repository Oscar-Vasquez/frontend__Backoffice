"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useThemeSettingsStore from "@/store/themeSettingsStore";

export default function DashboardPage() {
  const router = useRouter();
  const { themeColor } = useThemeSettingsStore();

  // Obtener el gradiente del tema activo
  const getThemeGradient = () => {
    switch (themeColor) {
      case 'lime':
        return 'border-lime-500';
      case 'sky':
        return 'border-sky-500';
      case 'emerald':
        return 'border-emerald-500';
      case 'rose':
        return 'border-rose-500';
      case 'amber':
        return 'border-amber-500';
      case 'purple':
        return 'border-purple-500';
      case 'slate':
        return 'border-slate-500';
      case 'stone':
        return 'border-stone-500';
      case 'neutral':
        return 'border-neutral-500';
      case 'indigo':
        return 'border-indigo-500';
      default:
        return 'border-blue-500';
    }
  };

  useEffect(() => {
    router.replace("/dashboard/home");
  }, [router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${getThemeGradient()}`}></div>
        <p className="text-gray-500 dark:text-gray-400">Redirigiendo...</p>
      </div>
    </div>
  );
} 