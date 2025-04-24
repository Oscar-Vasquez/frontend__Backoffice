"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

interface Shipment {
  id: string;
  type: 'air' | 'sea';
  position: [number, number];
  origin: string;
  destination: string;
  status: string;
}

// Cargar el mapa dinámicamente sin SSR
const MapComponent = dynamic(
  () => import('./map-component'),
  {
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg">
        <div className="animate-pulse text-slate-500 dark:text-slate-400">
          Cargando mapa...
        </div>
      </div>
    ),
    ssr: false
  }
);

function LiveTrackingMap() {
  const [shipments] = useState<Shipment[]>([
    {
      id: '1',
      type: 'air',
      position: [25.2867, -80.2575],
      origin: 'Miami',
      destination: 'Ciudad de México',
      status: 'En tránsito'
    },
    {
      id: '2',
      type: 'sea',
      position: [18.9261, -72.3074],
      origin: 'Puerto Príncipe',
      destination: 'La Habana',
      status: 'En puerto'
    },
  ]);

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
      <MapComponent shipments={shipments} />
    </div>
  );
}

export default LiveTrackingMap; 