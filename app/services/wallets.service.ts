const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Wallet {
  id: string;
  name: string;
  type: 'standard' | 'premium';
  balance: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface ApiError {
  message: string;
  details?: string;
  statusCode?: number;
}

export class WalletsService {
  static async getWallet(walletId: string): Promise<Wallet | null> {
    try {
      console.log('💰 Obteniendo billetera:', walletId);
      
      const response = await fetch(`${API_URL}/api/v1/wallets/${walletId}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener billetera');
      }

      const data = await response.json();
      console.log('✅ Billetera obtenida:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener billetera:', error);
      return null;
    }
  }

  static async getWalletBalance(walletId: string): Promise<number> {
    try {
      console.log('💰 Obteniendo saldo de billetera:', walletId);
      
      const response = await fetch(`${API_URL}/api/v1/wallets/${walletId}/balance`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener saldo');
      }

      const data = await response.json();
      console.log('✅ Saldo obtenido:', data);
      return data.balance;
    } catch (error) {
      console.error('❌ Error al obtener saldo:', error);
      throw error;
    }
  }

  static async updateWalletStatus(walletId: string, status: 'active' | 'inactive'): Promise<Wallet> {
    try {
      console.log('🔄 Actualizando estado de billetera:', { walletId, status });
      
      const response = await fetch(`${API_URL}/api/v1/wallets/${walletId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar estado');
      }

      const data = await response.json();
      console.log('✅ Estado actualizado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      throw error;
    }
  }

  static async getWalletTransactions(walletId: string, page: number = 1, limit: number = 10): Promise<any> {
    try {
      console.log('📊 Obteniendo transacciones:', { walletId, page, limit });
      
      const response = await fetch(
        `${API_URL}/api/v1/wallets/${walletId}/transactions?page=${page}&limit=${limit}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener transacciones');
      }

      const data = await response.json();
      console.log('✅ Transacciones obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener transacciones:', error);
      throw error;
    }
  }
} 