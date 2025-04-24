/**
 * Utilidades para el manejo de temas en la aplicación
 * Este archivo centraliza las funciones relacionadas con la obtención de clases CSS basadas en el tema seleccionado
 */

/**
 * Obtiene el gradiente según el tema seleccionado
 * @param themeColor - Color del tema seleccionado
 * @returns Clase CSS con el gradiente correspondiente
 */
export const getThemeGradient = (themeColor: string | number): string => {
  const theme = String(themeColor);
  switch (theme) {
    case 'lime':
      return 'from-lime-500 via-lime-600 to-green-600 dark:from-lime-600 dark:via-lime-700 dark:to-green-700';
    case 'sky':
      return 'from-sky-500 via-sky-600 to-blue-600 dark:from-sky-600 dark:via-sky-700 dark:to-blue-700';
    case 'emerald':
      return 'from-emerald-500 via-emerald-600 to-teal-600 dark:from-emerald-600 dark:via-emerald-700 dark:to-teal-700';
    case 'rose':
      return 'from-rose-500 via-rose-600 to-pink-600 dark:from-rose-600 dark:via-rose-700 dark:to-pink-700';
    case 'amber':
      return 'from-amber-500 via-amber-600 to-orange-600 dark:from-amber-600 dark:via-amber-700 dark:to-orange-700';
    case 'orange':
      return 'from-orange-500 via-orange-600 to-amber-600 dark:from-orange-600 dark:via-orange-700 dark:to-amber-700';
    case 'purple':
      return 'from-purple-500 via-purple-600 to-indigo-600 dark:from-purple-600 dark:via-purple-700 dark:to-indigo-700';
    case 'slate':
      return 'from-slate-500 via-slate-600 to-zinc-600 dark:from-slate-600 dark:via-slate-700 dark:to-zinc-700';
    case 'neutral':
      return 'from-neutral-500 via-neutral-600 to-gray-600 dark:from-neutral-600 dark:via-neutral-700 dark:to-gray-700';
    case 'stone':
      return 'from-stone-500 via-stone-600 to-gray-600 dark:from-stone-600 dark:via-stone-700 dark:to-gray-700';
    case 'gray':
      return 'from-gray-500 via-gray-600 to-slate-600 dark:from-gray-600 dark:via-gray-700 dark:to-slate-700';
    case 'indigo':
      return 'from-indigo-500 via-indigo-600 to-purple-600 dark:from-indigo-600 dark:via-indigo-700 dark:to-purple-700';
    case 'fuchsia':
      return 'from-fuchsia-500 via-fuchsia-600 to-pink-600 dark:from-fuchsia-600 dark:via-fuchsia-700 dark:to-pink-700';
    case 'blue':
      return 'from-blue-500 via-blue-600 to-indigo-600 dark:from-blue-600 dark:via-blue-700 dark:to-indigo-700';
    case 'cyan':
      return 'from-cyan-500 via-cyan-600 to-sky-600 dark:from-cyan-600 dark:via-cyan-700 dark:to-sky-700';
    case 'teal':
      return 'from-teal-500 via-teal-600 to-emerald-600 dark:from-teal-600 dark:via-teal-700 dark:to-emerald-700';
    case 'green':
      return 'from-green-500 via-green-600 to-lime-600 dark:from-green-600 dark:via-green-700 dark:to-lime-700';
    case 'yellow':
      return 'from-yellow-500 via-yellow-600 to-amber-600 dark:from-yellow-600 dark:via-yellow-700 dark:to-amber-700';
    case 'red':
      return 'from-red-500 via-red-600 to-rose-600 dark:from-red-600 dark:via-red-700 dark:to-rose-700';
    case 'pink':
      return 'from-pink-500 via-pink-600 to-rose-600 dark:from-pink-600 dark:via-pink-700 dark:to-rose-700';
    case 'violet':
      return 'from-violet-500 via-violet-600 to-purple-600 dark:from-violet-600 dark:via-violet-700 dark:to-purple-700';
    default:
      return 'from-blue-500 via-blue-600 to-indigo-600 dark:from-blue-600 dark:via-blue-700 dark:to-indigo-700';
  }
};

/**
 * Obtiene el color del tema seleccionado
 * @param themeColor - Color del tema seleccionado
 * @returns Clase CSS con el color correspondiente
 */
export const getThemeColor = (themeColor: string | number): string => {
  const theme = String(themeColor);
  if (theme === 'default' || theme === 'blue') return "text-blue-600";
  if (theme === 'lime') return "text-lime-600";
  if (theme === 'sky') return "text-sky-600";
  if (theme === 'emerald') return "text-emerald-600";
  if (theme === 'rose') return "text-rose-600";
  if (theme === 'amber') return "text-amber-600";
  if (theme === 'orange') return "text-orange-600";
  if (theme === 'purple') return "text-purple-600";
  if (theme === 'slate') return "text-slate-600";
  if (theme === 'neutral') return "text-neutral-600";
  if (theme === 'stone') return "text-stone-600";
  if (theme === 'gray') return "text-gray-600";
  if (theme === 'indigo') return "text-indigo-600";
  if (theme === 'fuchsia') return "text-fuchsia-600";
  if (theme === 'cyan') return "text-cyan-600";
  if (theme === 'teal') return "text-teal-600";
  if (theme === 'green') return "text-green-600";
  if (theme === 'yellow') return "text-yellow-600";
  if (theme === 'red') return "text-red-600";
  if (theme === 'pink') return "text-pink-600";
  if (theme === 'violet') return "text-violet-600";
  return "text-blue-600";
};

/**
 * Obtiene el borde del tema seleccionado
 * @param themeColor - Color del tema seleccionado
 * @returns Clase CSS con el color de borde correspondiente
 */
export const getThemeBorder = (themeColor: string | number): string => {
  const theme = String(themeColor);
  if (theme === 'default' || theme === 'blue') return "border-blue-500/10";
  if (theme === 'lime') return "border-lime-500/10";
  if (theme === 'sky') return "border-sky-500/10";
  if (theme === 'emerald') return "border-emerald-500/10";
  if (theme === 'rose') return "border-rose-500/10";
  if (theme === 'amber') return "border-amber-500/10";
  if (theme === 'orange') return "border-orange-500/10";
  if (theme === 'purple') return "border-purple-500/10";
  if (theme === 'slate') return "border-slate-500/10";
  if (theme === 'neutral') return "border-neutral-500/10";
  if (theme === 'stone') return "border-stone-500/10";
  if (theme === 'gray') return "border-gray-500/10";
  if (theme === 'indigo') return "border-indigo-500/10";
  if (theme === 'fuchsia') return "border-fuchsia-500/10";
  if (theme === 'cyan') return "border-cyan-500/10";
  if (theme === 'teal') return "border-teal-500/10";
  if (theme === 'green') return "border-green-500/10";
  if (theme === 'yellow') return "border-yellow-500/10";
  if (theme === 'red') return "border-red-500/10";
  if (theme === 'pink') return "border-pink-500/10";
  if (theme === 'violet') return "border-violet-500/10";
  return "border-blue-500/10";
};

/**
 * Obtiene el color del título y elementos principales según el tema
 * @param themeColor - Color del tema seleccionado
 * @returns Clase CSS con el color de título correspondiente
 */
export const getTitleColor = (themeColor: string | number): string => {
  const theme = String(themeColor);
  if (theme === 'default') {
    return "from-blue-600 via-indigo-600 to-blue-600";
  }
  if (theme === 'sky') return "from-sky-600 via-blue-600 to-sky-600";
  if (theme === 'emerald') return "from-emerald-600 via-teal-600 to-emerald-600";
  if (theme === 'rose') return "from-rose-600 via-pink-600 to-rose-600";
  if (theme === 'amber') return "from-amber-600 via-orange-600 to-amber-600";
  if (theme === 'orange') return "from-orange-600 via-amber-600 to-orange-600";
  if (theme === 'purple') return "from-purple-600 via-indigo-600 to-purple-600";
  if (theme === 'slate') return "from-slate-600 via-zinc-600 to-slate-600";
  if (theme === 'neutral') return "from-neutral-600 via-gray-600 to-neutral-600";
  if (theme === 'lime') return "from-lime-600 via-green-600 to-lime-600";
  if (theme === 'stone') return "from-stone-600 via-gray-600 to-stone-600";
  if (theme === 'gray') return "from-gray-600 via-slate-600 to-gray-600";
  if (theme === 'indigo') return "from-indigo-600 via-purple-600 to-indigo-600";
  if (theme === 'fuchsia') return "from-fuchsia-600 via-pink-600 to-fuchsia-600";
  if (theme === 'blue') return "from-blue-600 via-indigo-600 to-blue-600";
  if (theme === 'cyan') return "from-cyan-600 via-sky-600 to-cyan-600";
  if (theme === 'teal') return "from-teal-600 via-emerald-600 to-teal-600";
  if (theme === 'green') return "from-green-600 via-lime-600 to-green-600";
  if (theme === 'yellow') return "from-yellow-600 via-amber-600 to-yellow-600";
  if (theme === 'red') return "from-red-600 via-rose-600 to-red-600";
  if (theme === 'pink') return "from-pink-600 via-rose-600 to-pink-600";
  if (theme === 'violet') return "from-violet-600 via-purple-600 to-violet-600";
  return "from-blue-600 via-indigo-600 to-blue-600";
};

/**
 * Obtiene el color del botón según el estado del paquete
 * @param status - Estado del paquete
 * @param themeColor - Color del tema seleccionado
 * @returns Clase CSS con el color de botón correspondiente
 */
export const getStatusButtonColor = (status: string, themeColor: string | number): string => {
  if (status === 'delivered' || status === 'completed') {
    return "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700";
  } else if (status === 'in_transit' || status === 'in-transit' || status === 'pending') {
    const theme = String(themeColor);
    if (theme === 'default' || theme === 'blue') {
      return "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700";
    }
    if (theme === 'sky') return "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700";
    if (theme === 'emerald') return "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700";
    if (theme === 'rose') return "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700";
    if (theme === 'amber') return "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700";
    if (theme === 'orange') return "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700";
    if (theme === 'purple') return "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700";
    return "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700";
  } else if (status === 'canceled' || status === 'returned' || status === 'lost') {
    return "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700";
  } else {
    return "bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700";
  }
}; 