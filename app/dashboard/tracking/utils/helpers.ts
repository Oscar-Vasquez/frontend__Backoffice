/**
 * Formatea un precio a 2 decimales y agrega separadores de miles
 * @param price - Precio a formatear
 * @returns Precio formateado
 */
export const formatPrice = (price: number | string | undefined): string => {
  if (price === undefined || price === null) return '0.00';
  
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numericPrice)) return '0.00';
  
  return numericPrice.toLocaleString('es-PA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}; 