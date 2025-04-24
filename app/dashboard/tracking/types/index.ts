/**
 * Interfaces y tipos para el módulo de tracking
 */

export interface ShippingStage {
  location: string;
  photo: string;
  stage: string;
  status: string;
  updatedTimestamp: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  planRate: number;
  photo?: string;
  planName?: string;
  branchName?: string;
  shipping_insurance?: boolean | string | number;
  subscriptionDetails?: {
    planName: string;
    price?: string;
  };
}

export interface TrackingInfo {
  id?: string;
  packageId?: string;
  trackingNumber: string;
  packageStatus: string;
  status_name?: string;
  weight: number;
  volumetricWeight: number;
  length: number;
  width: number;
  height: number;
  insurance: boolean;
  shippingStages: ShippingStage[];
  userReference?: string;
  createdAt?: string;
  client?: Client;
  position?: string;
}

export interface ExtendedTrackingInfo extends TrackingInfo {
  // Campos adicionales específicos para la vista extendida
  estimatedDeliveryDate?: string;
  lastUpdated?: string;
  notes?: string;
  declaredValue?: number; // Valor declarado del paquete
  origin?: string;
  destination?: string;
}

export interface SelectableItem {
  id: string;
  name: string;
}

export interface TrackingAPIResponse {
  success: boolean;
  message?: string;
  data?: TrackingInfo | TrackingInfo[];
  error?: string;
}

export interface CombinedTrackingInfo extends ExtendedTrackingInfo {
  // Campos adicionales que combinan información de múltiples fuentes
  externalStatus?: string;
  externalCarrier?: string;
  consolidatedHistory?: ShippingStage[];
} 