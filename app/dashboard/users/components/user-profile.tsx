"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Calendar, CreditCard, Building2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface UserProfileProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    photo?: string;
    accountStatus: string;
    branchName?: string;
    branchAddress?: string;
    planName?: string;
    walletName?: string;
    createdAt?: string;
    lastSeen?: string;
  };
  onActivate?: () => void;
  onClose?: () => void;
}

export function UserProfile({ user, onActivate, onClose }: UserProfileProps) {
  const isActive = user.accountStatus === 'active';
  const statusColor = isActive ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className="min-h-screen bg-gray-100/40 p-6 dark:bg-gray-800/40">
      <Card className="max-w-4xl mx-auto overflow-hidden bg-white dark:bg-gray-900">
        {/* Banner y Avatar */}
        <div className="relative">
          <div className="h-48 bg-gradient-to-r from-primary/80 to-primary" />
          <div className="absolute -bottom-12 left-8">
            <div className="p-1 bg-white dark:bg-gray-900 rounded-full">
              <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800">
                <AvatarImage src={user.photo} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="text-2xl">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <Button 
              variant="outline" 
              className="bg-white/90 hover:bg-white"
              onClick={onClose}
            >
              Cerrar
            </Button>
            {!isActive && (
              <Button 
                className="gap-2 bg-green-500 hover:bg-green-600"
                onClick={onActivate}
              >
                <CheckCircle2 className="w-4 h-4" />
                Activar Cliente
              </Button>
            )}
          </div>
        </div>

        {/* Información Principal */}
        <div className="pt-16 px-8 pb-8">
          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-semibold">
              {user.firstName} {user.lastName}
            </h1>
            <Badge 
              variant={isActive ? "default" : "destructive"}
              className="capitalize"
            >
              Cliente {user.accountStatus}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Columna Izquierda */}
            <div className="space-y-6">
              <section className="space-y-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Información de Contacto
                </h2>
                <div className="space-y-3 ml-7">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Teléfono:</span> {user.phone || 'No especificado'}
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Sucursal Asignada
                </h2>
                <div className="space-y-3 ml-7">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Nombre:</span> {user.branchName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Dirección:</span> {user.branchAddress}
                  </p>
                </div>
              </section>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              <section className="space-y-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Plan de cliente
                </h2>
                <div className="space-y-3 ml-7">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Plan:</span> {user.planName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Billetera:</span> {user.walletName}
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Fechas Importantes
                </h2>
                <div className="space-y-3 ml-7">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Fecha de Registro:</span>{' '}
                    {user.createdAt ? format(new Date(user.createdAt), "PPpp", { locale: es }) : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Último Acceso:</span>{' '}
                    {user.lastSeen ? format(new Date(user.lastSeen), "PPpp", { locale: es }) : 'N/A'}
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 