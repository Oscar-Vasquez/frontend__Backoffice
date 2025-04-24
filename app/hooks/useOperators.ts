"use client";

import { useState, useEffect } from 'react';
import { Operator, Branch, UseOperatorsResult } from '@/types/operators';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useOperators(): UseOperatorsResult {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Evitar redirecciones infinitas
    if (window.isRedirecting) {
      console.log('🛑 useOperators: Ya hay una redirección en progreso, evitando ciclo');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      console.log('📥 Iniciando fetch de operadores y sucursales');
      try {
        setLoading(true);
        setError(null);

        // Obtener el token de autenticación
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        // Obtener operadores y sucursales en paralelo
        const [operatorsResponse, branchesResponse] = await Promise.all([
          fetch(`${API_URL}/operators`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          }),
          fetch(`${API_URL}/branches`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          })
        ]);

        // Verificar respuestas y manejar errores específicos
        if (!operatorsResponse.ok) {
          if (operatorsResponse.status === 401) {
            console.error('❌ Error de autenticación al obtener operadores');
            throw new Error('Sesión expirada o inválida');
          }
          const errorData = await operatorsResponse.json();
          throw new Error(errorData.message || 'Error al obtener operadores');
        }

        if (!branchesResponse.ok) {
          if (branchesResponse.status === 401) {
            console.error('❌ Error de autenticación al obtener sucursales');
            throw new Error('Sesión expirada o inválida');
          }
          const errorData = await branchesResponse.json();
          throw new Error(errorData.message || 'Error al obtener sucursales');
        }

        const [operatorsData, branchesData] = await Promise.all([
          operatorsResponse.json(),
          branchesResponse.json()
        ]);

        // Mapear las sucursales para tener un formato consistente
        const formattedBranches = branchesData.map((branch: any) => ({
          id: branch.id,
          name: branch.name,
          reference: `/branches/${branch.id}`,
          province: branch.province,
          address: branch.address
        }));

        // Mapear los operadores con su branchReference
        const formattedOperators = operatorsData.map((operator: any) => {
          const branchRef = operator.branchReference || null;
          const branch = formattedBranches.find((b: Branch) => b.reference === branchRef);

          return {
            id: operator.operatorId || operator.id,
            firstName: operator.firstName,
            lastName: operator.lastName,
            email: operator.email,
            role: operator.role,
            status: operator.status,
            branchReference: branchRef,
            branchName: branch?.name || null,
            lastActivity: operator.lastLoginAt ? new Date(operator.lastLoginAt) : undefined,
            photo: operator.photo
          };
        });

        setOperators(formattedOperators);
        setBranches(formattedBranches);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError(error instanceof Error ? error.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Solo se ejecuta una vez al montar el componente

  return {
    operators,
    branches,
    loading,
    error
  };
} 