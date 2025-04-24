import { useState, useEffect, useMemo, useCallback } from 'react';
import { TransactionCategory, CategoryWithAmount, SelectedCategories } from '../types';

// Categorías de transacciones simuladas
const mockCategories: TransactionCategory[] = [
  {
    id: '1',
    name: 'Alquiler',
    description: 'Pagos de alquiler de local',
    color: '#4f46e5',
    isActive: true,
    transactionType: 'gasto',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Insumos',
    description: 'Material y suministros',
    color: '#0ea5e9',
    isActive: true,
    transactionType: 'gasto',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Servicios',
    description: 'Servicios básicos (agua, luz, internet)',
    color: '#ec4899',
    isActive: true,
    transactionType: 'gasto',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Salarios',
    description: 'Pagos a empleados y colaboradores',
    color: '#f59e0b',
    isActive: true,
    transactionType: 'gasto',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'Mantenimiento',
    description: 'Mantenimiento de equipos e instalaciones',
    color: '#84cc16',
    isActive: true,
    transactionType: 'gasto',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '6',
    name: 'Transporte',
    description: 'Gastos de transporte y combustible',
    color: '#8b5cf6',
    isActive: true,
    transactionType: 'gasto',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '7',
    name: 'Marketing',
    description: 'Publicidad y promoción',
    color: '#f43f5e',
    isActive: true,
    transactionType: 'gasto',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '8',
    name: 'Impuestos',
    description: 'Pagos a autoridades fiscales',
    color: '#64748b',
    isActive: true,
    transactionType: 'gasto',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

// Datos de montos por categoría simulados
const mockCategoryAmounts: Record<string, { total: number; count: number }> = {
  '1': { total: 3000, count: 2 },  // Alquiler
  '2': { total: 1100, count: 2 },  // Insumos
  '3': { total: 970, count: 2 },   // Servicios
  '4': { total: 4500, count: 2 },  // Salarios
  '5': { total: 320, count: 1 },   // Mantenimiento
  '6': { total: 180, count: 1 },   // Transporte
  '7': { total: 450, count: 0 },   // Marketing (no presente en las transacciones)
  '8': { total: 750, count: 0 },   // Impuestos (no presente en las transacciones)
};

interface UseCategoryFiltersReturn {
  categories: TransactionCategory[];
  selectedCategories: string[];
  toggleCategory: (categoryId: string) => void;
  resetCategories: () => void;
  selectAllCategories: () => void;
  categoriesWithAmounts: CategoryWithAmount[];
  isCategorySelected: (categoryId: string) => boolean;
}

interface UseCategoryFiltersProps {
  transactionType?: string;
}

export function useCategoryFilters({ 
  transactionType = 'gasto' 
}: UseCategoryFiltersProps = {}): UseCategoryFiltersReturn {
  // Estado para las categorías
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  
  // Estado para las categorías seleccionadas
  const [selectedCategoriesMap, setSelectedCategoriesMap] = useState<SelectedCategories>({});
  
  // Cargar categorías
  useEffect(() => {
    // Simular carga de categorías (filtrar por tipo de transacción)
    const filteredCategories = mockCategories.filter(
      category => category.transactionType === transactionType
    );
    
    setCategories(filteredCategories);
    
    // Inicializar todas las categorías como no seleccionadas
    const initialSelectedCategories: SelectedCategories = {};
    filteredCategories.forEach(category => {
      initialSelectedCategories[category.id] = false;
    });
    
    setSelectedCategoriesMap(initialSelectedCategories);
  }, [transactionType]);
  
  // Convertir el mapa de selección a un array de IDs
  const selectedCategories = useMemo(() => {
    return Object.entries(selectedCategoriesMap)
      .filter(([_, isSelected]) => isSelected)
      .map(([categoryId]) => categoryId);
  }, [selectedCategoriesMap]);
  
  // Función para alternar la selección de una categoría
  const toggleCategory = useCallback((categoryId: string) => {
    setSelectedCategoriesMap(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  }, []);
  
  // Función para reiniciar la selección de categorías
  const resetCategories = useCallback(() => {
    const resetMap: SelectedCategories = {};
    categories.forEach(category => {
      resetMap[category.id] = false;
    });
    setSelectedCategoriesMap(resetMap);
  }, [categories]);
  
  // Función para seleccionar todas las categorías
  const selectAllCategories = useCallback(() => {
    const allSelectedMap: SelectedCategories = {};
    categories.forEach(category => {
      allSelectedMap[category.id] = true;
    });
    setSelectedCategoriesMap(allSelectedMap);
  }, [categories]);
  
  // Función para verificar si una categoría está seleccionada
  const isCategorySelected = useCallback((categoryId: string) => {
    return !!selectedCategoriesMap[categoryId];
  }, [selectedCategoriesMap]);
  
  // Calcular datos de categorías con montos para gráficos
  const categoriesWithAmounts = useMemo(() => {
    // Calcular el total general
    const totalAmount = Object.values(mockCategoryAmounts)
      .reduce((sum, { total }) => sum + total, 0);
    
    // Mapear categorías con sus montos
    return categories.map(category => {
      const { total = 0, count = 0 } = mockCategoryAmounts[category.id] || { total: 0, count: 0 };
      const percentage = totalAmount > 0 ? (total / totalAmount) * 100 : 0;
      
      return {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        totalAmount: total,
        count,
        percentage
      };
    }).sort((a, b) => b.totalAmount - a.totalAmount); // Ordenar de mayor a menor
  }, [categories]);
  
  return {
    categories,
    selectedCategories,
    toggleCategory,
    resetCategories,
    selectAllCategories,
    categoriesWithAmounts,
    isCategorySelected
  };
} 