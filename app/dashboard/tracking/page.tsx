'use client';

import React from 'react';
import TrackingSearch from './components/TrackingSearch';

/**
 * Página de rastreo de paquetes
 * Implementa las últimas tendencias UX/UI para 2025
 * Permite a los usuarios buscar y seguir sus envíos con una interfaz moderna y amigable
 * Soporta cambio dinámico del color primario y tema claro/oscuro según preferencias
 */
export default function TrackingPage() {
  return (
    <div className="tracking-dashboard-container min-h-screen 
                    bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ">
      <TrackingSearch />
    </div>
  );
} 