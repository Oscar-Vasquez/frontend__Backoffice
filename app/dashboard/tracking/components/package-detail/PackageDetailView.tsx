"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, History, User, Mail, DollarSign, Building, RefreshCw, UserPlus, CreditCard, Activity, MapPin, Clock, Receipt, CheckCircle, AlertCircle, X, Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PackageDetailViewProps, ExtendedPackageData } from './types';
import { usePackageDimensions } from './usePackageDimensions';
import { usePackageWeights } from './usePackageWeights';
import { WeightStatusSection } from './WeightStatusSection';
import { DimensionsSection } from './DimensionsSection';
import { DimensionsDialog } from './DimensionsDialog';
import { WeightsDialog } from './WeightsDialog';
import { ClientSection } from './ClientSection';
import { DateInfoSection } from './DateInfoSection';
import { containerVariants, itemVariants } from './animations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useInvoice } from '@/app/contexts/InvoiceContext';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * Componente principal que muestra los detalles de un paquete
 * utilizando componentes modulares y hooks personalizados
 */
export const PackageDetailView = ({
  package: packageData,
  themeColor,
  onClientChange,
  operatorData
}: PackageDetailViewProps) => {
  // Estado para almacenar los datos completos del cliente
  const [clientData, setClientData] = useState<any>(null);
  const [isLoadingClient, setIsLoadingClient] = useState<boolean>(false);
  const [clientError, setClientError] = useState<string | null>(null);
  // Estado para controlar la carga al agregar a factura
  const [isAddingToInvoice, setIsAddingToInvoice] = useState<boolean>(false);
  
  // Usar el contexto de facturas
  const { 
    addPackageToInvoice, 
    isPackageInInvoice, 
    packagesToInvoice, 
    isInvoiceModalOpen, 
    setIsInvoiceModalOpen,
    removePackageFromInvoice,
    clearInvoiceList
  } = useInvoice();
  
  // Estado local para almacenar los datos del paquete y permitir actualizaciones
  const [localPackageData, setLocalPackageData] = useState<ExtendedPackageData | undefined>(packageData);
  
  // Actualizar el estado local cuando cambien los datos del paquete recibido por props
  useEffect(() => {
    setLocalPackageData(packageData);
  }, [packageData]);
  
  // Hook personalizado para manejar dimensiones
  const {
    dimensions,
    isEditDialogOpen,
    isUpdating,
    setIsEditDialogOpen,
    handleDimensionChange,
    handleUpdateDimensions
  } = usePackageDimensions(localPackageData);
  
  // Hook personalizado para manejar pesos con función de callback
  const {
    weights,
    isWeightDialogOpen,
    isUpdatingWeights,
    setIsWeightDialogOpen,
    handleWeightChange,
    handleUpdateWeights
  } = usePackageWeights(localPackageData);

  // Efecto para cargar los datos del cliente cuando cambia el ID
  useEffect(() => {
    if (localPackageData?.client?.id) {
      fetchClientData(localPackageData.client.id);
    }
  }, [localPackageData?.client?.id]);

  // Función para obtener los datos del cliente por ID
  const fetchClientData = async (clientId: string) => {
    try {
      setIsLoadingClient(true);
      setClientError(null);
      
      // Realizar la llamada al API para obtener todos los usuarios
      const response = await fetch(`http://localhost:3001/api/v1/users/all`);
      
      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error(`Error al cargar los datos de usuarios: ${response.status} ${response.statusText}`);
      }
      
      // Parsear la respuesta como JSON
      const allUsersData = await response.json();
      console.log('Datos de todos los usuarios obtenidos:', allUsersData);
      
      // Buscar el usuario específico por ID
      const userData = Array.isArray(allUsersData.data) 
        ? allUsersData.data.find((user: any) => user.userId === clientId || user.id === clientId)
        : Array.isArray(allUsersData) 
          ? allUsersData.find((user: any) => user.userId === clientId || user.id === clientId)
          : null;
      
      if (!userData) {
        throw new Error(`No se encontró un usuario con ID: ${clientId}`);
      }
      
      console.log('Datos del cliente encontrado:', userData);
      
      // Guardar los datos obtenidos en el estado
      setClientData(userData);
      setIsLoadingClient(false);
      
    } catch (error) {
      console.error('Error al cargar los datos del cliente:', error);
      setClientError(error instanceof Error ? error.message : 'Error desconocido');
      setIsLoadingClient(false);
    }
  };

  // Obtener los datos del cliente, priorizando los datos completos si están disponibles
  const client = clientData || localPackageData?.client;

  // Funciones auxiliares
  const formatWeight = (weight: number | string | undefined): string => {
    if (typeof weight === 'undefined') return '0';
    if (typeof weight === 'string') return weight;
    return weight.toString();
  };

  // Extraer los datos relevantes del paquete con valores por defecto usando el estado local
  const weight = formatWeight(localPackageData?.weight);
  const volumetricWeight = formatWeight(localPackageData?.volumetricWeight);
  const currentLocation = localPackageData?.status_name || 
                         localPackageData?.shippingStages[0]?.stage || 
                         'No disponible';

  // Manejador para cambiar el cliente
  const handleClientChange = (clientId: string) => {
    if (onClientChange && localPackageData?.id) {
      onClientChange(localPackageData.id);
    }
  };

  // Función para agregar paquete a la lista de facturación
  const handleAddToInvoice = async (packageId: string | undefined, trackingNumber: string | undefined) => {
    // Evitar múltiples clics
    if (isAddingToInvoice) return;
    
    console.log('Datos completos:', { 
      localPackageData,
      client,
      clientData,
      packageId,
      trackingNumber
    });
    
    if (!packageId || !trackingNumber || !localPackageData?.weight) {
      console.log('Información del paquete faltante:', { 
        packageId, 
        trackingNumber, 
        weight: localPackageData?.weight
      });
      toast.error('Información del paquete incompleta');
      return;
    }

    try {
      // Activar estado de carga
      setIsAddingToInvoice(true);
      
      // Obtener token de autenticación
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Verificar si el paquete ya está facturado
      const verifyResponse = await fetch(`http://localhost:3001/api/v1/invoices/verify-package/${trackingNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.message || 'Error al verificar el estado del paquete');
      }

      const verifyData = await verifyResponse.json();
      if (verifyData.isInvoiced) {
        toast.error(`Este paquete ya fue facturado (Factura #${verifyData.invoiceDetails?.invoice_number || 'N/A'})`);
        setIsAddingToInvoice(false);
        return;
      }

      // Intentar obtener el ID y nombre del cliente de diferentes fuentes
      const clientId = client?.id || client?.userId || localPackageData?.client?.id;
      const clientName = client?.name || 
                        `${client?.firstName || ''} ${client?.lastName || ''}`.trim() || 
                        localPackageData?.client?.name;

      console.log('Datos del cliente encontrados:', { clientId, clientName });

      if (!clientId || !clientName) {
        console.log('Información del cliente faltante:', { clientId, clientName });
        toast.error('Información del cliente incompleta');
        setIsAddingToInvoice(false);
        return;
      }
      
      // Obtener la información actualizada del cliente desde la API para asegurar datos correctos
      const clientResponse = await fetch(`http://localhost:3001/api/v1/users/${clientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!clientResponse.ok) {
        console.warn('⚠️ No se pudo obtener información actualizada del cliente desde la API');
        // Continuamos con los datos que tenemos, pero logueamos la advertencia
      }
      
      // Información del cliente desde la API (si está disponible)
      let apiClientData = null;
      try {
        apiClientData = await clientResponse.json();
        console.log('📊 Datos actualizados del cliente desde API:', apiClientData);
      } catch (error) {
        console.warn('⚠️ Error al procesar datos del cliente:', error);
      }
      
      // Consultar directamente a la base de datos para verificar el valor de shipping_insurance
      let dbShippingInsuranceValue = null;
      try {
        // Endpoint específico que consulta directamente a la base de datos
        const dbCheckResponse = await fetch(`http://localhost:3001/api/v1/users/db-check/${clientId}/shipping-insurance`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (dbCheckResponse.ok) {
          const dbData = await dbCheckResponse.json();
          console.log('🔍 Valor de shipping_insurance directo de la base de datos:', dbData);
          
          if (dbData && typeof dbData.shipping_insurance !== 'undefined') {
            dbShippingInsuranceValue = dbData.shipping_insurance;
            console.log('✅ Valor de shipping_insurance obtenido directamente de la base de datos:', dbShippingInsuranceValue);
          }
        } else {
          console.warn('⚠️ No se pudo verificar el valor de shipping_insurance en la base de datos');
        }
      } catch (error) {
        console.warn('⚠️ Error al consultar el valor de shipping_insurance en la base de datos:', error);
      }

      // Obtener la tarifa del plan del cliente de diferentes fuentes posibles
      const planRate = Number(
        client?.planRate || 
        client?.plan?.rate || 
        client?.subscriptionDetails?.price || 
        localPackageData?.client?.planRate || 
        apiClientData?.planRate ||
        0
      );

      console.log('Tarifa encontrada:', { planRate });

      if (!planRate) {
        console.log('Tarifa no encontrada para el cliente:', client);
        toast.error('No se encontró la tarifa del plan del cliente');
        setIsAddingToInvoice(false);
        return;
      }

      const weight = Number(localPackageData.weight);
      
      // Determinar si el cliente tiene seguro habilitado
      // Priorizar la información obtenida directamente de la base de datos
      let hasInsurance = false;
      
      // Primero intentamos usar el valor directo de la base de datos, que será el más confiable
      if (dbShippingInsuranceValue !== null) {
        console.log('🔍 Usando información de seguro directamente de la base de datos:', dbShippingInsuranceValue);
        
        if (typeof dbShippingInsuranceValue === 'boolean') {
          hasInsurance = dbShippingInsuranceValue;
        } else if (typeof dbShippingInsuranceValue === 'string') {
          hasInsurance = dbShippingInsuranceValue.toLowerCase() === 'true' || 
                          dbShippingInsuranceValue === '1' || 
                          dbShippingInsuranceValue.toLowerCase() === 'yes';
        } else if (typeof dbShippingInsuranceValue === 'number') {
          hasInsurance = dbShippingInsuranceValue === 1;
        }
      }
      // Si no tenemos el valor directo de la base de datos, intentamos usar la información de la API
      else if (apiClientData && apiClientData.shipping_insurance !== undefined) {
        console.log('🔍 Usando información de seguro desde API:', apiClientData.shipping_insurance);
        
        if (typeof apiClientData.shipping_insurance === 'boolean') {
          hasInsurance = apiClientData.shipping_insurance;
        } else if (typeof apiClientData.shipping_insurance === 'string') {
          hasInsurance = apiClientData.shipping_insurance.toLowerCase() === 'true' || 
                          apiClientData.shipping_insurance === '1' || 
                          apiClientData.shipping_insurance.toLowerCase() === 'yes';
        } else if (typeof apiClientData.shipping_insurance === 'number') {
          hasInsurance = apiClientData.shipping_insurance === 1;
        }
      } else {
        // Si no tenemos datos de la base de datos ni de la API, usar la información que tenemos disponible localmente
        console.log('🔍 Base de datos y API no disponibles, usando información de seguro local');
        const clientInsurance = client?.shipping_insurance !== undefined ? client.shipping_insurance : 
                                (localPackageData?.client?.shipping_insurance !== undefined ? localPackageData.client.shipping_insurance : undefined);
        
        console.log('Información de seguro encontrada localmente:', { 
          clientInsurance,
          type: typeof clientInsurance
        });
        
        // Convertir a booleano según el tipo de dato
        if (typeof clientInsurance === 'boolean') {
          hasInsurance = clientInsurance;
        } else if (typeof clientInsurance === 'string') {
          hasInsurance = clientInsurance.toLowerCase() === 'true' || clientInsurance === '1' || clientInsurance.toLowerCase() === 'yes';
        } else if (typeof clientInsurance === 'number') {
          hasInsurance = clientInsurance === 1;
        }
      }
      
      console.log('Estado final de seguro:', { hasInsurance });

      // Usar el contexto para agregar el paquete
      addPackageToInvoice(
        packageId,
        trackingNumber,
        weight,
        clientId,
        clientName,
        planRate,
        {
          photo: client?.photo || client?.avatar || client?.image || client?.profilePic || client?.picture,
          email: client?.email || client?.correo,
          planName: client?.planName || client?.subscriptionDetails?.planName || client?.plan?.name || 'Plan Estándar',
          branchName: client?.branchName || client?.branchDetails?.name || client?.branch?.name || 'Sucursal Principal',
          shipping_insurance: hasInsurance // Añadimos la información del seguro
        }
      );

      // Mostrar el modal después de agregar el paquete
      setIsInvoiceModalOpen(true);
      
      // Mensaje de éxito personalizado según tenga o no seguro
      if (hasInsurance) {
        toast.success('Paquete agregado a la lista de facturación con seguro de envío');
      } else {
        toast.success('Paquete agregado a la lista de facturación');
      }

    } catch (error) {
      console.error('Error al agregar paquete:', error);
      toast.error(error instanceof Error ? error.message : 'Error al agregar el paquete');
    } finally {
      // Desactivar estado de carga cuando termine
      setIsAddingToInvoice(false);
    }
  };

  // Agregar este nuevo estado para controlar la animación
  const [isCreatingInvoices, setIsCreatingInvoices] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [finishedGroups, setFinishedGroups] = useState<string[]>([]);

  // Función para crear facturas masivamente
  const handleCreateInvoices = async () => {
    try {
      // Iniciar la animación
      setIsCreatingInvoices(true);
      setCreationProgress(0);
      setFinishedGroups([]);
      
      toast.info('Creando facturas...', {
        description: 'Preparando datos para facturación'
      });

      // Obtener el token de autenticación
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('workexpress_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      // Crear una factura por cada grupo de cliente, mostrando progreso
      const totalGroups = packagesToInvoice.length;
      
      const results = await Promise.all(packagesToInvoice.map(async (group, index) => {
        try {
          // Actualizar el progreso antes de procesar cada grupo
          const currentProgress = Math.round(((index) / totalGroups) * 100);
          setCreationProgress(currentProgress);
          
          toast.info(`Procesando factura ${index + 1} de ${totalGroups}`, {
            id: 'invoice-progress',
            description: `Cliente: ${group.clientName} (${group.packages.length} paquetes)`
          });
          
          // Generar número de factura único
          const invoice_number = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          // Extraer la información de seguro directamente de los paquetes
          // Los paquetes del mismo cliente deberían tener el mismo estado de seguro
          const firstPackage = group.packages[0];
          const hasShippingInsurance = firstPackage && 
                                      typeof firstPackage.hasInsurance !== 'undefined' 
                                      ? firstPackage.hasInsurance 
                                      : false;
          
          // Obtener el precio del plan del cliente desde los detalles del cliente si existen
          let planPrice = group.planRate;
          
          // Si tenemos datos del cliente actual y ese cliente coincide con el grupo que estamos procesando
          if (client && client.id === group.clientId && client.subscriptionPlan && client.subscriptionPlan.price) {
            // Usar el precio del plan directamente de los datos del cliente
            console.log('Usando precio del plan desde cliente:', {
              clientId: client.id,
              planId: client.subscriptionPlan.id,
              planPrice: client.subscriptionPlan.price,
              originalPlanRate: group.planRate
            });
            planPrice = parseFloat(client.subscriptionPlan.price);
          }
          
          console.log('Datos de seguro y plan para factura:', {
            clientId: group.clientId,
            clientName: group.clientName,
            hasShippingInsurance,
            planPrice,
            originalRate: group.planRate
          });
          
          // Asegurarnos de que el planPrice sea un número válido
          if (isNaN(planPrice) || planPrice <= 0) {
            console.warn('Precio del plan inválido, usando valor predeterminado:', planPrice);
            planPrice = group.planRate; // Usar el valor de grupo como fallback
            if (isNaN(planPrice) || planPrice <= 0) {
              planPrice = 0; // Valor por defecto si todo falla
            }
          }
          
          // Asegurarnos de que shipping_insurance sea un booleano explícito
          const shippingInsurance = hasShippingInsurance === true;
          
          // Realizar operaciones de parseo y validación para cada campo antes de construir el objeto
          let validPlanPrice = 0;
          try {
            // Intentar convertir a número y verificar que sea válido
            validPlanPrice = Number(planPrice);
            if (isNaN(validPlanPrice) || validPlanPrice < 0) {
              validPlanPrice = 0; // Valor por defecto si es inválido
            }
          } catch (e) {
            console.warn('Error al convertir price_plan:', e);
            validPlanPrice = 0;
          }
          
          // Convertir shipping_insurance a booleano explícito
          const validShippingInsurance = shippingInsurance === true;
          
          // Formato del customer_id según la validación del backend (alfanumérico sin guiones)
          let formattedCustomerId = group.clientId.replace(/[^a-zA-Z0-9]/g, '');
          
          // Preparar los datos para la factura según el DTO esperado
          const invoiceData = {
            invoice_number,
            customer_id: formattedCustomerId,
            issue_date: new Date().toISOString(),
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
            status: "sent", // Cambiado de "PENDING" a "sent" para coincidir con el enum en backend
            total_amount: parseFloat(group.total.toFixed(2)),
            // Forzar conversión explícita de tipos para price_plan y shipping_insurance
            price_plan: validPlanPrice,
            shipping_insurance: validShippingInsurance,
            invoice_items: group.packages.map(pkg => ({
              name: `Package - ${pkg.trackingNumber}`,
              description: `Weight: ${pkg.weight}lb, Rate: $${validPlanPrice}`,
              quantity: 1,
              price: parseFloat(pkg.price.toFixed(2))
            }))
          };

          // Log adicional para verificar la estructura final de los datos
          console.log('📤 Estructura final de datos a enviar:', JSON.stringify(invoiceData, null, 2));
          console.log('✅ Campos críticos:', {
            price_plan: invoiceData.price_plan,
            shipping_insurance: invoiceData.shipping_insurance,
            price_plan_type: typeof invoiceData.price_plan,
            shipping_insurance_type: typeof invoiceData.shipping_insurance
          });

          // Convertir el objeto a una cadena JSON y luego analizarlo de nuevo para asegurarnos de que la estructura sea correcta
          const serializedData = JSON.stringify(invoiceData);
          console.log('🔄 Datos serializados:', serializedData);
          const parsedData = JSON.parse(serializedData);
          console.log('🔍 Verificación de tipos después de serializar/deserializar:', {
            price_plan: parsedData.price_plan,
            price_plan_type: typeof parsedData.price_plan,
            shipping_insurance: parsedData.shipping_insurance,
            shipping_insurance_type: typeof parsedData.shipping_insurance
          });
          
          // Realizar una llamada de prueba al endpoint de depuración para verificar cómo se están recibiendo los datos
          try {
            console.log('🧪 Enviando datos de prueba al endpoint de depuración...');
            const debugResponse = await fetch('http://localhost:3001/api/v1/invoices/debug', {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              credentials: 'include',
              body: serializedData
            });
            
            if (debugResponse.ok) {
              const debugResult = await debugResponse.json();
              console.log('🧪 Resultado de depuración:', debugResult);
            } else {
              console.error('❌ Error en la prueba de depuración:', await debugResponse.text());
            }
          } catch (debugError) {
            console.error('❌ Error al realizar la prueba de depuración:', debugError);
          }
          
          // Realizar la petición al backend con configuración explícita para JSON
          const response = await fetch('http://localhost:3001/api/v1/invoices', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: serializedData
          });

          // Log adicional para verificar lo que estamos enviando realmente
          console.log('📤 Cuerpo de la petición enviada:', serializedData);

          if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            toast.error(`Error al crear factura para ${group.clientName}`, {
              description: errorData.message || response.statusText
            });
            throw new Error(`Error al crear factura para ${group.clientName}: ${errorData.message || response.statusText}`);
          }

          const data = await response.json();
          console.log('Factura creada:', data);
          
          // Añadir el cliente completado a la lista
          setFinishedGroups(prev => [...prev, group.clientName]);
          
          // Actualizar el progreso después de procesar el grupo
          const newProgress = Math.round(((index + 1) / totalGroups) * 100);
          setCreationProgress(newProgress);
          
          toast.success(`Factura creada para ${group.clientName}`, {
            id: `success-${group.clientId}`,
            description: `Total: $${parseFloat(group.total.toFixed(2))}`
          });
          
          // Simular un pequeño retraso para que la animación sea visible
          await new Promise(resolve => setTimeout(resolve, 300));
          
          return data;
        } catch (groupError) {
          console.error(`Error al procesar grupo de ${group.clientName}:`, groupError);
          return null;
        }
      }));

      // Filtrar resultados nulos (facturas que fallaron)
      const successfulResults = results.filter(result => result !== null);
      
      console.log('Todas las facturas creadas:', successfulResults);

      // Finalizar con progreso 100%
      setCreationProgress(100);
      
      // Mostrar mensaje final de éxito
      if (successfulResults.length === packagesToInvoice.length) {
        toast.success(`¡Proceso completado!`, {
          description: `Se crearon ${successfulResults.length} facturas exitosamente`
        });
      } else if (successfulResults.length > 0) {
        toast.info(`Proceso completado parcialmente`, {
          description: `Se crearon ${successfulResults.length} de ${packagesToInvoice.length} facturas`
        });
      } else {
        toast.error(`No se pudo crear ninguna factura`, {
          description: `Por favor, revise los errores e intente nuevamente`
        });
      }

      // Pequeño retraso antes de resetear estados
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Limpiar la lista de paquetes y cerrar el modal
      clearInvoiceList();
      setIsInvoiceModalOpen(false);

    } catch (error) {
      console.error('Error al crear facturas:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear las facturas');
    } finally {
      // Desactivar la animación cuando termine (éxito o error)
      setIsCreatingInvoices(false);
      setCreationProgress(0);
      setFinishedGroups([]);
    }
  };

  // Manejador para actualizar las dimensiones y actualizar el estado local
  const handleDimensionsUpdate = async () => {
    const updatedData = await handleUpdateDimensions();
    if (updatedData && updatedData.success && updatedData.data) {
      // Actualizar el estado local con los datos actualizados
      setLocalPackageData((prev: ExtendedPackageData | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          length: updatedData.data.length,
          width: updatedData.data.width,
          height: updatedData.data.height
        };
      });
      
      toast.success('Vista actualizada con las nuevas dimensiones', {
        description: 'Los cambios se han aplicado correctamente'
      });
    }
  };

  // Manejador para actualizar los pesos y actualizar el estado local
  const handleWeightsUpdate = async () => {
    const updatedData = await handleUpdateWeights();
    if (updatedData && updatedData.success && updatedData.data) {
      // Actualizar el estado local con los datos actualizados
      setLocalPackageData((prev: ExtendedPackageData | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          weight: updatedData.data.weight,
          volumetricWeight: updatedData.data.volumetric_weight
        };
      });
      
      toast.success('Vista actualizada con los nuevos pesos', {
        description: 'Los cambios se han aplicado correctamente'
      });
    }
  };

  const renderHistorySection = () => {
    // Agregar logs detallados del operador
    console.warn('🚨 DATOS DEL OPERADOR:', {
      operatorData,
      branchDetails: operatorData?.branchDetails,
      branchName: operatorData?.branchDetails?.name,
      id: operatorData?.id,
      branchReference: operatorData?.branchReference
    });

    // Agregar logs de las etapas
    console.warn('🚨 DATOS DE LAS ETAPAS:', {
      stages: localPackageData?.shippingStages,
      currentStage: localPackageData?.shippingStages?.[0],
      previousStage: localPackageData?.shippingStages?.[1],
      currentLocation: localPackageData?.shippingStages?.[0]?.location,
      previousLocation: localPackageData?.shippingStages?.[1]?.location
    });

    // Formatear las fechas del paquete
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    // Crear las etapas del envío
    const currentStage = {
      location: operatorData?.branchDetails?.name || 'Sucursal no especificada',
      stage: 'Panama',
      status: '8',
      updatedTimestamp: localPackageData?.updatedAt || new Date().toISOString()
    };

    const previousStage = localPackageData?.shippingStages?.[0] || {
      location: 'Miami Warehouse 1',
      stage: 'Miami',
      status: '8',
      updatedTimestamp: localPackageData?.createdAt || new Date().toISOString()
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Historial de Envío</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="h-4 w-4" />
            <span>Actividad reciente</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-blue-200 dark:bg-blue-800/50"></div>
          
          <div className="space-y-6">
            {/* Estado actual - En sucursal */}
            <div className="relative pl-10">
              <div className="absolute left-0 top-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <MapPin className="h-3 w-3 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">En Sucursal</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {currentStage.location}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                    Actual
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {formatDate(currentStage.updatedTimestamp)}
                </div>
              </div>
            </div>

            {/* Estado anterior - Miami */}
            <div className="relative pl-10">
              <div className="absolute left-0 top-2 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                <MapPin className="h-3 w-3 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">En Miami</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {previousStage.location}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700">
                    Completado
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {formatDate(previousStage.updatedTimestamp)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Genera un código de casillero basado en el tracking number (replica la lógica del backend)
  const generarCodigoCasillero = (tracking: string): string => {
    // Extraer solo los números del tracking
    const numeros = tracking.replace(/\D/g, "");
    
    if (numeros.length < 2) {
      return "0A"; // Valor por defecto si no hay suficientes números
    }
    
    // Tomar el penúltimo dígito
    const penultimoDigito = numeros[numeros.length - 2];
    
    // Tomar el último dígito y convertirlo en una letra
    const ultimoDigito = parseInt(numeros[numeros.length - 1], 10);
    
    let letra = "C"; // Por defecto, 6-7-8-9 → C
    if (ultimoDigito <= 2) letra = "A"; // 0-1-2 → A
    else if (ultimoDigito <= 5) letra = "B"; // 3-4-5 → B
    
    // Retornar el código de casillero
    return `${penultimoDigito}${letra}`;
  };

  return (
    <>
      {/* Modal de lista de facturación - Eliminado para evitar duplicación */}
      {/* Este diálogo ha sido eliminado porque ya existe en TrackingSearch.tsx
         y estaba causando una superposición al abrirse ambos diálogos simultáneamente */}

      {/* Encabezado de la tarjeta contenedora */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className={cn(
            "text-2xl md:text-3xl font-bold",
            "bg-clip-text text-transparent",
            "bg-gradient-to-r from-gray-900 to-gray-700",
            "dark:from-gray-100 dark:to-gray-300"
          )}>
            Detalle del Paquete
          </h1>
          <p className={cn(
            "text-gray-500 dark:text-gray-400 mt-2",
            "flex items-center gap-2"
          )}>
            <Package className="h-4 w-4" />
            {localPackageData?.trackingNumber ? (
              <span className="font-medium">#{localPackageData.trackingNumber}</span>
            ) : (
              'Sin número de seguimiento'
            )}
          </p>
        </div>
        
        {client && (
          <>
            {!isPackageInInvoice(localPackageData?.id || '', localPackageData?.trackingNumber || '') && (
              <motion.div
                whileHover={{ scale: isAddingToInvoice ? 1 : 1.03 }}
                whileTap={{ scale: isAddingToInvoice ? 1 : 0.97 }}
              >
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAddToInvoice(localPackageData?.id, localPackageData?.trackingNumber)}
                  className="h-9 bg-primary/90 hover:bg-primary"
                  disabled={isAddingToInvoice}
                >
                  {isAddingToInvoice ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs">Procesando...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="h-3.5 w-3.5 mr-1.5" />
                      <span className="text-xs">Añadir a factura</span>
                    </>
                  )}
                </Button>
              </motion.div>
            )}
            
            {isPackageInInvoice(localPackageData?.id || '', localPackageData?.trackingNumber || '') && (
              <Badge variant="outline" className="h-9 bg-primary/5 text-primary border-primary/20 px-3 py-1.5 flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                En lista de facturación
              </Badge>
            )}
          </>
        )}
      </div>

      {/* Tabs para separar contenido */}
      <Tabs defaultValue="detalles" className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="detalles" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span>Detalles</span>
          </TabsTrigger>
          <TabsTrigger value="historial" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Historial</span>
          </TabsTrigger>
          <TabsTrigger value="cliente" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Cliente</span>
          </TabsTrigger>
        </TabsList>

        {/* Contenido de la tab de Detalles */}
        <TabsContent value="detalles" className="flex flex-col gap-8 w-full">
          {/* Sección de peso y estado */}
          <WeightStatusSection 
            weight={weight} 
            volumetricWeight={volumetricWeight}
            currentLocation={currentLocation}
            operatorData={operatorData}
            onEditWeightsClick={() => setIsWeightDialogOpen(true)}
          />

          {/* Sección de dimensiones */}
          <DimensionsSection
            length={localPackageData?.length || 0}
            width={localPackageData?.width || 0}
            height={localPackageData?.height || 0}
            onEditClick={() => setIsEditDialogOpen(true)}
          />
          
          {/* Sección de posición del paquete */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn(
              "w-[90%] mx-auto relative",
              "bg-gradient-to-br from-white/95 via-white/90 to-white/80",
              "dark:from-slate-900/95 dark:via-slate-900/90 dark:to-slate-800/80",
              "backdrop-blur-2xl",
              "border border-white/20 dark:border-slate-700/30",
              "shadow-[0_10px_50px_rgba(0,0,0,0.04)]",
              "dark:shadow-[0_10px_50px_rgba(0,0,0,0.2)]",
              "rounded-[2.5rem] p-8",
              "transition-all duration-500 ease-out",
              "overflow-hidden"
            )}
          >
            {/* Decorative elements */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-green-500/10 to-emerald-500/5 dark:from-green-500/20 dark:to-emerald-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-green-500/5 dark:from-emerald-500/20 dark:to-green-500/10 rounded-full blur-3xl"></div>

            {/* Encabezado de la sección de posición */}
            <div className="flex justify-between items-start mb-8">
              <motion.div 
                variants={itemVariants}
                className="flex items-center gap-5"
              >
                <motion.div 
                  whileHover={{ rotate: [0, -5, 5, -5, 5, 0], scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className={cn(
                    "p-4 rounded-2xl",
                    "bg-gradient-to-br from-green-100/90 via-emerald-50 to-green-50/80",
                    "dark:from-green-800/40 dark:via-emerald-900/30 dark:to-green-900/20",
                    "shadow-inner shadow-green-100/40 dark:shadow-green-900/10",
                    "border border-green-100/70 dark:border-green-800/20",
                    "relative overflow-hidden"
                  )}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      opacity: [0, 0.5, 0]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "linear",
                      times: [0, 0.5, 1]
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10"
                  />
                  <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" strokeWidth={2} />
                </motion.div>
                
                <div>
                  <motion.h2 
                    className={cn(
                      "text-2xl font-semibold mb-1",
                      "text-gray-900 dark:text-white"
                    )}
                    whileHover={{ scale: 1.02 }}
                  >
                    Posición del Paquete
                  </motion.h2>
                  <p className="text-gray-700 dark:text-gray-300 text-sm font-light">
                    Ubicación exacta en el almacén
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Visualización de la posición */}
            <motion.div 
              variants={itemVariants} 
              className="flex flex-col items-center justify-center p-8"
            >
              <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-2xl border border-green-100 dark:border-green-800/30 shadow-inner flex items-center justify-center mb-4 w-full">
                <div className="text-center">
                  <span className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {localPackageData?.position || (localPackageData?.trackingNumber ? generarCodigoCasillero(localPackageData.trackingNumber) : 'No asignada')}
                  </span>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                    Código de casillero
                  </p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Esta posición es generada automáticamente y se utiliza para organizar los paquetes en el almacén.
              </p>
            </motion.div>
          </motion.div>
          
          {/* Sección de fechas */}
          <DateInfoSection 
            createdAt={localPackageData?.createdAt}
            updatedAt={localPackageData?.updatedAt || localPackageData?.lastUpdated}
          />
        </TabsContent>

        {/* Contenido de la tab de Historial */}
        <TabsContent value="historial" className="flex flex-col gap-8 w-full">
          {renderHistorySection()}
        </TabsContent>

        {/* Contenido de la tab de Cliente */}
        <TabsContent value="cliente" className="flex flex-col gap-8 w-full">
          {/* Sección de cliente asignado */}
          <ClientSection 
            client={localPackageData?.client} 
            onClientChange={onClientChange ? handleClientChange : undefined}
            packageData={localPackageData}
          />
          
          {/* Información adicional del cliente si está disponible */}
          {localPackageData?.client && (
            <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-lg font-medium mb-4">Información de Contacto</h3>
              <div className="space-y-3">
                {localPackageData.client.email && (
                  <p className="text-sm">
                    <span className="font-medium">Email:</span> {localPackageData.client.email}
                  </p>
                )}
                <p className="text-sm">
                  <span className="font-medium">ID Cliente:</span> {localPackageData.client.id}
                </p>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo de edición de dimensiones */}
      <DimensionsDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        dimensions={dimensions}
        isUpdating={isUpdating}
        onDimensionChange={handleDimensionChange}
        onSubmit={handleDimensionsUpdate}
      />
      
      {/* Diálogo de edición de pesos */}
      <WeightsDialog
        isOpen={isWeightDialogOpen}
        onOpenChange={setIsWeightDialogOpen}
        weights={weights}
        isUpdating={isUpdatingWeights}
        onWeightChange={handleWeightChange}
        onSubmit={handleWeightsUpdate}
      />

      {/* Agregar este JSX en la parte donde se muestra el botón de crear facturas */}
      {packagesToInvoice.length > 0 && (
        <div className="mt-4">
          {isCreatingInvoices ? (
            <div className="space-y-4">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 rounded-full"
                  style={{ width: `${creationProgress}%` }}
                />
              </div>
              
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Procesando facturas...</span>
                <span>{creationProgress}%</span>
              </div>
              
              {finishedGroups.length > 0 && (
                <div className="mt-2 p-2 bg-background/50 rounded border border-border/20">
                  <p className="text-xs text-muted-foreground mb-1">Facturas completadas:</p>
                  <div className="space-y-1 max-h-20 overflow-y-auto">
                    {finishedGroups.map((clientName, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <span className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                          </svg>
                        </span>
                        <span>{clientName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={handleCreateInvoices}
              className="w-full"
              disabled={isCreatingInvoices}
            >
              <FileText className="mr-2 h-4 w-4" />
              Crear {packagesToInvoice.length} factura{packagesToInvoice.length !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
      )}
    </>
  );
}; 