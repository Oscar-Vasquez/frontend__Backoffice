import { CashClosure, CashClosureFilters, CashClosureHistoryItem } from "@/types/cash-closure";
import { API_ROUTES } from "@/app/config/api";

interface GetCashClosuresParams extends CashClosureFilters {
  page?: number;
  limit?: number;
}

interface CashClosureResponse {
  data: CashClosure[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

interface CashClosureHistoryResponse {
  data: CashClosureHistoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

/**
 * Obtener los headers para la autenticación
 */
const getAuthHeaders = () => {
  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
};

/**
 * Crear un cierre de caja vacío como fallback
 */
const createEmptyCashClosure = (): CashClosure => {
  return {
    id: "temp-" + Date.now(),
    createdAt: new Date().toISOString(),
    status: "open",
    paymentMethods: [],
    totalAmount: 0,
    totalCredit: 0,
    totalDebit: 0
  };
};

/**
 * Crear una respuesta de historial vacía como fallback
 */
const createEmptyHistoryResponse = (page: number = 1, limit: number = 10): CashClosureHistoryResponse => {
  return {
    data: [],
    meta: {
      total: 0,
      page,
      limit
    }
  };
};

export const cashClosureService = {
  /**
   * Obtiene el cierre de caja actual
   */
  getCurrentCashClosure: async (): Promise<CashClosure> => {
    try {
      const response = await fetch(API_ROUTES.cashClosures.current(), {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Error al obtener el cierre de caja actual');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error fetching current cash closure:", error);
      console.warn("Utilizando cierre de caja vacío como fallback");
      return createEmptyCashClosure();
    }
  },

  /**
   * Obtiene el historial de cierres de caja
   */
  getCashClosureHistory: async (
    params: GetCashClosuresParams
  ): Promise<CashClosureHistoryResponse> => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());
      if (params.startDate) queryParams.append("startDate", params.startDate);
      if (params.endDate) queryParams.append("endDate", params.endDate);
      if (params.status) queryParams.append("status", params.status);

      const url = `${API_ROUTES.cashClosures.history()}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Error al obtener el historial de cierres de caja');
      }

      const result = await response.json();
      return {
        data: result.data,
        meta: result.meta
      };
    } catch (error) {
      console.error("Error fetching cash closure history:", error);
      console.warn("Utilizando historial vacío como fallback");
      return createEmptyHistoryResponse(params.page || 1, params.limit || 10);
    }
  },

  /**
   * Cierra la caja actual
   */
  closeCashClosure: async (): Promise<CashClosure> => {
    try {
      const response = await fetch(API_ROUTES.cashClosures.close(), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error('Error al cerrar la caja');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error closing cash closure:", error);
      throw error;
    }
  },

  /**
   * Obtiene las transacciones asociadas a un cierre de caja
   */
  getTransactionsForCashClosure: async (
    cashClosureId: string,
    page = 1,
    limit = 20
  ): Promise<any> => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());

      const url = `${API_ROUTES.cashClosures.transactions(cashClosureId)}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error al obtener transacciones del cierre ${cashClosureId}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Error fetching transactions for cash closure ${cashClosureId}:`, error);
      // Devolver una estructura de respuesta vacía como fallback
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit
        }
      };
    }
  }
}; 