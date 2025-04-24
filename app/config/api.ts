export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Asegurarnos de que la URL base no tenga barras al final
const getBaseUrl = () => API_URL.replace(/\/+$/, '');

// Dado que NEXT_PUBLIC_API_URL ya incluye el prefijo /api/v1, 
// las rutas relativas no deben incluir este prefijo nuevamente
export const API_ROUTES = {
  payments: {
    process: (invoiceId: string) => `${getBaseUrl()}/payments/${invoiceId}/process`,
    invoices: (userId: string) => `${getBaseUrl()}/payments/invoices/${userId}`,
    pending: () => `${getBaseUrl()}/payments/pending`
  },
  transactions: {
    create: () => `${getBaseUrl()}/transactions`,
    types: () => `${getBaseUrl()}/transactions/types`,
    entity: (type: string, id: string) => `${getBaseUrl()}/transactions/entity/${type}/${id}`,
    today: (page?: number, limit?: number) => {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      const queryString = params.toString();
      return `${getBaseUrl()}/transactions/today${queryString ? `?${queryString}` : ''}`;
    },
    byCategory: (categoryId: string) => `${getBaseUrl()}/transactions/category/${categoryId}`
  },
  cashClosures: {
    current: () => `${getBaseUrl()}/cash-closures/current`,
    history: () => `${getBaseUrl()}/cash-closures/history`,
    close: () => `${getBaseUrl()}/cash-closures/close`,
    transactions: (id: string) => `${getBaseUrl()}/cash-closures/${id}/transactions`
  },
  paymentTypes: {
    all: (includeInactive = false) => includeInactive 
      ? `${getBaseUrl()}/payment-types?includeInactive=${includeInactive}` 
      : `${getBaseUrl()}/payment-types`,
    byId: (id: string) => `${getBaseUrl()}/payment-types/${id}`,
    byCode: (code: string) => `${getBaseUrl()}/payment-types/code/${code}`
  },
  users: {
    search: (query: string) => `${getBaseUrl()}/users/search?q=${encodeURIComponent(query)}`,
    suggestions: (query: string) => `${getBaseUrl()}/users/suggestions?q=${encodeURIComponent(query)}`
  }
}; 