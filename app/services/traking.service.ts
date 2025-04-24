const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error('❌ NEXT_PUBLIC_API_URL no está definida en las variables de entorno');
}

// Mapa de estados
const STATUS_MAP: { [key: string]: string } = {
  '1': 'MIAMI',
  '2': 'TRANSITO',
  '3': 'PTY',
  '4': 'FACTURADO',
  '5': 'DESCONOCIDO',
  '6': 'DESCONOCIDO',
  '7': 'MIAMI',
  '8': 'FACTURADO'
};

export const TrackingService = {
  async getTrackingInfo(trackingNumber: string) {
    try {
      if (!API_URL) {
        throw new Error('URL del API no configurada');
      }

      // Intentamos con el tracking externo primero
      const externalUrl = new URL(`${API_URL}/cargo/external-tracking/${trackingNumber}`);
      console.log('==================================');
      console.log('🌐 Intentando tracking externo');
      console.log('🔍 URL externa:', externalUrl.toString());

      const externalResponse = await fetch(externalUrl.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        cache: 'no-cache'
      });

      if (!externalResponse.ok) {
        const errorText = await externalResponse.text();
        console.error('❌ Error en tracking externo:', errorText);
        throw new Error(`No se encontró el paquete en el sistema`);
      }

      const externalData = await externalResponse.json();
      console.log('✅ Datos externos recibidos:', externalData);
      
      // Logs adicionales para debugging
      const statusCode = externalData.status?.toString() || '';
      console.log('🔍 Status original:', externalData.status);
      console.log('🔍 Status code convertido:', statusCode);
      console.log('🔍 STATUS_MAP:', STATUS_MAP);
      const mappedStatus = STATUS_MAP[statusCode];
      console.log('🔍 Status mapeado final:', mappedStatus);

      // Transformar los datos externos al formato esperado
      const transformedData = {
        success: true,
        data: {
          tracking: externalData.tracking,
          status: statusCode,
          statusName: mappedStatus || 'DESCONOCIDO',
          totalWeight: externalData.total_weight,
          volWeight: externalData.vol_weight,
          dimensions: {
            length: externalData.cargo_length,
            width: externalData.cargo_width,
            height: externalData.cargo_height,
            unit: externalData.unit
          },
          shipping: {
            mode: externalData.mode_name || 'N/A',
            carrier: externalData.shipper || 'WORKEXPRESS',
            service_type: 'Standard',
            estimated_delivery: externalData.datecreated,
            origin: {
              city: 'Miami',
              state: 'FL',
              country: 'USA',
              postal_code: '33102',
              departed_at: externalData.datecreated
            },
            destination: {
              city: externalData.destination || 'N/A',
              state: 'N/A',
              country: 'N/A',
              postal_code: 'N/A',
              delivered_at: undefined
            }
          },
          mode: externalData.mode_name,
          shipper: externalData.shipper || 'WORKEXPRESS',
          totalItems: externalData.total_items,
          dateCreated: externalData.datecreated,
          dateUpdated: externalData.datecreated,
          // Campos adicionales
          consignee: {
            fullName: externalData.consignee_fullname,
            id: externalData.consignee_id
          },
          origin: {
            name: externalData.origin_name,
            shortName: externalData.origin_shortname
          },
          destination: externalData.destination,
          additionalInfo: {
            totalPieces: externalData.total_pcs,
            totalCFT: externalData.total_cft,
            isCommunal: externalData.is_communal === 'true',
            receipt: externalData.receipt,
            photo: externalData.photo,
            hash: externalData.hash,
            other: externalData.other
          }
        }
      };

      console.log('🔄 Datos transformados:', JSON.stringify(transformedData, null, 2));
      
      return transformedData;
    } catch (error: unknown) {
      console.error('❌ Error detallado:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      throw error;
    }
  },

  async getAllPackages() {
    try {
      const response = await fetch(`${API_URL}/api/v1/cargo/packages`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al obtener paquetes');
      return await response.json();
    } catch (error: unknown) {
      console.error('Error en getAllPackages:', error instanceof Error ? error.message : error);
      throw error;
    }
  }
};