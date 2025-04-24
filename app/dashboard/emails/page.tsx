'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import EmailRow from './components/email-row';
import { Search, Filter, Settings, Plus, LayoutTemplate, Mail, Star, Zap, ShoppingBag, Package, UserPlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { EmailService } from '@/app/services/email.service';
import { EmailCampaign } from '@/types/email-template';
import { toast } from "@/components/ui/use-toast";
import { cn } from '@/lib/utils';

export default function EmailsPage() {
  const [selectedFilter, setSelectedFilter] = useState('All Email');
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCampaigns();
    // Actualizar cada 10 segundos
    const interval = setInterval(loadCampaigns, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await EmailService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error al cargar campañas:', error);
      toast({
        title: "Error al cargar campañas",
        description: "No se pudieron cargar las campañas. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (!searchQuery) return true;
    return campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           campaign.subject.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 p-8 bg-gray-50/30">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Campañas de correo ({campaigns.length})</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona y monitorea tus campañas de correo</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/dashboard/emails/templates"
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Plantillas</span>
          </Link>
          <Link
            href="/dashboard/emails/templates"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva campaña</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white shadow-sm border-0">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex-1 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar campañas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select 
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option>All Email</option>
                  <option>Enviados</option>
                  <option>Programados</option>
                  <option>Fallidos</option>
                </select>
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span>Filtros</span>
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span>Columnas</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaña
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destinatarios
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasa de apertura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clics totales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasa de rebote
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasa de respuesta
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        No hay campañas disponibles
                      </td>
                    </tr>
                  ) : (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            <div className="text-sm text-gray-500">{campaign.subject}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            campaign.status === 'sending' && "bg-blue-100 text-blue-800",
                            campaign.status === 'scheduled' && "bg-yellow-100 text-yellow-800",
                            campaign.status === 'sent' && "bg-green-100 text-green-800",
                            campaign.status === 'failed' && "bg-red-100 text-red-800",
                            campaign.status === 'draft' && "bg-gray-100 text-gray-800"
                          )}>
                            {campaign.status === 'sending' && 'Enviando'}
                            {campaign.status === 'scheduled' && 'Programado'}
                            {campaign.status === 'sent' && 'Enviado'}
                            {campaign.status === 'failed' && 'Fallido'}
                            {campaign.status === 'draft' && 'Borrador'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {campaign.recipients?.length || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {campaign.metrics?.openRate ? `${campaign.metrics.openRate.toFixed(1)}%` : '0%'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {campaign.metrics?.totalClicks || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {campaign.metrics?.bounceRate ? `${campaign.metrics.bounceRate.toFixed(1)}%` : '0%'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {campaign.metrics?.responseRate ? `${campaign.metrics.responseRate.toFixed(1)}%` : '0%'}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <Link href={`/dashboard/emails/campaigns/${campaign.id}`} className="text-orange-600 hover:text-orange-900">
                            Ver detalles
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 