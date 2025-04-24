'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'sonner';

// Tipos para la gestión de facturación
export interface InvoicePackage {
  id: string;
  trackingNumber: string;
  weight: number;
  price: number;
  clientId: string;
  clientName: string;
  hasInsurance?: boolean;
  insurancePrice?: number;
}

export interface InvoiceGroup {
  clientId: string;
  clientName: string;
  planRate: number;
  packages: InvoicePackage[];
  total: number;
  clientPhoto?: string;
  clientEmail?: string;
  planName?: string;
  branchName?: string;
}

interface InvoiceContextType {
  packagesToInvoice: InvoiceGroup[];
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (isOpen: boolean) => void;
  addPackageToInvoice: (
    packageId: string,
    trackingNumber: string,
    weight: number,
    clientId: string,
    clientName: string,
    planRate: number,
    clientDetails?: {
      photo?: string;
      email?: string;
      planName?: string;
      branchName?: string;
      shipping_insurance?: boolean | string | number;
    }
  ) => void;
  removePackageFromInvoice: (clientId: string, packageId: string) => void;
  clearInvoiceList: () => void;
  isPackageInInvoice: (packageId: string, trackingNumber: string) => boolean;
  totalPackages: number;
  cleanupDuplicates: () => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estados para la gestión de facturación usando localStorage
  const [packagesToInvoice, setPackagesToInvoice] = useState<InvoiceGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('packagesToInvoice');
      try {
        const parsedData = saved ? JSON.parse(saved) : [];
        // Aplicar limpieza de duplicados al cargar los datos
        return removeDuplicatesFromInvoiceGroups(parsedData);
      } catch (error) {
        console.error('Error parsing packagesToInvoice from localStorage:', error);
        return [];
      }
    }
    return [];
  });
  
  // Función para eliminar duplicados de la lista de facturación
  const removeDuplicatesFromInvoiceGroups = (groups: InvoiceGroup[]): InvoiceGroup[] => {
    const result: InvoiceGroup[] = [];
    const trackingNumbersSet = new Set<string>();
    const packageIdsSet = new Set<string>();
    
    // Procesar cada grupo
    groups.forEach(group => {
      const uniquePackages = group.packages.filter(pkg => {
        // Verificar si ya hemos visto este tracking o ID
        const seenTrackingBefore = trackingNumbersSet.has(pkg.trackingNumber);
        const seenIdBefore = pkg.id && packageIdsSet.has(pkg.id);
        
        if (!seenTrackingBefore && !seenIdBefore) {
          // Agregar a nuestros conjuntos
          trackingNumbersSet.add(pkg.trackingNumber);
          if (pkg.id) packageIdsSet.add(pkg.id);
          return true; // Mantener este paquete
        }
        
        console.warn('⚠️ Paquete duplicado eliminado:', pkg.trackingNumber);
        return false; // Descartar este paquete
      });
      
      // Solo agregar grupos que todavía tienen paquetes
      if (uniquePackages.length > 0) {
        const newGroup = {
          ...group,
          packages: uniquePackages,
          // Recalcular el total
          total: uniquePackages.reduce((sum, pkg) => sum + pkg.price, 0)
        };
        result.push(newGroup);
      }
    });
    
    return result;
  };
  
  // Añadir función para limpiar duplicados manualmente
  const cleanupDuplicates = () => {
    setPackagesToInvoice(prev => {
      const cleaned = removeDuplicatesFromInvoiceGroups(prev);
      return cleaned;
    });
  };
  
  // Ejecutar limpieza al inicio
  useEffect(() => {
    cleanupDuplicates();
  }, []);
  
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  
  // Calcular el total de paquetes en todas las facturas
  const totalPackages = packagesToInvoice.reduce(
    (sum, group) => sum + group.packages.length, 0
  );

  // Actualizar localStorage cuando cambie packagesToInvoice
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('packagesToInvoice', JSON.stringify(packagesToInvoice));
    }
  }, [packagesToInvoice]);

  // Verifica si un paquete ya está en la lista de facturación
  const isPackageInInvoice = (packageId: string, trackingNumber: string): boolean => {
    console.log('🔍 Verificando si el paquete ya está en la factura:', { packageId, trackingNumber });
    
    if (!packageId && !trackingNumber) {
      console.warn('⚠️ Se intentó verificar un paquete sin ID ni tracking number');
      return false;
    }
    
    const exists = packagesToInvoice.some(group => 
      group.packages.some(pkg => {
        const matchById = packageId && pkg.id === packageId;
        const matchByTracking = trackingNumber && pkg.trackingNumber === trackingNumber;
        
        if (matchById || matchByTracking) {
          console.log('✅ Paquete encontrado en la factura:', { 
            grupo: group.clientName,
            pkgId: pkg.id, 
            pkgTracking: pkg.trackingNumber,
            matchById,
            matchByTracking 
          });
        }
        
        return matchById || matchByTracking;
      })
    );
    
    console.log(exists ? '✅ El paquete ya existe en la lista' : '❌ El paquete no existe en la lista');
    
    return exists;
  };

  // Agrega un paquete a la lista de facturación
  const addPackageToInvoice = (
    packageId: string,
    trackingNumber: string,
    weight: number,
    clientId: string,
    clientName: string,
    planRate: number,
    clientDetails?: {
      photo?: string;
      email?: string;
      planName?: string;
      branchName?: string;
      shipping_insurance?: boolean | string | number;
    }
  ) => {
    console.log('🔄 Intentando agregar paquete a factura:', { 
      packageId, 
      trackingNumber,
      hasInsurance: clientDetails?.shipping_insurance,
      shippingInsuranceType: typeof clientDetails?.shipping_insurance,
      clientId,
      clientName,
      planRate
    });
    
    // Verificar si el paquete ya está en la lista usando la función existente
    if (isPackageInInvoice(packageId, trackingNumber)) {
      toast.error('Este paquete ya está en la lista de facturación');
      return;
    }
    
    // Verificación adicional de seguridad - comprobación manual
    const alreadyExists = packagesToInvoice.some(group => 
      group.packages.some(pkg => 
        (packageId && pkg.id === packageId) || 
        (trackingNumber && pkg.trackingNumber === trackingNumber)
      )
    );
    
    if (alreadyExists) {
      console.error('⚠️ Verificación adicional detectó paquete duplicado que no fue detectado por isPackageInInvoice');
      toast.error('Este paquete ya está en la lista de facturación (verificación secundaria)');
      return;
    }

    // Verificar si tiene seguro habilitado - mejorar la detección de valor booleano
    let hasInsurance = false;
    
    // Verificación explícita para diferentes tipos de valores
    if (clientDetails && 'shipping_insurance' in clientDetails) {
      if (typeof clientDetails.shipping_insurance === 'boolean') {
        hasInsurance = clientDetails.shipping_insurance;
      } else if (typeof clientDetails.shipping_insurance === 'string') {
        // Ensure TypeScript knows this is a string here
        const insuranceString = clientDetails.shipping_insurance;
        hasInsurance = insuranceString === 'true' ||
                       insuranceString === '1' ||
                       insuranceString.toLowerCase() === 'yes';
      } else if (typeof clientDetails.shipping_insurance === 'number') {
        hasInsurance = clientDetails.shipping_insurance === 1;
      }
    }
    
    const INSURANCE_PRICE = 0.99; // Precio fijo para el seguro de paquete
    
    // Calcular el precio base por peso y tarifa del plan
    const basePrice = weight * planRate;
    
    // Precio total (base + seguro si aplica)
    const totalPrice = hasInsurance ? basePrice + INSURANCE_PRICE : basePrice;
    
    console.log('💰 Cálculo de precio:', {
      basePrice,
      hasInsurance,
      insurancePrice: hasInsurance ? INSURANCE_PRICE : 0,
      totalPrice,
      hasInsuranceType: typeof hasInsurance
    });
    
    // Crear nuevo paquete
    const newPackage: InvoicePackage = {
      id: packageId,
      trackingNumber,
      weight,
      price: totalPrice,
      clientId,
      clientName,
      hasInsurance,
      insurancePrice: hasInsurance ? INSURANCE_PRICE : undefined
    };
    
    console.log('📦 Paquete creado para facturación:', {
      id: newPackage.id,
      trackingNumber: newPackage.trackingNumber,
      hasInsurance: newPackage.hasInsurance,
      hasInsuranceType: typeof newPackage.hasInsurance
    });

    setPackagesToInvoice(prev => {
      // Verificación final antes de agregar - por si acaso algo cambió entre verificaciones
      const finalCheck = prev.some(group => 
        group.packages.some(pkg => 
          (packageId && pkg.id === packageId) || 
          (trackingNumber && pkg.trackingNumber === trackingNumber)
        )
      );
      
      if (finalCheck) {
        console.warn('⚠️ Intento de agregar paquete duplicado detectado en el último momento');
        // No agregamos el paquete pero retornamos el estado actual sin cambios
        return prev;
      }
      
      // Buscar si ya existe un grupo para este cliente
      const existingGroupIndex = prev.findIndex(group => group.clientId === clientId);
      
      let updatedGroups;
      if (existingGroupIndex >= 0) {
        // Actualizar grupo existente
        updatedGroups = [...prev];
        const group = updatedGroups[existingGroupIndex];
        group.packages.push(newPackage);
        group.total = group.packages.reduce((sum, pkg) => sum + pkg.price, 0);
      } else {
        // Crear nuevo grupo
        const newGroup: InvoiceGroup = {
          clientId,
          clientName,
          planRate,
          packages: [newPackage],
          total: totalPrice,
          clientPhoto: clientDetails?.photo,
          clientEmail: clientDetails?.email,
          planName: clientDetails?.planName || 'Plan Estándar',
          branchName: clientDetails?.branchName || 'Sucursal Principal'
        };
        updatedGroups = [...prev, newGroup];
      }
      
      console.log('✅ Paquete agregado exitosamente a la factura');
      
      // Mensaje personalizado según tenga o no seguro
      const successMessage = hasInsurance 
        ? `Paquete ${trackingNumber} agregado con seguro de envío (+$${INSURANCE_PRICE})`
        : `Paquete ${trackingNumber} agregado a la lista de facturación`;
      
      toast.success(successMessage);
      
      return updatedGroups;
    });
  };

  // Elimina un paquete de la lista
  const removePackageFromInvoice = (clientId: string, packageId: string) => {
    setPackagesToInvoice(prev => {
      const updatedGroups = prev.map(group => {
        if (group.clientId === clientId) {
          const updatedPackages = group.packages.filter(pkg => pkg.id !== packageId);
          return {
            ...group,
            packages: updatedPackages,
            total: updatedPackages.reduce((sum, pkg) => sum + pkg.price, 0)
          };
        }
        return group;
      }).filter(group => group.packages.length > 0);

      return updatedGroups;
    });
  };

  // Limpia toda la lista de facturación
  const clearInvoiceList = () => {
    setPackagesToInvoice([]);
    localStorage.removeItem('packagesToInvoice');
  };

  return (
    <InvoiceContext.Provider value={{
      packagesToInvoice,
      isInvoiceModalOpen,
      setIsInvoiceModalOpen,
      addPackageToInvoice,
      removePackageFromInvoice,
      clearInvoiceList,
      isPackageInInvoice,
      totalPackages,
      cleanupDuplicates
    }}>
      {children}
    </InvoiceContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useInvoice = (): InvoiceContextType => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoice debe ser usado dentro de un InvoiceProvider');
  }
  return context;
}; 