"use client";

import { Invoice } from "@/types/invoice";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const InvoiceService = {
  async getAll(): Promise<Invoice[]> {
    try {
      // Obtener el token de autenticación
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${API_URL}/api/v1/invoices`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error al obtener facturas');
      const data = await response.json();
      const transformedInvoices = data.map((invoice: any) => ({
        ...invoice,
        total: parseFloat(invoice.total),
        fechaEmision: new Date(invoice.fechaEmision).toISOString(),
        fechaVencimiento: new Date(invoice.fechaVencimiento).toISOString()
      }));
      return transformedInvoices;
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  },

  async getSummary() {
    try {
      // Obtener el token de autenticación
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${API_URL}/invoices/summary`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Error al obtener resumen');
      return await response.json();
    } catch (error) {
      console.error('Error en getSummary:', error);
      throw error;
    }
  },

  async create(invoice: Partial<Invoice>) {
    try {
      // Obtener el token de autenticación
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(invoice),
      });

      if (!response.ok) throw new Error('Error al crear factura');
      return await response.json();
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: string) {
    try {
      // Obtener el token de autenticación
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${API_URL}/invoices/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Error al actualizar estado');
      return await response.json();
    } catch (error) {
      console.error('Error en updateStatus:', error);
      throw error;
    }
  },

  async sendByEmail(id: number, email: string) {
    try {
      // Obtener el token de autenticación
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      const response = await fetch(`${API_URL}/invoices/${id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Error al enviar factura por email');
      return await response.json();
    } catch (error) {
      console.error('Error en sendByEmail:', error);
      throw error;
    }
  }
};
