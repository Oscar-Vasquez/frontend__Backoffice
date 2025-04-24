'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Users, Calendar, Send, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmailTemplate, EmailRecipient, EmailCampaign } from '@/types/email-template';
import { TemplatesService } from '@/app/services/templates.service';
import UsersService, { FirebaseUser } from '@/app/services/users.service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
}

export default function SendEmail() {
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [subject, setSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId) {
        try {
          const loadedTemplate = await TemplatesService.getTemplateById(templateId);
          setTemplate(loadedTemplate);
        } catch (error) {
          console.error('Error al cargar la plantilla:', error);
        }
      }
    };

    const loadRecipients = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/v1/users/all');
        if (!response.ok) {
          throw new Error('Error al obtener los usuarios');
        }
        const users = await response.json();
        console.log('Usuarios cargados:', users);
        
        setRecipients(users.map((user: FirebaseUser) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || ''
        })));
      } catch (error) {
        console.error('Error al cargar destinatarios:', error);
      }
    };

    loadTemplate();
    loadRecipients();
  }, [templateId]);

  const filteredRecipients = recipients.filter(recipient => 
    recipient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendClick = () => {
    setShowConfirmDialog(true);
  };

  const handleSendEmail = async () => {
    if (!template) return;

    try {
      setIsSending(true);

      const campaign: EmailCampaign = {
        name: `Campaña - ${template.name}`,
        templateId: template.id!,
        subject,
        recipients: sendToAll ? recipients : recipients.filter(r => selectedRecipients.includes(r.id)),
        sendToAll,
        status: isScheduled ? 'scheduled' : 'sending',
        scheduledDate: isScheduled ? new Date(scheduledDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-test' // TODO: Obtener el ID del usuario actual
      };

      // TODO: Implementar servicio para enviar correos
      await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaign)
      });

      setShowConfirmDialog(false);
      alert('Correo enviado exitosamente');
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      alert('Error al enviar el correo');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-50">
        <div className="px-4">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/emails/templates" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-4 h-4 text-gray-500" />
              </Link>
              <h1 className="text-base font-medium">
                Enviar correo: {template?.name || 'Cargando...'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendClick}
                disabled={isSending || !subject || (!sendToAll && selectedRecipients.length === 0)}
                className={cn(
                  "px-3 py-1.5 text-sm text-white rounded-lg transition-colors flex items-center gap-2",
                  isSending || !subject || (!sendToAll && selectedRecipients.length === 0)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-violet-600 hover:bg-violet-700"
                )}
              >
                <Send className="w-4 h-4" />
                {isSending ? 'Enviando...' : 'Enviar correo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Confirmar envío de correo
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas enviar este correo a {sendToAll ? 'todos los usuarios' : `${selectedRecipients.length} destinatarios seleccionados`}?
              {isScheduled && (
                <div className="mt-2">
                  El correo será enviado el: {new Date(scheduledDate).toLocaleString()}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSendEmail}
              className="bg-violet-600 hover:bg-violet-700"
            >
              Confirmar envío
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Asunto del correo */}
        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">Asunto del correo</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ingresa el asunto del correo"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>

        {/* Programación */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-medium">Programación</h2>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm">Programar envío</span>
            </label>

            {isScheduled && (
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            )}
          </div>
        </div>

        {/* Destinatarios */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-medium">Destinatarios</h2>
          </div>

          <div className="space-y-4">
            {/* Enviar a todos */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sendToAll}
                onChange={(e) => setSendToAll(e.target.checked)}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm">Enviar a todos los usuarios ({recipients.length})</span>
            </label>

            {!sendToAll && (
              <>
                {/* Buscador */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre o correo"
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>

                {/* Lista de destinatarios */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span>Nombre</span>
                      <span>Correo</span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {filteredRecipients.map(recipient => (
                      <label
                        key={recipient.id}
                        className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedRecipients.includes(recipient.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRecipients(prev => [...prev, recipient.id]);
                              } else {
                                setSelectedRecipients(prev => prev.filter(id => id !== recipient.id));
                              }
                            }}
                            className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-sm">
                            {recipient.firstName} {recipient.lastName}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{recipient.email}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Contador de seleccionados */}
                <div className="text-sm text-gray-500">
                  {selectedRecipients.length} destinatarios seleccionados
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 