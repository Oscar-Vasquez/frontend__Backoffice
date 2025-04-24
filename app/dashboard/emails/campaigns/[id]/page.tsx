'use client';

import { useEffect, useState } from 'react';
import { CampaignService } from '@/app/services/campaign.service';
import { EmailService } from '@/app/services/email.service';
import { EmailCampaign, EmailCampaignMetrics } from '@/types/email-template';
import { ArrowLeft, Users, Mail, MousePointer, Ban, Reply, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [metrics, setMetrics] = useState<EmailCampaignMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCampaign();
    const interval = setInterval(refreshMetrics, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, [params.id]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const campaignData = await CampaignService.getCampaignById(params.id);
      setCampaign(campaignData);
      await refreshMetrics();
    } catch (error) {
      console.error('Error al cargar la campaña:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMetrics = async () => {
    if (!params.id) return;
    try {
      setRefreshing(true);
      const metricsData = await CampaignService.getCampaignMetrics(params.id);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Error al actualizar métricas:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatMetric = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium">Campaña no encontrada</h2>
          <p className="text-gray-500 mt-2">La campaña que buscas no existe o ha sido eliminada</p>
          <Link
            href="/dashboard/emails/campaigns"
            className="mt-4 inline-flex items-center text-sm text-violet-600 hover:text-violet-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver a campañas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/dashboard/emails/campaigns"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold">{campaign.name}</h1>
            <p className="text-gray-500 mt-1">{campaign.subject}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              campaign.status === 'sent' ? 'bg-green-100 text-green-700' :
              campaign.status === 'sending' ? 'bg-blue-100 text-blue-700' :
              campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
              campaign.status === 'failed' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            )}>
              {campaign.status === 'sent' ? 'Enviado' :
               campaign.status === 'sending' ? 'Enviando' :
               campaign.status === 'scheduled' ? 'Programado' :
               campaign.status === 'failed' ? 'Fallido' :
               'Borrador'}
            </span>
            {campaign.sentDate && (
              <span className="text-sm text-gray-500">
                Enviado el {formatDate(campaign.sentDate)}
              </span>
            )}
          </div>
          <button
            onClick={refreshMetrics}
            disabled={refreshing}
            className={cn(
              "p-2 rounded-lg transition-colors",
              refreshing ? "text-gray-400" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <RefreshCcw className={cn("w-4 h-4", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Destinatarios */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-violet-600" />
            </div>
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold">
              {metrics?.totalRecipients || campaign.recipients.length}
            </h3>
            <p className="text-sm text-gray-500">Destinatarios</p>
          </div>
        </div>

        {/* Tasa de apertura */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">
              {metrics?.uniqueOpens || 0} únicos
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold">
              {metrics ? formatMetric(metrics.openRate) : '0%'}
            </h3>
            <p className="text-sm text-gray-500">Tasa de apertura</p>
          </div>
        </div>

        {/* Clics */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <MousePointer className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold">
              {metrics?.totalClicks || 0}
            </h3>
            <p className="text-sm text-gray-500">Clics totales</p>
          </div>
        </div>

        {/* Tasa de rebote */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Ban className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm text-gray-500">
              {metrics?.bouncedCount || 0} rebotes
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold">
              {metrics ? formatMetric(metrics.bounceRate) : '0%'}
            </h3>
            <p className="text-sm text-gray-500">Tasa de rebote</p>
          </div>
        </div>

        {/* Tasa de respuesta */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Reply className="w-6 h-6 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">
              {metrics?.responseCount || 0} respuestas
            </span>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold">
              {metrics ? formatMetric(metrics.responseRate) : '0%'}
            </h3>
            <p className="text-sm text-gray-500">Tasa de respuesta</p>
          </div>
        </div>
      </div>

      {/* Última actualización */}
      {metrics?.lastUpdated && (
        <div className="text-sm text-gray-500 text-center">
          Última actualización: {formatDate(metrics.lastUpdated)}
        </div>
      )}
    </div>
  );
} 