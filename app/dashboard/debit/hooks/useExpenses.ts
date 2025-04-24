import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Transaction, 
  TransactionStats, 
  CreateTransactionDto, 
  UpdateTransactionDto,
  TransactionFilter,
  TransactionType,
  TransactionStatus
} from '../types';
import { customToast } from '@/app/lib/toast';

// Servicio simulado para integrar con backend
// En una implementación real, esto se reemplazaría por llamadas reales a la API
const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2023-04-01T10:30:00Z',
    amount: 1500,
    description: 'Pago alquiler local',
    categoryId: '1',
    category: {
      id: '1',
      name: 'Alquiler',
      color: '#4f46e5',
      isActive: true,
      transactionType: 'gasto',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    transactionType: 'gasto',
    status: 'completada',
    paymentMethod: 'transferencia',
    reference: 'TRF-202304-001',
    userId: 'operador1',
    createdAt: '2023-04-01T10:30:00Z',
    updatedAt: '2023-04-01T10:30:00Z',
    createdBy: 'operador1',
  },
  {
    id: '2',
    date: '2023-04-05T14:20:00Z',
    amount: 350,
    description: 'Suministros de oficina',
    categoryId: '2',
    category: {
      id: '2',
      name: 'Insumos',
      color: '#0ea5e9',
      isActive: true,
      transactionType: 'gasto',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    transactionType: 'gasto',
    status: 'completada',
    paymentMethod: 'efectivo',
    userId: 'operador1',
    createdAt: '2023-04-05T14:20:00Z',
    updatedAt: '2023-04-05T14:20:00Z',
    createdBy: 'operador1',
  },
  {
    id: '3',
    date: '2023-04-10T09:15:00Z',
    amount: 480,
    description: 'Servicios de internet',
    categoryId: '3',
    category: {
      id: '3',
      name: 'Servicios',
      color: '#ec4899',
      isActive: true,
      transactionType: 'gasto',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    transactionType: 'gasto',
    status: 'completada',
    paymentMethod: 'tarjeta_debito',
    reference: 'FAC-202304-123',
    userId: 'operador2',
    createdAt: '2023-04-10T09:15:00Z',
    updatedAt: '2023-04-10T09:15:00Z',
    createdBy: 'operador2',
  },
  {
    id: '4',
    date: '2023-04-15T11:45:00Z',
    amount: 750,
    description: 'Material de embalaje',
    categoryId: '2',
    category: {
      id: '2',
      name: 'Insumos',
      color: '#0ea5e9',
      isActive: true,
      transactionType: 'gasto',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    transactionType: 'gasto',
    status: 'completada',
    paymentMethod: 'tarjeta_credito',
    reference: 'TC-202304-004',
    userId: 'operador1',
    createdAt: '2023-04-15T11:45:00Z',
    updatedAt: '2023-04-15T11:45:00Z',
    createdBy: 'operador1',
  },
  {
    id: '5',
    date: '2023-04-20T13:30:00Z',
    amount: 2200,
    description: 'Pago salario temporal',
    categoryId: '4',
    category: {
      id: '4',
      name: 'Salarios',
      color: '#f59e0b',
      isActive: true,
      transactionType: 'gasto',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    transactionType: 'gasto',
    status: 'completada',
    paymentMethod: 'transferencia',
    reference: 'TRF-202304-088',
    userId: 'operador2',
    createdAt: '2023-04-20T13:30:00Z',
    updatedAt: '2023-04-20T13:30:00Z',
    createdBy: 'operador2',
  },
  {
    id: '6',
    date: '2023-04-25T16:10:00Z',
    amount: 320,
    description: 'Mantenimiento equipo',
    categoryId: '5',
    category: {
      id: '5',
      name: 'Mantenimiento',
      color: '#84cc16',
      isActive: true,
      transactionType: 'gasto',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    transactionType: 'gasto',
    status: 'completada',
    paymentMethod: 'efectivo',
    userId: 'operador1',
    createdAt: '2023-04-25T16:10:00Z',
    updatedAt: '2023-04-25T16:10:00Z',
    createdBy: 'operador1',
  },
  {
    id: '7',
    date: '2023-04-28T10:00:00Z',
    amount: 180,
    description: 'Recarga combustible',
    categoryId: '6',
    category: {
      id: '6',
      name: 'Transporte',
      color: '#8b5cf6',
      isActive: true,
      transactionType: 'gasto',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    transactionType: 'gasto',
    status: 'completada',
    paymentMethod: 'tarjeta_debito',
    reference: 'TD-202304-099',
    userId: 'operador1',
    createdAt: '2023-04-28T10:00:00Z',
    updatedAt: '2023-04-28T10:00:00Z',
    createdBy: 'operador1',
  },
  {
    id: '8',
    date: '2023-05-01T10:30:00Z',
    amount: 1500,
    description: 'Pago alquiler local',
    categoryId: '1',
    category: {
      id: '1',
      name: 'Alquiler',
      color: '#4f46e5',
      isActive: true,
      transactionType: 'gasto',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    transactionType: 'gasto',
    status: 'completada',
    paymentMethod: 'transferencia',
    reference: 'TRF-202305-001',
    userId: 'operador1',
    createdAt: '2023-05-01T10:30:00Z',
    updatedAt: '2023-05-01T10:30:00Z',
    createdBy: 'operador1',
  },
  {
    id: '9',
    date: '2023-05-08T12:15:00Z',
    amount: 490,
    description: 'Servicios de agua',
    categoryId: '3',
    category: {
      id: '3',
      name: 'Servicios',
      color: '#ec4899',
      isActive: true,
      transactionType: 'gasto',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    transactionType: 'gasto',
    status: 'completada',
    paymentMethod: 'efectivo',
    reference: 'SRV-202305-012',
    userId: 'operador2',
    createdAt: '2023-05-08T12:15:00Z',
    updatedAt: '2023-05-08T12:15:00Z',
    createdBy: 'operador2',
  },
  {
    id: '10',
    date: '2023-05-12T09:45:00Z',
    amount: 2300,
    description: 'Pago salario temporal',
    categoryId: '4',
    category: {
      id: '4',
      name: 'Salarios',
      color: '#f59e0b',
      isActive: true,
      transactionType: 'gasto',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    },
    transactionType: 'gasto',
    status: 'completada',
    paymentMethod: 'transferencia',
    reference: 'TRF-202305-024',
    userId: 'operador1',
    createdAt: '2023-05-12T09:45:00Z',
    updatedAt: '2023-05-12T09:45:00Z',
    createdBy: 'operador1',
  },
];

interface UseTransactionsProps {
  initialFilter?: TransactionFilter;
  transactionType?: TransactionType;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  stats: TransactionStats;
  isLoading: boolean;
  isCreatingTransaction: boolean;
  getTransactions: () => Promise<void>;
  createTransaction: (data: CreateTransactionDto) => Promise<void>;
  updateTransaction: (data: UpdateTransactionDto) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  filterTransactions: (
    filter: TransactionFilter,
    search: string,
    dateRange?: { from?: Date; to?: Date },
    categories?: string[]
  ) => void;
}

export function useTransactions({ 
  initialFilter = 'todos', 
  transactionType = 'gasto' 
}: UseTransactionsProps = {}): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<TransactionFilter>(initialFilter);
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentDateRange, setCurrentDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [currentCategories, setCurrentCategories] = useState<string[]>([]);

  // Estadísticas calculadas
  const stats: TransactionStats = useMemo(() => {
    // Filtrar por tipo de transacción (gastos)
    const typeFilteredTransactions = transactions.filter(t => t.transactionType === transactionType);
    
    if (typeFilteredTransactions.length === 0) {
      return {
        totalTransactions: 0,
        totalAmount: 0,
        avgTransactionAmount: 0,
        mostCommonCategory: '-',
        largestTransaction: 0,
        lastMonthTotal: 0,
        currentMonthTotal: 0,
        monthlyDifference: 0,
        lastUpdate: new Date().toISOString(),
      };
    }

    // Calcular total de transacciones
    const totalAmount = typeFilteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Calcular promedio
    const avgTransactionAmount = totalAmount / typeFilteredTransactions.length;
    
    // Encontrar la transacción más grande
    const largestTransaction = Math.max(...typeFilteredTransactions.map(transaction => transaction.amount));
    
    // Encontrar la categoría más común
    const categoryCounts = typeFilteredTransactions.reduce((acc, transaction) => {
      const categoryId = transaction.categoryId;
      acc[categoryId] = (acc[categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    let mostCommonCategoryId = '';
    let maxCount = 0;
    
    Object.entries(categoryCounts).forEach(([categoryId, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonCategoryId = categoryId;
      }
    });
    
    const mostCommonCategory = typeFilteredTransactions.find(
      transaction => transaction.categoryId === mostCommonCategoryId
    )?.category?.name || '-';
    
    // Calcular transacciones del mes actual y el pasado
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const currentMonthTotal = typeFilteredTransactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getFullYear() === currentYear &&
          transactionDate.getMonth() === currentMonth
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
      
    const lastMonthTotal = typeFilteredTransactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getFullYear() === lastMonthYear &&
          transactionDate.getMonth() === lastMonth
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Calcular diferencia porcentual
    const monthlyDifference = lastMonthTotal === 0
      ? 100 // Si no había transacciones el mes pasado, el aumento es del 100%
      : ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    
    return {
      totalTransactions: typeFilteredTransactions.length,
      totalAmount,
      avgTransactionAmount,
      mostCommonCategory,
      largestTransaction,
      lastMonthTotal,
      currentMonthTotal,
      monthlyDifference,
      lastUpdate: new Date().toISOString(),
    };
  }, [transactions, transactionType]);

  // Cargar transacciones
  const getTransactions = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filtrar transacciones por tipo (gasto/ingreso)
      const filteredByType = mockTransactions.filter(t => t.transactionType === transactionType);
      
      // Usar datos de prueba
      setTransactions(filteredByType);
      setFilteredTransactions(filteredByType);
    } catch (error) {
      console.error('Error al cargar las transacciones:', error);
      customToast.error({
        title: 'Error',
        description: 'No se pudieron cargar las transacciones'
      });
    } finally {
      setIsLoading(false);
    }
  }, [transactionType]);

  // Crear una nueva transacción
  const createTransaction = useCallback(async (data: CreateTransactionDto) => {
    setIsCreatingTransaction(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Crear un nuevo ID único
      const newId = `${transactions.length + 1}`;
      
      // Asegurarse de que se establece el tipo de transacción
      const transactionData = {
        ...data,
        transactionType: data.transactionType || transactionType
      };
      
      // Crear nueva transacción
      const newTransaction: Transaction = {
        id: newId,
        ...transactionData,
        userId: 'operador1', // En un caso real, esto vendría del contexto de autenticación
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'operador1', // En un caso real, esto vendría del contexto de autenticación
      };
      
      // Agregar a la lista
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Actualizar lista filtrada si es necesario
      setFilteredTransactions(prev => {
        // Verificar si la nueva transacción cumple con los filtros actuales
        if (shouldIncludeTransaction(newTransaction, currentFilter, currentSearch, currentDateRange, currentCategories)) {
          return [newTransaction, ...prev];
        }
        return prev;
      });
      
    } catch (error) {
      console.error('Error al crear transacción:', error);
      throw error;
    } finally {
      setIsCreatingTransaction(false);
    }
  }, [transactions, currentFilter, currentSearch, currentDateRange, currentCategories, transactionType]);

  // Actualizar una transacción existente
  const updateTransaction = useCallback(async (data: UpdateTransactionDto) => {
    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Actualizar transacción en la lista
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === data.id
            ? { ...transaction, ...data, updatedAt: new Date().toISOString(), updatedBy: 'operador1' }
            : transaction
        )
      );
      
      // Actualizar lista filtrada
      setFilteredTransactions(prev => 
        prev.map(transaction => 
          transaction.id === data.id
            ? { ...transaction, ...data, updatedAt: new Date().toISOString(), updatedBy: 'operador1' }
            : transaction
        )
      );
      
      customToast.success({
        title: 'Transacción actualizada',
        description: 'La transacción ha sido actualizada correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar transacción:', error);
      customToast.error({
        title: 'Error',
        description: 'No se pudo actualizar la transacción'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Eliminar una transacción
  const deleteTransaction = useCallback(async (id: string) => {
    setIsLoading(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Eliminar transacción de la lista
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      
      // Actualizar lista filtrada
      setFilteredTransactions(prev => prev.filter(transaction => transaction.id !== id));
      
    } catch (error) {
      console.error('Error al eliminar transacción:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función auxiliar para determinar si una transacción cumple con los criterios de filtrado
  const shouldIncludeTransaction = (
    transaction: Transaction,
    filter: TransactionFilter,
    search: string,
    dateRange: { from?: Date; to?: Date },
    categories: string[]
  ): boolean => {
    // Verificar si coincide con el tipo de transacción
    if (transaction.transactionType !== transactionType) {
      return false;
    }
    
    // Filtrar por búsqueda
    if (search && !transaction.description.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    // Filtrar por rango de fechas
    if (dateRange.from || dateRange.to) {
      const transactionDate = new Date(transaction.date);
      
      if (dateRange.from && transactionDate < dateRange.from) {
        return false;
      }
      
      if (dateRange.to) {
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999); // Fin del día
        
        if (transactionDate > endDate) {
          return false;
        }
      }
    }
    
    // Filtrar por categorías
    if (categories && categories.length > 0 && !categories.includes(transaction.categoryId)) {
      return false;
    }
    
    // Filtrar por tipo de transacción
    switch (filter) {
      case 'recientes':
        // Transacciones de los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(transaction.date) >= thirtyDaysAgo;
        
      case 'mayores':
        // Transacciones superiores a un monto (ej. 500)
        return transaction.amount > 500;
        
      case 'todos':
      default:
        return true;
    }
  };

  // Función para aplicar filtros
  const filterTransactions = useCallback((
    filter: TransactionFilter,
    search: string,
    dateRange?: { from?: Date; to?: Date },
    categories?: string[]
  ) => {
    setCurrentFilter(filter);
    setCurrentSearch(search);
    setCurrentDateRange(dateRange || {});
    setCurrentCategories(categories || []);
    
    const filtered = transactions.filter(transaction => 
      shouldIncludeTransaction(
        transaction,
        filter,
        search,
        dateRange || {},
        categories || []
      )
    );
    
    setFilteredTransactions(filtered);
  }, [transactions, transactionType]);

  // Aplicar filtros cuando cambian las transacciones
  useEffect(() => {
    filterTransactions(currentFilter, currentSearch, currentDateRange, currentCategories);
  }, [transactions, filterTransactions, currentFilter, currentSearch, currentDateRange, currentCategories]);

  return {
    transactions,
    filteredTransactions,
    stats,
    isLoading,
    isCreatingTransaction,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    filterTransactions,
  };
} 