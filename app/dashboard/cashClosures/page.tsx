"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import { cashClosureService } from "@/services/cash-closure.service";
import { CashClosure, CashClosureFilters, CashClosureHistoryItem } from "@/types/cash-closure";
import { CurrentCashClosure } from "./components/current-cash-closure";
import { CashClosureHistory } from "./components/cash-closure-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Función auxiliar para comparar filtros
function areFiltersEqual(filterA: CashClosureFilters, filterB: CashClosureFilters): boolean {
  return (
    filterA.startDate === filterB.startDate &&
    filterA.endDate === filterB.endDate &&
    filterA.status === filterB.status
  );
}

export default function CashClosurePage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("current");
  const [currentCashClosure, setCurrentCashClosure] = useState<CashClosure | null>(null);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [cashClosureHistory, setCashClosureHistory] = useState<CashClosureHistoryItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [filters, setFilters] = useState<CashClosureFilters>({});

  // Cargar el cierre de caja actual
  const fetchCurrentCashClosure = async () => {
    setIsLoadingCurrent(true);
    try {
      const data = await cashClosureService.getCurrentCashClosure();
      setCurrentCashClosure(data);
    } catch (error) {
      console.error("Error fetching current cash closure:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del cierre de caja actual",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoadingCurrent(false);
      }, 500); // Pequeño retraso para asegurar que el skeleton se vea incluso en cargas rápidas
    }
  };

  // Cargar el historial de cierres de caja
  const fetchCashClosureHistory = useCallback(async () => {
    if (!activeTab || activeTab !== "history") return;
    
    setIsLoadingHistory(true);
    try {
      const response = await cashClosureService.getCashClosureHistory({
        ...filters,
        page: currentPage,
        limit: pageSize,
      });
      setCashClosureHistory(response.data);
      setTotalItems(response.meta.total);
    } catch (error) {
      console.error("Error fetching cash closure history:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de cierres de caja",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoadingHistory(false);
      }, 500); // Pequeño retraso para asegurar que el skeleton se vea incluso en cargas rápidas
    }
  }, [activeTab, filters, currentPage, pageSize, toast]);

  // Cerrar la caja actual
  const handleCloseCashClosure = async () => {
    try {
      const updatedCashClosure = await cashClosureService.closeCashClosure();
      setCurrentCashClosure(updatedCashClosure);
      
      toast({
        title: "Cierre realizado",
        description: "El cierre de caja se ha realizado correctamente.",
      });
      
      // Recargar el historial después de cerrar
      if (activeTab === "history") {
        fetchCashClosureHistory();
      }
    } catch (error) {
      console.error("Error closing cash closure:", error);
      throw error; // Propagar el error para que se maneje en el componente hijo
    }
  };

  // Manejar cambio de filtros
  const handleFilterChange = useCallback((newFilters: CashClosureFilters) => {
    // Solo actualizar si los filtros han cambiado realmente
    setFilters(prevFilters => {
      if (areFiltersEqual(prevFilters, newFilters)) {
        return prevFilters; // No hay cambios, devolver el estado anterior
      }
      setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
      return newFilters; // Devolver los nuevos filtros
    });
  }, []);

  // Manejar cambio de página
  const handlePageChange = useCallback((page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  }, [currentPage]);

  // Manejar cambio de tab
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    // Si cambiamos a la pestaña de historial y no tenemos datos aún, establecer el estado de carga
    if (value === "history" && cashClosureHistory.length === 0) {
      setIsLoadingHistory(true);
    }
  }, [cashClosureHistory.length]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchCurrentCashClosure();
  }, []);

  // Cargar historial cuando cambian los filtros o la página
  useEffect(() => {
    if (activeTab === "history") {
      fetchCashClosureHistory();
    }
  }, [activeTab, fetchCashClosureHistory]);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Cierre de Caja</h1>
        <p className="text-muted-foreground">
          Administra los cierres de caja y monitorea las transacciones por método de pago
        </p>
      </div>

      <Tabs
        defaultValue="current"
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="current">Caja Actual</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="current" className="m-0">
            {/* Siempre renderizamos el componente, incluso durante la carga, 
                para que pueda mostrar su propio skeleton */}
            <CurrentCashClosure
              cashClosure={currentCashClosure || {
                id: "",
                createdAt: new Date().toISOString(),
                status: "open",
                paymentMethods: [],
                totalAmount: 0,
                totalCredit: 0,
                totalDebit: 0
              }}
              onCloseCashClosure={handleCloseCashClosure}
              isLoading={isLoadingCurrent}
            />
          </TabsContent>
          <TabsContent value="history" className="m-0">
            <CashClosureHistory
              cashClosures={cashClosureHistory}
              isLoading={isLoadingHistory}
              filters={filters}
              onFilterChange={handleFilterChange}
              totalItems={totalItems}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
} 