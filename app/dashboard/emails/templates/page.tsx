'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Search, Filter, ArrowLeft, Star, Plus, Mail, Zap, ShoppingBag, Package, UserPlus, Settings, AlertCircle, Send, Users, Calendar, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { TemplatesService } from '@/app/services/templates.service';
import UsersService, { FirebaseUser } from '@/app/services/users.service';
import { EmailTemplate, EmailRecipient, EmailCampaign } from '@/types/email-template';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { EmailService } from '@/app/services/email.service';
import { toast } from "@/components/ui/use-toast";
import { Toast } from "@/components/ui/toast";
import { useSearchParams } from 'next/navigation';

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Template');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [subject, setSubject] = useState('');
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [searchRecipientQuery, setSearchRecipientQuery] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    loadTemplates();
    loadRecipients();
  }, []);

  useEffect(() => {
    // Manejar los parámetros de URL
    const showDialog = searchParams.get('showSendDialog');
    const templateId = searchParams.get('templateId');
    
    if (showDialog === 'true' && templateId && savedTemplates.length > 0) {
      const template = savedTemplates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        setShowSendDialog(true);
      }
    }
  }, [searchParams, savedTemplates]);

  const loadTemplates = async () => {
    try {
      const templates = await TemplatesService.getTemplates();
      setSavedTemplates(templates);
    } catch (error) {
      console.error('Error al cargar las plantillas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecipients = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/users/all');
      if (!response.ok) {
        throw new Error('Error al obtener los usuarios');
      }
      const users = await response.json();
      console.log('Usuarios cargados:', users.length);
      
      setRecipients(users.map((user: FirebaseUser, index: number) => ({
        id: user.id || `temp-${user.email}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        email: user.email,
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || ''
      })));
    } catch (error) {
      console.error('Error al cargar destinatarios:', error);
    }
  };

  const categories = [
    { id: 'all', name: 'All Template', icon: Mail, count: savedTemplates.length },
    { id: 'premium', name: 'Premium Template', icon: Star, count: savedTemplates.filter(t => t.category === 'premium').length, isPremium: true },
    { id: 'marketing', name: 'Email Marketing', icon: Zap, count: savedTemplates.filter(t => t.category === 'marketing').length },
    { id: 'simple', name: 'Simple Template', icon: Mail, count: savedTemplates.filter(t => t.category === 'simple').length },
    { id: 'sales', name: 'Sales Template', icon: ShoppingBag, count: savedTemplates.filter(t => t.category === 'sales').length },
    { id: 'product', name: 'Product Promo', icon: Package, count: savedTemplates.filter(t => t.category === 'product').length },
    { id: 'registration', name: 'Registration', icon: UserPlus, count: savedTemplates.filter(t => t.category === 'registration').length }
  ];

  const filteredTemplates = savedTemplates.filter(template => {
    if (selectedCategory === 'All Template') return true;
    return template.category === selectedCategory.toLowerCase().replace(' template', '');
  }).filter(template => {
    if (!searchQuery) return true;
    return template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (template.description || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredRecipients = recipients.filter(recipient => {
    const matches = 
      recipient.email.toLowerCase().includes(searchRecipientQuery.toLowerCase()) ||
      recipient.firstName?.toLowerCase().includes(searchRecipientQuery.toLowerCase()) ||
      recipient.lastName?.toLowerCase().includes(searchRecipientQuery.toLowerCase());
    
    // Solo log si hay una búsqueda activa
    if (searchRecipientQuery) {
      console.log('🔍 Filtrando recipiente:', {
        email: recipient.email,
        firstName: recipient.firstName,
        lastName: recipient.lastName,
        searchQuery: searchRecipientQuery,
        matches
      });
    }
    
    return matches;
  });

  const handleSendClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowSendDialog(true);
  };

  const handleSendEmail = async () => {
    if (!selectedTemplate) return;

    try {
      setIsSending(true);

      const campaign: EmailCampaign = {
        name: `Campaña - ${selectedTemplate.name}`,
        templateId: selectedTemplate.id!,
        subject,
        recipients: sendToAll ? recipients : recipients.filter(r => selectedRecipients.includes(r.id)),
        sendToAll,
        status: isScheduled ? 'scheduled' : 'sending',
        scheduledDate: isScheduled ? new Date(scheduledDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-test' // TODO: Obtener el ID del usuario actual
      };

      const results = await EmailService.sendCampaign(campaign);
      
      // Analizar resultados
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      
      setShowSendDialog(false);
      
      // Mostrar toast con el resultado
      if (failedCount === 0) {
        toast({
          title: "Correos enviados exitosamente",
          description: `Se enviaron ${successCount} correos correctamente.`,
        });
      } else if (successCount === 0) {
        toast({
          title: "Error al enviar correos",
          description: "No se pudo enviar ningún correo. Por favor, intenta nuevamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Envío parcialmente exitoso",
          description: `Se enviaron ${successCount} correos correctamente y ${failedCount} fallaron.`,
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      console.error('Error al enviar el correo:', error);
      toast({
        title: "Error al enviar correos",
        description: error instanceof Error ? error.message : "Ocurrió un error al enviar los correos.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteClick = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      setIsLoading(true);
      await TemplatesService.deleteTemplate(templateToDelete.id!);
      
      // Actualizar la lista de plantillas
      setSavedTemplates(prevTemplates => 
        prevTemplates.filter(t => t.id !== templateToDelete.id)
      );
      
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla se ha eliminado correctamente.",
      });
    } catch (error) {
      console.error('Error al eliminar la plantilla:', error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar la plantilla. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="border-b bg-white">
        <div className="px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/emails" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <h1 className="text-xl font-semibold">Plantillas ({savedTemplates.length})</h1>
          </div>
        </div>
      </div>

      {/* Send Email Dialog */}
      <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <AlertDialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-sm border-none shadow-2xl">
          {selectedTemplate && (
            <>
              <AlertDialogHeader>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 backdrop-blur-md" />
                  <div className="relative px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <AlertDialogTitle className="text-2xl font-semibold tracking-tight">
                          Enviar correo
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-muted-foreground">
                          {selectedTemplate.name}
                        </AlertDialogDescription>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Send className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </AlertDialogHeader>

              {/* Contenido principal con diseño de tarjetas flotantes */}
              <div className="p-8 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                {/* Asunto del correo - Diseño mejorado */}
                <div className="group relative bg-card hover:bg-accent/5 rounded-xl p-6 transition-all duration-200">
                  <div className="absolute inset-0 border border-input rounded-xl group-hover:border-primary/20 transition-colors" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-base font-medium">Asunto del correo</h3>
                  </div>
                  
                  <div className="space-y-4 ml-11">
                    <div className="relative">
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Ingresa el asunto del correo"
                        className="w-full px-4 py-3 bg-background/50 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                      />
                      {subject && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <span className="text-xs text-muted-foreground">
                            {subject.length} caracteres
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {subject.length > 100 && (
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>El asunto es demasiado largo, se recomienda máximo 100 caracteres</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Programación - Diseño de tarjeta con animación */}
                <div className="group relative bg-card hover:bg-accent/5 rounded-xl p-6 transition-all duration-200">
                  <div className="absolute inset-0 border border-input rounded-xl group-hover:border-primary/20 transition-colors" />
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-base font-medium">Programación</h3>
                  </div>
                  
                  <div className="space-y-4 ml-11">
                    <label className="flex items-center gap-3 relative">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={isScheduled}
                          onChange={(e) => setIsScheduled(e.target.checked)}
                          className="peer h-5 w-5 rounded border-input text-primary focus:ring-primary/20"
                        />
                        <div className="absolute inset-0 bg-primary/10 scale-50 opacity-0 peer-checked:scale-100 peer-checked:opacity-100 rounded transition-all duration-200" />
                      </div>
                      <span className="text-sm text-foreground/80">Programar envío</span>
                    </label>

                    {isScheduled && (
                      <div className="animate-in fade-in slide-in-from-top-4 duration-200">
                        <input
                          type="datetime-local"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full px-4 py-3 bg-background/50 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Destinatarios - Diseño de tarjeta con tabla moderna */}
                <div className="group relative bg-card hover:bg-accent/5 rounded-xl p-6 transition-all duration-200">
                  <div className="absolute inset-0 border border-input rounded-xl group-hover:border-primary/20 transition-colors" />
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="text-base font-medium">Destinatarios</h3>
                  </div>

                  <div className="space-y-6 ml-11">
                    {/* Enviar a todos con diseño moderno */}
                    <label className="flex items-center gap-3 relative group/checkbox cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={sendToAll}
                          onChange={(e) => {
                            setSendToAll(e.target.checked);
                            if (e.target.checked) {
                              setSelectedRecipients([]);
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="h-5 w-5 rounded-md border-2 border-input bg-background transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20">
                          <svg
                            className="h-full w-full stroke-white stroke-[4] opacity-0 transition-opacity peer-checked:opacity-100"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-foreground/80">Enviar a todos los usuarios</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                          {recipients.length}
                        </span>
                      </div>
                    </label>

                    {!sendToAll && (
                      <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
                        {/* Buscador con diseño flotante */}
                        <div className="relative">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <input
                            type="text"
                            value={searchRecipientQuery}
                            onChange={(e) => setSearchRecipientQuery(e.target.value)}
                            placeholder="Buscar por nombre o correo"
                            className="w-full pl-11 pr-4 py-3 bg-background/50 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                          />
                        </div>

                        {/* Lista de destinatarios con diseño moderno */}
                        <div className="border border-input rounded-xl overflow-hidden bg-card p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                            {filteredRecipients.map((recipient, index) => {
                              const isSelected = selectedRecipients.includes(recipient.id);
                              return (
                                <div
                                  key={recipient.id}
                                  className={cn(
                                    "group relative rounded-xl border border-input p-4 transition-all duration-200 hover:shadow-md",
                                    isSelected && "border-primary bg-primary/5"
                                  )}
                                >
                                  {/* Checkbox en la esquina superior derecha */}
                                  <div className="absolute top-3 right-3 z-20">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        if (!recipient.id) return;
                                        console.log('🔍 Checkbox onChange:', {
                                          recipientId: recipient.id,
                                          isChecked: e.target.checked,
                                          currentSelected: selectedRecipients,
                                        });
                                        const newSelectedRecipients = e.target.checked
                                          ? [...selectedRecipients, recipient.id]
                                          : selectedRecipients.filter(id => id !== recipient.id);
                                        console.log('✨ Nuevos seleccionados:', newSelectedRecipients);
                                        setSelectedRecipients(newSelectedRecipients);
                                      }}
                                      className="sr-only peer"
                                    />
                                    <div 
                                      onClick={() => {
                                        if (!recipient.id) return;
                                        console.log('🔍 Div onClick:', {
                                          recipientId: recipient.id,
                                          isCurrentlySelected: isSelected,
                                          currentSelected: selectedRecipients,
                                        });
                                        const newSelectedRecipients = isSelected
                                          ? selectedRecipients.filter(id => id !== recipient.id)
                                          : [...selectedRecipients, recipient.id];
                                        console.log('✨ Nuevos seleccionados:', newSelectedRecipients);
                                        setSelectedRecipients(newSelectedRecipients);
                                      }}
                                      className={cn(
                                        "h-5 w-5 rounded-full border-2 border-input bg-background transition-all duration-200 hover:border-primary/50 cursor-pointer",
                                        isSelected && "border-primary bg-primary"
                                      )}
                                    >
                                      {isSelected && (
                                        <svg
                                          className="h-full w-full stroke-white stroke-[4]"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>

                                  {/* Contenido de la tarjeta */}
                                  <div 
                                    className="flex items-start gap-4 cursor-pointer"
                                    onClick={() => {
                                      if (!recipient.id) return;
                                      console.log('🔍 Card onClick:', {
                                        recipientId: recipient.id,
                                        isCurrentlySelected: isSelected,
                                        currentSelected: selectedRecipients,
                                      });
                                      const newSelectedRecipients = isSelected
                                        ? selectedRecipients.filter(id => id !== recipient.id)
                                        : [...selectedRecipients, recipient.id];
                                      console.log('✨ Nuevos seleccionados:', newSelectedRecipients);
                                      setSelectedRecipients(newSelectedRecipients);
                                    }}
                                  >
                                    <div className="relative shrink-0">
                                      <div className={cn(
                                        "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center transition-colors",
                                        isSelected && "bg-primary/20"
                                      )}>
                                        <span className="text-sm font-medium text-primary">
                                          {recipient.firstName?.[0]}{recipient.lastName?.[0]}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {recipient.firstName} {recipient.lastName}
                                      </p>
                                      <p className="text-sm text-muted-foreground truncate mt-0.5">
                                        {recipient.email}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          {filteredRecipients.length === 0 && (
                            <div className="py-8 text-center">
                              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground">No se encontraron destinatarios</p>
                            </div>
                          )}
                        </div>

                        {/* Contador con diseño moderno */}
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {selectedRecipients.length} de {filteredRecipients.length} destinatarios seleccionados
                            </span>
                            {selectedRecipients.length > 0 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {Math.round((selectedRecipients.length / filteredRecipients.length) * 100)}%
                              </span>
                            )}
                          </div>
                          {selectedRecipients.length > 0 && (
                            <button
                              onClick={() => setSelectedRecipients([])}
                              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1.5"
                            >
                              <Users className="w-3.5 h-3.5" />
                              Deseleccionar todos
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer con efecto de vidrio y acciones */}
              <div className="relative">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-md border-t border-input" />
                <div className="relative px-8 py-6">
                  <div className="flex justify-end gap-3">
                    <AlertDialogCancel className="px-4 py-2.5 hover:bg-muted/50">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleSendEmail}
                      disabled={isSending || !subject || (!sendToAll && selectedRecipients.length === 0)}
                      className={cn(
                        "px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all inline-flex items-center gap-2",
                        (isSending || !subject || (!sendToAll && selectedRecipients.length === 0)) && 
                        "opacity-50 cursor-not-allowed hover:bg-primary"
                      )}
                    >
                      {isSending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Enviar correo</span>
                        </>
                      )}
                    </AlertDialogAction>
                  </div>
                </div>
              </div>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Template Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La plantilla "{templateToDelete?.name}" será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isLoading}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200",
                      selectedCategory === category.name
                        ? "bg-orange-50 text-orange-600"
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <category.icon className={cn(
                        "w-5 h-5",
                        selectedCategory === category.name
                          ? "text-orange-500"
                          : "text-gray-400"
                      )} />
                      <span className="font-medium">{category.name}</span>
                      {category.isPremium && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                          Premium
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "text-sm",
                      selectedCategory === category.name
                        ? "text-orange-600"
                        : "text-gray-400"
                    )}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar plantillas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>
              <div className="flex items-center gap-3">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create New Template Card */}
              <Link href="/dashboard/emails/templates/editor" className="block">
                <Card className="group relative aspect-[4/3] overflow-hidden border-2 border-dashed border-gray-200 hover:border-orange-500 transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                        <Plus className="w-6 h-6 text-orange-500" />
                      </div>
                      <h3 className="font-medium text-gray-900">Crear Nueva Plantilla</h3>
                      <p className="text-sm text-gray-500 mt-1">Comienza desde cero</p>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Template Cards */}
              {isLoading ? (
                <div className="col-span-3 text-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-gray-500">Cargando plantillas...</p>
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron plantillas</p>
                </div>
              ) : (
                filteredTemplates.map((template) => (
                  <Card key={template.id} className="group overflow-hidden">
                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                      {/* Always show placeholder for now as thumbnail doesn't exist on type */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                        <Mail className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-400">Vista previa no disponible</span>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-20">
                        <Link
                          href={`/dashboard/emails/templates/editor?template=${template.id}`}
                          className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Settings className="w-5 h-5 text-gray-700" />
                        </Link>
                        <button
                          onClick={() => handleSendClick(template)}
                          className="p-3 bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <Send className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteClick(template);
                          }}
                          className="p-3 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {template.description || 'Sin descripción'}
                          </p>
                        </div>
                        {template.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            {template.category}
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Creado: {template.createdAt instanceof Date 
                            ? template.createdAt.toLocaleDateString()
                            : template.createdAt && typeof template.createdAt === 'object' && '_seconds' in template.createdAt
                              ? new Date((template.createdAt as any)._seconds * 1000).toLocaleDateString()
                              : 'Fecha no disponible'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {/* Aquí podrías mostrar el número de veces que se ha usado la plantilla */}
                          0 envíos
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 