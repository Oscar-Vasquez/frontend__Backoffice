// Tipos para tu API de tracking
export interface TrackingAPIResponse {
  success: boolean;
  message: string;
  note: string;
  data: {
    hash: string;
    client_id: number;
    client_name: string;
    package_name: string;
    receipt: string;
    tracking: string;
    mode: string;
    shipper: string;
    total_items: string;
    unit: string;
    total_weight: string;
    vol_weight: string;
    cargo_length: string;
    cargo_width: string;
    cargo_height: string;
    total_cft: string;
    is_communal: string;
    status: string;
    status_name: string;
    datecreated: string;
    dateupdated: string;
  }[];
}

// Tipos para la API de Parcel
export interface ParcelAPIResponse {
  tracking_number: string;
  carrier_code: string;
  carrier_name: string;
  status: string;
  estimated_delivery: string;
  delivery_date?: string;
  origin_info: {
    courier_code: string;
    courier_name: string;
    location: string;
    country: string;
    state: string;
    city: string;
    postal_code: string;
    departed_at: string;
  };
  destination_info: {
    courier_code: string;
    courier_name: string;
    location: string;
    country: string;
    state: string;
    city: string;
    postal_code: string;
    delivered_at?: string;
  };
  service_type: string;
  package_info: {
    weight: string;
    size: string;
    pieces: number;
    declared_value?: number;
    currency?: string;
  };
  tracking_history: {
    status_date: string;
    status: string;
    status_details: string;
    location: string;
    checkpoint_delivery_status: string;
    checkpoint_delivery_substatus: string;
    tracking_number: string;
  }[];
  customs_info?: {
    clearance_date?: string;
    clearance_status?: string;
    clearance_type?: string;
    customs_number?: string;
    duties_amount?: number;
    duties_currency?: string;
  };
  shipping_info?: {
    service_level: string;
    shipping_method: string;
    shipping_date: string;
    pickup_date?: string;
    delivery_attempts?: number;
    pickup_location?: string;
  };
  additional_info?: {
    signed_by?: string;
    order_number?: string;
    reference_number?: string;
    comments?: string[];
  };
}

// Tipo combinado para usar en el componente
export interface CombinedTrackingInfo {
  // Datos básicos
  tracking: string;
  status: string;
  statusName: string;
  
  // Información del paquete
  package_info: {
    total_weight: string;
    vol_weight: string;
    dimensions: {
      length: string;
      width: string;
      height: string;
      unit: string;
    };
    pieces: number;
    declared_value?: number;
    currency?: string;
  };
  
  // Información de envío
  shipping: {
    mode: string;
    carrier: string;
    service_type: string;
    estimated_delivery: string;
    origin: {
      city: string;
      state: string;
      country: string;
      postal_code: string;
      departed_at: string;
    };
    destination: {
      city: string;
      state: string;
      country: string;
      postal_code: string;
      delivered_at?: string;
    };
  };

  // Información del destinatario
  consignee?: {
    fullName: string;
    id: string;
  };

  // Información de origen y destino
  origin?: {
    name: string;
    shortName: string;
  };
  destination?: string;
  
  // Información de aduanas
  customs?: {
    clearance_date?: string;
    clearance_status?: string;
    customs_number?: string;
    duties_amount?: number;
    duties_currency?: string;
  };
  
  // Historial de tracking
  tracking_history: {
    date: string;
    status: string;
    details: string;
    location: string;
    substatus?: string;
  }[];
  
  // Metadatos
  created_at: string;
  updated_at: string;

  // Información adicional
  additionalInfo?: {
    totalPieces?: string;
    totalCFT?: string;
    isCommunal?: boolean;
    receipt?: string;
    photo?: string;
    hash?: string;
    other?: string;
    order_number?: string;
    reference_number?: string;
    comments?: string[];
  };
} 