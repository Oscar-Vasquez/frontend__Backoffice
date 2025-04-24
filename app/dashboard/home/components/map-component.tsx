"use client";

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corregir el problema de los íconos de Leaflet en Next.js
const getIcon = (type: 'air' | 'sea') => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg">
            ${type === 'air' 
              ? '<svg class="text-blue-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path></svg>'
              : '<svg class="text-cyan-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2z"></path><path d="M12 16v4"></path><path d="M8 20h8"></path></svg>'
            }</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

interface Shipment {
  id: string;
  type: 'air' | 'sea';
  position: [number, number];
  origin: string;
  destination: string;
  status: string;
}

interface MapComponentProps {
  shipments: Shipment[];
}

function MapComponent({ shipments }: MapComponentProps) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Inicializar el mapa cuando el componente se monta
    if (mapRef.current) {
      const map = L.map(mapRef.current).setView([20.5937, -78.9629], 5);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Agregar marcadores
      shipments.forEach((shipment) => {
        const marker = L.marker(shipment.position, { icon: getIcon(shipment.type) })
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${shipment.type === 'air' ? 'Envío Aéreo' : 'Envío Marítimo'}</h3>
              <p class="text-sm">Origen: ${shipment.origin}</p>
              <p class="text-sm">Destino: ${shipment.destination}</p>
              <p class="text-sm">Estado: ${shipment.status}</p>
            </div>
          `);
        marker.addTo(map);
      });

      // Limpiar el mapa cuando el componente se desmonta
      return () => {
        map.remove();
      };
    }
  }, [shipments]);

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div 
      ref={mapRef}
      style={{ height: '100%', width: '100%', position: 'relative' }}
      className="rounded-lg"
    />
  );
}

export default MapComponent; 