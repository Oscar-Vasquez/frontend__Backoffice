'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Image as ImageIcon, Type, Divide, Link as LinkIcon, 
  MoreHorizontal, Plus, Minus, AlignLeft, AlignCenter, AlignRight, 
  AlignJustify, Settings2, Trash2, Grid2X2, Layout, Columns, 
  ListOrdered, Quote, Table, Video, FileText, MapPin, Calendar,
  Clock, Phone, Mail, Globe, Share2, Award, Gift, Tag, Heart,
  ThumbsUp, Star, Bell, Send, ArrowRight, Facebook, Twitter, Instagram, Linkedin,
  AlertCircle, Users, Search, Save
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { TemplatesService } from '@/app/services/templates.service';
import { EmailTemplate, EmailRecipient, EmailCampaign } from '@/types/email-template';
import { useSearchParams } from 'next/navigation';
import { EmailService } from '@/app/services/email.service';
import { toast } from "@/components/ui/use-toast";
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
import { customToast } from "@/app/components/ui/custom-toast";

// Tipos de elementos
type ElementType = 'text' | 'columns' | 'image' | 'button' | 'divider' | 'footer' | 'bulletpoint';

interface EmailElementOptions {
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  fontSize?: number;
  fontName?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  isItalic?: boolean;
  isBold?: boolean;
  isUnderline?: boolean;
  imageUrl?: string;
  type?: string;
  backgroundColor?: string;
  href?: string;
  buttonStyle?: 'solid' | 'outline' | 'ghost';
  borderRadius?: number;
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
  dividerColor?: string;
  dividerWidth?: number;
  dividerHeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'line-through';
  fontWeight?: number;
  fontStyle?: string;
  width?: string;
  height?: string;
  hoverEffect?: boolean;
  buttonAlignment?: 'left' | 'center' | 'right';
  footerColumns?: number;
  footerGap?: number;
  footerElements?: EmailElement[];
  footerStyle?: 'simple' | 'columns' | 'social';
  companyInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  unsubscribeLink?: string;
  footerDisclaimer?: string;
  bulletStyle?: 'disc' | 'circle' | 'square';
  bulletColor?: string;
  bulletSize?: number;
  items?: string[];
  gap?: number;
}

interface EmailElement {
  id: string;
  type: 'text' | 'columns' | 'image' | 'button' | 'divider' | 'footer' | 'bulletpoint';
  content: string;
  backgroundColor?: string;
  columns?: number;
  gap?: number;
  elements?: EmailElement[][];
  options?: EmailElementOptions;
}

interface EditorSettings {
  width: number | '100%';
  backgroundColor: string;
  contentPadding: number;
  contentBackground: string;
  contentBorderRadius: number;
  contentMaxWidth: number;
}

export default function TemplateEditor() {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elements, setElements] = useState<EmailElement[]>([]);
  const [templateName, setTemplateName] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [subject, setSubject] = useState('');
  const [recipients, setRecipients] = useState<EmailRecipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [searchRecipientQuery, setSearchRecipientQuery] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>({
    width: '100%',
    backgroundColor: '#f5f5f5',
    contentPadding: 24,
    contentBackground: '#ffffff',
    contentBorderRadius: 4,
    contentMaxWidth: 800
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId) {
        try {
          console.log('🔍 Cargando plantilla con ID:', templateId);
          const template = await TemplatesService.getTemplateById(templateId);
          
          if (template) {
            console.log('📄 Plantilla cargada:', JSON.stringify(template, null, 2));
            console.log('📄 Elementos de la plantilla:', template.elements);
            setTemplateName(template.name);
            setElements(template.elements || []);
            setEditorSettings(template.editorSettings);
            setIsEditing(true);
            console.log('✅ Estado isEditing establecido a true');
            
            // Verificar que los elementos se han establecido correctamente
            console.log('📄 Estado de elementos después de setElements:', template.elements);
          } else {
            console.error('❌ No se pudo cargar la plantilla');
          }
        } catch (error) {
          console.error('❌ Error al cargar la plantilla:', error);
        }
      } else {
        console.log('📝 Creando nueva plantilla, isEditing:', false);
      }
    };

    loadTemplate();
    loadRecipients();
  }, [templateId]);

  const loadRecipients = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/v1/users/all');
      if (!response.ok) {
        throw new Error('Error al obtener los usuarios');
      }
      const users = await response.json();
      console.log('Usuarios cargados:', users.length);
      
      setRecipients(users.map((user: any, index: number) => ({
        id: user.id || `temp-${user.email}-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        email: user.email,
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || ''
      })));
    } catch (error) {
      console.error('Error al cargar destinatarios:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!templateId) {
      customToast.warning({
        title: "Plantilla no Guardada",
        description: "Por favor, guarda la plantilla antes de enviar el correo.",
      });
      return;
    }

    if (!subject.trim()) {
      customToast.warning({
        title: "Asunto Requerido",
        description: "Por favor, ingresa un asunto para el correo.",
      });
      return;
    }

    if (!sendToAll && selectedRecipients.length === 0) {
      customToast.warning({
        title: "Sin Destinatarios",
        description: "Por favor, selecciona al menos un destinatario.",
      });
      return;
    }

    try {
      setIsSending(true);

      const campaign: EmailCampaign = {
        name: `Campaña - ${templateName}`,
        templateId: templateId,
        subject,
        recipients: sendToAll ? recipients : recipients.filter(r => selectedRecipients.includes(r.id)),
        sendToAll,
        status: isScheduled ? 'scheduled' : 'sending',
        scheduledDate: isScheduled ? new Date(scheduledDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-test'
      };

      const results = await EmailService.sendCampaign(campaign);
      
      // Analizar resultados
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      
      setShowSendDialog(false);
      
      // Mostrar toast con el resultado
      if (failedCount === 0) {
        customToast.success({
          title: "¡Correos Enviados!",
          description: `Se enviaron ${successCount} correos correctamente.`,
        });
      } else if (successCount === 0) {
        customToast.error({
          title: "Error al Enviar",
          description: "No se pudo enviar ningún correo. Por favor, intenta nuevamente.",
        });
      } else {
        customToast.warning({
          title: "Envío Parcial",
          description: `Se enviaron ${successCount} correos correctamente y ${failedCount} fallaron.`,
        });
      }
    } catch (error: unknown) {
      console.error('Error al enviar el correo:', error);
      customToast.error({
        title: "Error al Enviar",
        description: error instanceof Error ? error.message : "Ocurrió un error al enviar los correos.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const defaultPadding = {
    top: 16,
    right: 16,
    bottom: 16,
    left: 16
  };

  const createColumnElement = (id: string): EmailElement => ({
    id,
    type: 'columns',
    content: '',
    columns: 2,
    gap: 16,
    backgroundColor: 'transparent'
  });

  const createTextElement = (id: string): EmailElement => ({
    id,
    type: 'text',
    content: 'Nuevo elemento',
    backgroundColor: 'transparent',
    options: {
      padding: defaultPadding,
      fontSize: 16,
      fontName: 'Inter',
      alignment: 'left',
      color: '#1F2937',
      isItalic: false,
      isBold: false,
      isUnderline: false
    }
  });

  const componentCategories = [
    {
      title: 'Logo',
      items: [
        { id: 'logo', icon: ImageIcon, label: 'Logo' }
      ]
    },
    {
      title: 'Básicos',
      items: [
        { id: 'text', icon: Type, label: 'Texto' },
        { id: 'image', icon: ImageIcon, label: 'Imagen' },
        { id: 'button', icon: LinkIcon, label: 'Botón' },
        { id: 'divider', icon: Divide, label: 'Divisor' },
        { id: 'footer', icon: Layout, label: 'Footer' },
        { id: 'bulletpoint', icon: ListOrdered, label: 'Viñetas' }
      ]
    },
   
    
    

  ];

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (result: any) => {
    setIsDragging(false);
    if (!result.destination) return;
    
    const { source, destination } = result;

    // Manejo de elementos desde el panel de componentes
    if (source.droppableId.startsWith('components-')) {
      const categoryIndex = parseInt(source.droppableId.split('-')[1]);
      const category = componentCategories[categoryIndex];
      const component = category.items[source.index];
      
      if (component) {
        let newElement: EmailElement;
        
        switch (component.id) {
          case 'image':
            newElement = {
              id: `${component.id}-${Date.now()}`,
              type: 'image',
              content: '',
              backgroundColor: 'transparent',
              options: {
                padding: defaultPadding,
                imageUrl: '',
                type: 'image'
              }
            };
            break;
          
          case 'columns':
            newElement = {
              id: `${component.id}-${Date.now()}`,
              type: 'columns',
              content: '',
              backgroundColor: 'transparent',
              columns: 2,
              gap: 16,
              elements: [[], []]
            };
            break;
          
          case 'logo':
            newElement = {
              id: `${component.id}-${Date.now()}`,
              type: 'image',
              content: '',
              backgroundColor: 'transparent',
              options: {
                padding: defaultPadding,
                imageUrl: '',
                type: 'logo'
              }
            };
            break;
          
          case 'button':
            newElement = {
              id: `${component.id}-${Date.now()}`,
              type: 'button',
              content: 'Botón',
              backgroundColor: 'transparent',
              options: {
                padding: defaultPadding,
                fontSize: 16,
                fontName: 'Inter',
                alignment: 'center',
                color: '#FFFFFF',
                backgroundColor: '#6366F1',
                buttonStyle: 'solid',
                borderRadius: 8,
                href: '#',
                type: 'button'
              }
            };
            break;
          
          case 'divider':
            newElement = {
              id: `${component.id}-${Date.now()}`,
              type: 'divider',
              content: '',
              backgroundColor: 'transparent',
              options: {
                padding: defaultPadding,
                dividerStyle: 'solid',
                dividerColor: '#E5E7EB',
                dividerWidth: 100,
                dividerHeight: 1,
                type: 'divider'
              }
            };
            break;
          
          case 'footer':
            newElement = {
              id: `${component.id}-${Date.now()}`,
              type: 'footer',
              content: '',
              backgroundColor: '#f5f5f5',
              options: {
                padding: {
                  top: 32,
                  right: 24,
                  bottom: 32,
                  left: 24
                },
                footerColumns: 3,
                footerGap: 24,
                footerStyle: 'columns',
                companyInfo: {
                  name: 'Tu Empresa',
                  email: 'info@tuempresa.com',
                  phone: '+1 234 567 890',
                  address: 'Calle Principal #123'
                },
                socialLinks: {
                  facebook: '#',
                  twitter: '#',
                  instagram: '#',
                  linkedin: '#',
                  website: '#'
                },
                unsubscribeLink: '#',
                footerDisclaimer: 'Has recibido este correo porque estás suscrito a nuestras actualizaciones.'
              }
            };
            break;
          
          case 'bulletpoint':
            newElement = {
              id: `${component.id}-${Date.now()}`,
              type: 'bulletpoint',
              content: '',
              backgroundColor: 'transparent',
              options: {
                padding: defaultPadding,
                bulletStyle: 'disc',
                bulletColor: '#6366F1',
                bulletSize: 16,
                items: ['Item 1', 'Item 2', 'Item 3']
              }
            };
            break;
          
          default:
            newElement = {
              id: `${component.id}-${Date.now()}`,
              type: 'text',
              content: 'Nuevo elemento',
              backgroundColor: 'transparent',
              options: {
                padding: defaultPadding,
                fontSize: 16,
                fontName: 'Inter',
                alignment: 'left',
                color: '#1F2937',
                isItalic: false,
                isBold: false,
                isUnderline: false,
                type: 'text'
              }
            };
        }

        if (destination.droppableId.startsWith('column-')) {
          const [_, columnElementId, columnIndex] = destination.droppableId.split('-');
          setElements(prevElements => 
            prevElements.map(el => {
              if (el.id === columnElementId && el.type === 'columns') {
                const newElements = [...(el.elements || [])];
                if (!newElements[parseInt(columnIndex)]) {
                  newElements[parseInt(columnIndex)] = [];
                }
                newElements[parseInt(columnIndex)].splice(destination.index, 0, newElement);
                return { ...el, elements: newElements };
              }
              return el;
            })
          );
        } else if (destination.droppableId === 'editor') {
          setElements(prevElements => {
            const newElements = [...prevElements];
            newElements.splice(destination.index, 0, newElement);
            return newElements;
          });
        }
        setSelectedElement(newElement.id);
      }
    } else {
      // Mover elementos existentes
      const sourceId = source.droppableId;
      const destinationId = destination.droppableId;
      let elementToMove: EmailElement | undefined;

      // Remover de la fuente
      if (sourceId === 'editor') {
        setElements(prevElements => {
          const newElements = [...prevElements];
          [elementToMove] = newElements.splice(source.index, 1);
          return newElements;
        });
      } else if (sourceId.startsWith('column-')) {
        const [_, sourceColumnId, sourceColumnIndex] = sourceId.split('-');
        setElements(prevElements => 
          prevElements.map(el => {
            if (el.id === sourceColumnId && el.type === 'columns' && el.elements) {
              const newElements = [...el.elements];
              [elementToMove] = newElements[parseInt(sourceColumnIndex)].splice(source.index, 1);
              return { ...el, elements: newElements };
            }
            return el;
          })
        );
      }

      // Añadir al destino
      setTimeout(() => {
        if (elementToMove) {
          if (destinationId === 'editor') {
            setElements(prevElements => {
              const newElements = [...prevElements];
              newElements.splice(destination.index, 0, elementToMove!);
              return newElements;
            });
          } else if (destinationId.startsWith('column-')) {
            const [_, destColumnId, destColumnIndex] = destinationId.split('-');
            setElements(prevElements => 
              prevElements.map(el => {
                if (el.id === destColumnId && el.type === 'columns') {
                  const newElements = [...(el.elements || [])];
                  if (!newElements[parseInt(destColumnIndex)]) {
                    newElements[parseInt(destColumnIndex)] = [];
                  }
                  newElements[parseInt(destColumnIndex)].splice(destination.index, 0, elementToMove!);
                  return { ...el, elements: newElements };
                }
                return el;
              })
            );
          }
        }
      }, 0);
    }
  };

  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  const updateElementContent = (elementId: string, content: string) => {
    setElements(elements.map(el => 
      el.id === elementId ? { ...el, content } : el
    ));
  };

  const updateElement = (elementId: string, updates: Partial<EmailElement>) => {
    setElements(elements.map(el => 
      el.id === elementId ? { 
        ...el, 
        ...updates,
        options: {
          ...el.options,
          ...updates.options
        }
      } : el
    ));
  };

  const deleteElement = (elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId));
    setSelectedElement(null);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === editorRef.current) {
      setSelectedElement(null);
    }
  };

  const getElementStyles = (element: EmailElement) => {
    const styles: Record<string, any> = {};
    
    if (element.options?.padding) {
      styles.padding = `${element.options.padding.top}px ${element.options.padding.right}px ${element.options.padding.bottom}px ${element.options.padding.left}px`;
    }

    if (element.options?.alignment) {
      styles.textAlign = element.options.alignment;
    }
    
    if (element.options?.fontSize) {
      styles.fontSize = `${element.options.fontSize}px`;
    }
    
    if (element.options?.fontName) {
      styles.fontFamily = element.options.fontName;
    }

    if (element.options?.color) {
      styles.color = element.options.color;
    }

    if (element.options?.backgroundColor) {
      styles.backgroundColor = element.options.backgroundColor;
    }

    if (element.options?.lineHeight) {
      styles.lineHeight = element.options.lineHeight;
    }

    if (element.options?.letterSpacing) {
      styles.letterSpacing = `${element.options.letterSpacing}px`;
    }

    if (element.options?.textTransform) {
      styles.textTransform = element.options.textTransform;
    }

    if (element.options?.textDecoration) {
      styles.textDecoration = element.options.textDecoration;
    }

    if (element.options?.fontWeight) {
      styles.fontWeight = element.options.fontWeight;
    }

    if (element.options?.fontStyle) {
      styles.fontStyle = element.options.fontStyle;
    }

    return styles;
  };

  const getDefaultOptions = (type: string): EmailElement => {
    const defaultPadding = {
      top: 16,
      right: 16,
      bottom: 16,
      left: 16
    };

    const baseElement = {
      id: '',
      content: '',
      backgroundColor: 'transparent',
      options: {
        padding: defaultPadding
      }
    };

    switch (type) {
      case 'text':
        return {
          ...baseElement,
          type: 'text',
          options: {
            ...baseElement.options,
            fontSize: 16,
            fontName: 'Sailec',
            alignment: 'left',
            color: '#1F2937',
            isItalic: false,
            isBold: false,
            isUnderline: false
          }
        };
      
      case 'columns':
        return {
          ...baseElement,
          type: 'columns',
          columns: 2,
          gap: 16
        };
      
      default:
        return {
          ...baseElement,
          type: 'text'
        };
    }
  };

  const updateElementPadding = (elementId: string, padding: Partial<{ top: number; right: number; bottom: number; left: number; }>) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    updateElement(elementId, {
      options: {
        ...element.options,
        padding: {
          ...(element.options?.padding || defaultPadding),
          ...padding
        }
      }
    });
  };

  const updateElementStyle = (elementId: string, updates: Partial<EmailElement['options']>) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    updateElement(elementId, {
      options: {
        ...element.options,
        ...updates
      }
    });
  };

  const renderElement = (element: EmailElement, index: number) => (
    <Draggable key={element.id} draggableId={element.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "relative group transition-all duration-200 mb-4",
            selectedElement === element.id && "ring-2 ring-violet-500",
            snapshot.isDragging && "ring-2 ring-violet-300 bg-white shadow-lg"
          )}
        >
          <div
            {...provided.dragHandleProps}
            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity"
          >
            <button
              onClick={() => deleteElement(element.id)}
              className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="p-1 hover:bg-gray-100 rounded cursor-move">
              <MoreHorizontal className="w-4 h-4" />
            </div>
          </div>

          {element.type === 'columns' ? (
            <div className="w-full p-4">
              <div
                className={cn(
                  "grid w-full transition-all duration-200",
                  "border-2 border-dashed border-gray-200 rounded-lg",
                  "hover:border-violet-300"
                )}
                style={{
                  gridTemplateColumns: `repeat(${element.columns || 2}, 1fr)`,
                  gap: `${element.gap || 16}px`,
                  backgroundColor: element.backgroundColor || 'transparent'
                }}
              >
                {Array.from({ length: element.columns || 2 }).map((_, colIndex) => (
                  <Droppable
                    key={`${element.id}-col-${colIndex}`}
                    droppableId={`column-${element.id}-${colIndex}`}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "min-h-[100px] rounded-lg transition-colors p-2",
                          snapshot.isDraggingOver ? "bg-violet-50" : "bg-gray-50/50"
                        )}
                      >
                        {element.elements?.[colIndex]?.map((columnElement, elementIndex) => (
                          renderElement(columnElement, elementIndex)
                        )) || (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-gray-400">Arrastra elementos aquí</p>
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>
          ) : element.type === 'image' ? (
            <div 
              className="outline-none min-h-[100px] focus:ring-2 focus:ring-violet-500/20 rounded p-4 flex items-center justify-center bg-gray-50"
              onClick={(e) => handleElementClick(element.id, e)}
              style={getElementStyles(element)}
            >
              {element.options?.imageUrl ? (
                <img 
                  src={element.options.imageUrl} 
                  alt="Imagen del elemento"
                  className="max-w-full h-auto object-contain"
                  style={{ maxHeight: '200px' }}
                />
              ) : (
                <div className="text-center text-gray-400">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Haz clic para agregar una imagen</p>
                </div>
              )}
            </div>
          ) : element.type === 'button' ? (
            <div 
              className="outline-none focus:ring-2 focus:ring-violet-500/20 rounded"
              onClick={(e) => handleElementClick(element.id, e)}
              style={{
                width: '100%',
                textAlign: element.options?.buttonAlignment || 'left'
              }}
            >
              <button
                className={cn(
                  "transition-colors inline-block",
                  "rounded-lg px-4 py-2",
                  element.options?.buttonStyle === 'outline' 
                    ? "border-2 bg-transparent" 
                    : element.options?.buttonStyle === 'ghost'
                      ? "bg-transparent hover:bg-opacity-10"
                      : ""
                )}
                style={{
                  backgroundColor: element.options?.buttonStyle === 'solid' 
                    ? element.options?.backgroundColor 
                    : 'transparent',
                  borderColor: element.options?.buttonStyle !== 'ghost' 
                    ? element.options?.backgroundColor 
                    : 'transparent',
                  color: element.options?.buttonStyle === 'solid' 
                    ? element.options?.color 
                    : element.options?.backgroundColor,
                  borderRadius: `${element.options?.borderRadius || 8}px`,
                  width: element.options?.width || 'auto',
                  height: element.options?.height || 'auto',
                  fontSize: element.options?.fontSize ? `${element.options.fontSize}px` : '16px',
                  fontFamily: element.options?.fontName || 'Inter',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  ...(element.options?.hoverEffect && {
                    ':hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }
                  })
                }}
              >
                {element.content}
              </button>
            </div>
          ) : element.type === 'divider' ? (
            <div 
              className="outline-none focus:ring-2 focus:ring-violet-500/20"
              onClick={(e) => handleElementClick(element.id, e)}
              style={getElementStyles(element)}
            >
              <div
                style={{
                  width: `${element.options?.dividerWidth}%`,
                  height: `${element.options?.dividerHeight}px`,
                  backgroundColor: element.options?.dividerColor,
                  borderStyle: element.options?.dividerStyle,
                  margin: '0 auto'
                }}
              />
            </div>
          ) : element.type === 'footer' ? (
            <div 
              className="outline-none focus:ring-2 focus:ring-violet-500/20 rounded"
              onClick={(e) => handleElementClick(element.id, e)}
              style={{
                backgroundColor: element.backgroundColor,
                padding: element.options?.padding ? 
                  `${element.options.padding.top}px ${element.options.padding.right}px ${element.options.padding.bottom}px ${element.options.padding.left}px` : 
                  '32px 24px',
              }}
            >
              <div 
                className="grid gap-6"
                style={{
                  gridTemplateColumns: `repeat(${element.options?.footerColumns || 3}, 1fr)`,
                  gap: `${element.options?.footerGap || 24}px`
                }}
              >
                <div>
                  <h3 className="text-gray-900 font-semibold mb-4">{element.options?.companyInfo?.name || 'Tu Empresa'}</h3>
                  <div className="space-y-2">
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {element.options?.companyInfo?.email || 'info@tuempresa.com'}
                    </p>
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {element.options?.companyInfo?.phone || '+1 234 567 890'}
                    </p>
                    <p className="text-gray-600 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {element.options?.companyInfo?.address || 'Calle Principal #123'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-900 font-semibold mb-4">Síguenos</h3>
                  <div className="flex gap-4">
                    {Object.entries(element.options?.socialLinks || {}).map(([network, url]) => (
                      url && (
                        <a 
                          key={network}
                          href={url}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {network === 'facebook' && <Facebook className="w-5 h-5" />}
                          {network === 'twitter' && <Twitter className="w-5 h-5" />}
                          {network === 'instagram' && <Instagram className="w-5 h-5" />}
                          {network === 'linkedin' && <Linkedin className="w-5 h-5" />}
                          {network === 'website' && <Globe className="w-5 h-5" />}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              </div>
              {element.options?.unsubscribeLink && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-500 text-xs text-center">
                    {element.options.footerDisclaimer}
                    <br />
                    <a href={element.options.unsubscribeLink} className="text-violet-600 hover:text-violet-700">
                      Cancelar suscripción
                    </a>
                  </p>
                </div>
              )}
            </div>
          ) : element.type === 'bulletpoint' ? (
            <div 
              className="outline-none focus:ring-2 focus:ring-violet-500/20 rounded-lg overflow-hidden"
              onClick={(e) => handleElementClick(element.id, e)}
              style={getElementStyles(element)}
            >
              <div
                style={{
                  padding: `${element.options?.padding?.top || 16}px ${element.options?.padding?.right || 16}px ${element.options?.padding?.bottom || 16}px ${element.options?.padding?.left || 16}px`,
                  backgroundColor: element.options?.backgroundColor || 'transparent',
                  borderRadius: `${element.options?.borderRadius || 8}px`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${element.options?.gap || 16}px`,
                  }}
                >
                  {element.options?.items?.map((item, index) => (
                    <div 
                      key={index} 
                      className="group relative flex items-start gap-3"
                    >
                      <div
                        style={{
                          width: `${element.options?.bulletSize || 16}px`,
                          height: `${element.options?.bulletSize || 16}px`,
                          minWidth: `${element.options?.bulletSize || 16}px`,
                          borderRadius: element.options?.bulletStyle === 'square' ? '0' : '50%',
                          backgroundColor: element.options?.bulletStyle === 'circle' ? 'transparent' : element.options?.bulletColor || '#6366F1',
                          border: element.options?.bulletStyle === 'circle' ? `2px solid ${element.options?.bulletColor || '#6366F1'}` : 'none',
                          marginTop: '0.25em'
                        }}
                      />
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        className="flex-1 outline-none min-h-[1em] focus:ring-2 focus:ring-violet-500/20 rounded px-2 py-1 -m-1"
                        style={{
                          color: element.options?.color || '#1F2937',
                          fontSize: `${element.options?.fontSize || 16}px`,
                          lineHeight: `${element.options?.lineHeight || 1.5}em`,
                          fontFamily: element.options?.fontName || 'Inter',
                          fontWeight: element.options?.fontWeight || 400,
                        }}
                        onBlur={(e) => {
                          const newItems = [...(element.options?.items || [])];
                          newItems[index] = e.currentTarget.textContent || '';
                          updateElement(element.id, {
                            options: { ...element.options, items: newItems }
                          });
                        }}
                      >
                        {item}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newItems = element.options?.items?.filter((_, i) => i !== index);
                          updateElement(element.id, {
                            options: { ...element.options, items: newItems }
                          });
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-500 transition-all absolute right-0 top-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newItems = [...(element.options?.items || []), `Nuevo item ${(element.options?.items?.length || 0) + 1}`];
                      updateElement(element.id, {
                        options: { ...element.options, items: newItems }
                      });
                    }}
                    className="w-full px-4 py-2 bg-violet-50 text-violet-600 rounded-lg text-sm hover:bg-violet-100 transition-colors mt-2"
                  >
                    Agregar item
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              contentEditable
              suppressContentEditableWarning
              className="outline-none min-h-[1em] focus:ring-2 focus:ring-violet-500/20 rounded p-4"
              style={getElementStyles(element)}
              onBlur={(e) => updateElementContent(element.id, e.currentTarget.textContent || '')}
              onClick={(e) => handleElementClick(element.id, e)}
            >
              {element.content}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );

  // Panel de configuración para columnas
  const renderColumnSettings = (element: EmailElement) => {
    if (element.type !== 'columns') return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-2">Número de columnas</label>
          <input
            type="number"
            min="1"
            max="4"
            value={element.columns || 2}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if (!isNaN(value)) {
                updateElement(element.id, {
                  columns: Math.max(1, Math.min(4, value))
                });
              }
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Espaciado entre columnas</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="48"
              value={element.gap || 16}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) {
                  updateElement(element.id, {
                    gap: Math.max(0, Math.min(48, value))
                  });
                }
              }}
              className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
            />
            <span className="text-sm text-gray-500">px</span>
          </div>
        </div>
      </div>
    );
  };

  const renderButtonSettings = (element: EmailElement) => {
    if (element.type !== 'button') return null;

    return (
      <div className="space-y-6">
        {/* Contenido del botón */}
        <div>
          <label className="text-sm font-medium block mb-2">Contenido</label>
          <input
            type="text"
            value={element.content}
            onChange={(e) => updateElementContent(element.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="Texto del botón"
          />
        </div>

        {/* URL del botón */}
        <div>
          <label className="text-sm font-medium block mb-2">URL del enlace</label>
          <input
            type="url"
            value={element.options?.href || ''}
            onChange={(e) => updateElement(element.id, {
              options: { ...element.options, href: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            placeholder="https://"
          />
        </div>

        {/* Dimensiones */}
        <div>
          <label className="text-sm font-medium block mb-2">Dimensiones</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Ancho</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  value={element.options?.width || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateElement(element.id, {
                      options: { 
                        ...element.options, 
                        width: value === '' ? 'auto' : value 
                      }
                    });
                  }}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                  placeholder="auto, 100%, 200px"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Alto</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text"
                  value={element.options?.height || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateElement(element.id, {
                      options: { 
                        ...element.options, 
                        height: value === '' ? 'auto' : value 
                      }
                    });
                  }}
                  className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                  placeholder="auto, 50px"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Estilo del botón */}
        <div>
          <label className="text-sm font-medium block mb-2">Estilo del botón</label>
          <select
            value={element.options?.buttonStyle || 'solid'}
            onChange={(e) => updateElement(element.id, {
              options: { ...element.options, buttonStyle: e.target.value as 'solid' | 'outline' | 'ghost' }
            })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="solid">Sólido</option>
            <option value="outline">Contorno</option>
            <option value="ghost">Transparente</option>
          </select>
        </div>

        {/* Tipografía */}
        <div>
          <label className="text-sm font-medium block mb-2">Tipografía</label>
          <div className="space-y-3">
            <select 
              className="w-full border border-gray-200 rounded-lg p-2 text-sm"
              value={element.options?.fontName || 'Inter'}
              onChange={(e) => updateElement(element.id, {
                options: { ...element.options, fontName: e.target.value }
              })}
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Arial">Arial</option>
            </select>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tamaño</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="8"
                    max="72"
                    value={element.options?.fontSize || 16}
                    onChange={(e) => updateElement(element.id, {
                      options: { ...element.options, fontSize: Math.max(8, Math.min(72, parseInt(e.target.value) || 16)) }
                    })}
                    className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                  />
                  <span className="text-sm text-gray-500">px</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Peso</label>
                <select
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm"
                  value={element.options?.fontWeight || 400}
                  onChange={(e) => updateElement(element.id, {
                    options: { ...element.options, fontWeight: parseInt(e.target.value) }
                  })}
                >
                  <option value="300">Light</option>
                  <option value="400">Regular</option>
                  <option value="500">Medium</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Colores */}
        <div>
          <label className="text-sm font-medium block mb-2">Colores</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Color del texto</label>
              <input
                type="color"
                value={element.options?.color || '#FFFFFF'}
                onChange={(e) => updateElementStyle(element.id, { color: e.target.value })}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Color de fondo</label>
              <input
                type="color"
                value={element.options?.backgroundColor || '#6366F1'}
                onChange={(e) => updateElementStyle(element.id, { backgroundColor: e.target.value })}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Bordes */}
        <div>
          <label className="text-sm font-medium block mb-2">Bordes</label>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Radio de borde</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={element.options?.borderRadius || 8}
                  onChange={(e) => updateElement(element.id, {
                    options: { ...element.options, borderRadius: parseInt(e.target.value) }
                  })}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={element.options?.borderRadius || 8}
                  onChange={(e) => updateElement(element.id, {
                    options: { ...element.options, borderRadius: parseInt(e.target.value) }
                  })}
                  className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Espaciado interno */}
        <div>
          <label className="text-sm font-medium block mb-2">Espaciado interno</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Horizontal</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  min="4"
                  max="48"
                  value={element.options?.padding?.left || 16}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    updateElementPadding(element.id, {
                      left: value,
                      right: value
                    });
                  }}
                  className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Vertical</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  min="4"
                  max="48"
                  value={element.options?.padding?.top || 8}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    updateElementPadding(element.id, {
                      top: value,
                      bottom: value
                    });
                  }}
                  className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alineación */}
        <div>
          <label className="text-sm font-medium block mb-2">Alineación</label>
          <div className="flex gap-2">
            {[
              { icon: AlignLeft, value: 'left' as const },
              { icon: AlignCenter, value: 'center' as const },
              { icon: AlignRight, value: 'right' as const }
            ].map(({ icon: Icon, value }) => (
              <button
                key={value}
                onClick={() => updateElement(element.id, { 
                  options: {
                    ...element.options,
                    alignment: value
                  }
                })}
                className={cn(
                  "p-2 rounded-lg border border-gray-200 transition-colors flex-1",
                  element.options?.alignment === value
                    ? "bg-violet-50 border-violet-200 text-violet-600"
                    : "hover:bg-gray-50 text-gray-600"
                )}
              >
                <Icon className="w-4 h-4 mx-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Efectos al pasar el mouse */}
        <div>
          <label className="text-sm font-medium block mb-2">Efectos al pasar el mouse</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={element.options?.hoverEffect || false}
                onChange={(e) => updateElement(element.id, {
                  options: { ...element.options, hoverEffect: e.target.checked }
                })}
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700">Activar efecto hover</span>
            </label>
          </div>
        </div>

        {/* Alineación del botón */}
        <div>
          <label className="text-sm font-medium block mb-2">Alineación del botón</label>
          <div className="flex gap-2">
            {[
              { icon: AlignLeft, value: 'left' as const },
              { icon: AlignCenter, value: 'center' as const },
              { icon: AlignRight, value: 'right' as const }
            ].map(({ icon: Icon, value }) => (
              <button
                key={value}
                onClick={() => {
                  // Add null check for selectedElement
                  if (selectedElement) { 
                    updateElement(selectedElement, { 
                      options: {
                        ...elements.find(el => el.id === selectedElement)?.options,
                        buttonAlignment: value
                      }
                    })
                  }
                }}
                className={cn(
                  "p-2 rounded-lg border border-gray-200 transition-colors flex-1",
                  elements.find(el => el.id === selectedElement)?.options?.buttonAlignment === value
                    ? "bg-violet-50 border-violet-200 text-violet-600"
                    : "hover:bg-gray-50 text-gray-600"
                )}
              >
                <Icon className="w-4 h-4 mx-auto" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDividerSettings = (element: EmailElement) => {
    if (element.type !== 'divider') return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium block mb-2">Estilo de línea</label>
          <select
            value={element.options?.dividerStyle || 'solid'}
            onChange={(e) => updateElement(element.id, {
              options: { ...element.options, dividerStyle: e.target.value as 'solid' | 'dashed' | 'dotted' }
            })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="solid">Sólida</option>
            <option value="dashed">Guiones</option>
            <option value="dotted">Puntos</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Color</label>
          <input
            type="color"
            value={element.options?.dividerColor || '#E5E7EB'}
            onChange={(e) => updateElement(element.id, {
              options: { ...element.options, dividerColor: e.target.value }
            })}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Ancho</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="10"
              max="100"
              value={element.options?.dividerWidth || 100}
              onChange={(e) => updateElement(element.id, {
                options: { ...element.options, dividerWidth: parseInt(e.target.value) }
              })}
              className="flex-1"
            />
            <input
              type="number"
              value={element.options?.dividerWidth || 100}
              onChange={(e) => updateElement(element.id, {
                options: { ...element.options, dividerWidth: parseInt(e.target.value) }
              })}
              className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium block mb-2">Altura</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="20"
              value={element.options?.dividerHeight || 1}
              onChange={(e) => updateElement(element.id, {
                options: { ...element.options, dividerHeight: parseInt(e.target.value) }
              })}
              className="flex-1"
            />
            <input
              type="number"
              value={element.options?.dividerHeight || 1}
              onChange={(e) => updateElement(element.id, {
                options: { ...element.options, dividerHeight: parseInt(e.target.value) }
              })}
              className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
            />
            <span className="text-sm text-gray-500">px</span>
          </div>
        </div>
      </div>
    );
  };

  const renderFooterSettings = (element: EmailElement) => {
    if (element.type !== 'footer') return null;

    return (
      <div className="space-y-6">
        {/* Estilo del footer */}
        <div>
          <label className="text-sm font-medium block mb-2">Estilo del footer</label>
          <select
            value={element.options?.footerStyle || 'columns'}
            onChange={(e) => updateElement(element.id, {
              options: { ...element.options, footerStyle: e.target.value as 'simple' | 'columns' | 'social' }
            })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="simple">Simple</option>
            <option value="columns">Columnas</option>
            <option value="social">Social</option>
          </select>
        </div>

        {/* Información de la empresa */}
        <div>
          <label className="text-sm font-medium block mb-2">Información de la empresa</label>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nombre de la empresa"
              value={element.options?.companyInfo?.name || ''}
              onChange={(e) => updateElement(element.id, {
                options: {
                  ...element.options,
                  companyInfo: {
                    ...element.options?.companyInfo,
                    name: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="email"
              placeholder="Email"
              value={element.options?.companyInfo?.email || ''}
              onChange={(e) => updateElement(element.id, {
                options: {
                  ...element.options,
                  companyInfo: {
                    ...element.options?.companyInfo,
                    email: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={element.options?.companyInfo?.phone || ''}
              onChange={(e) => updateElement(element.id, {
                options: {
                  ...element.options,
                  companyInfo: {
                    ...element.options?.companyInfo,
                    phone: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Dirección"
              value={element.options?.companyInfo?.address || ''}
              onChange={(e) => updateElement(element.id, {
                options: {
                  ...element.options,
                  companyInfo: {
                    ...element.options?.companyInfo,
                    address: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Redes sociales */}
        <div>
          <label className="text-sm font-medium block mb-2">Redes sociales</label>
          <div className="space-y-3">
            <input
              type="url"
              placeholder="Facebook URL"
              value={element.options?.socialLinks?.facebook || ''}
              onChange={(e) => updateElement(element.id, {
                options: {
                  ...element.options,
                  socialLinks: {
                    ...element.options?.socialLinks,
                    facebook: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="url"
              placeholder="Twitter URL"
              value={element.options?.socialLinks?.twitter || ''}
              onChange={(e) => updateElement(element.id, {
                options: {
                  ...element.options,
                  socialLinks: {
                    ...element.options?.socialLinks,
                    twitter: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="url"
              placeholder="Instagram URL"
              value={element.options?.socialLinks?.instagram || ''}
              onChange={(e) => updateElement(element.id, {
                options: {
                  ...element.options,
                  socialLinks: {
                    ...element.options?.socialLinks,
                    instagram: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="url"
              placeholder="LinkedIn URL"
              value={element.options?.socialLinks?.linkedin || ''}
              onChange={(e) => updateElement(element.id, {
                options: {
                  ...element.options,
                  socialLinks: {
                    ...element.options?.socialLinks,
                    linkedin: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="url"
              placeholder="Sitio web URL"
              value={element.options?.socialLinks?.website || ''}
              onChange={(e) => updateElement(element.id, {
                options: {
                  ...element.options,
                  socialLinks: {
                    ...element.options?.socialLinks,
                    website: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Texto legal y cancelación */}
        <div>
          <label className="text-sm font-medium block mb-2">Texto legal y cancelación</label>
          <div className="space-y-3">
            <textarea
              placeholder="Texto legal/disclaimer"
              value={element.options?.footerDisclaimer || ''}
              onChange={(e) => updateElement(element.id, {
                options: {
                  ...element.options,
                  footerDisclaimer: e.target.value
                }
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[80px]"
            />
            <input
              type="url"
              placeholder="URL de cancelación de suscripción"
              value={element.options?.unsubscribeLink || ''}
              onChange={(e) => updateElement(element.id, {
                options: {
                  ...element.options,
                  unsubscribeLink: e.target.value
                }
              })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Color de fondo */}
        <div>
          <label className="text-sm font-medium block mb-2">Color de fondo</label>
          <input
            type="color"
            value={element.backgroundColor || '#f5f5f5'}
            onChange={(e) => updateElement(element.id, {
              backgroundColor: e.target.value
            })}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        {/* Espaciado interno */}
        <div>
          <label className="text-sm font-medium block mb-2">Espaciado interno</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Horizontal</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  min="8"
                  max="48"
                  value={element.options?.padding?.left || 24}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    updateElementPadding(element.id, {
                      left: value,
                      right: value
                    });
                  }}
                  className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Vertical</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number"
                  min="8"
                  max="48"
                  value={element.options?.padding?.top || 32}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    updateElementPadding(element.id, {
                      top: value,
                      bottom: value
                    });
                  }}
                  className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                />
                <span className="text-sm text-gray-500">px</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const saveTemplate = async () => {
    try {
      setIsSaving(true);
      console.log('💾 Guardando plantilla - Estado actual:', { isEditing, templateId });
      
      const templateData: EmailTemplate = {
        name: templateName || 'Plantilla sin nombre',
        elements,
        editorSettings,
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user-test'
      };

      if (isEditing && templateId) {
        console.log('🔄 Actualizando plantilla existente');
        // Actualizar plantilla existente
        await TemplatesService.updateTemplate({
          ...templateData,
          id: templateId
        });
        customToast.success({
          title: "¡Plantilla Actualizada!",
          description: "Los cambios se han guardado correctamente en la plantilla.",
        });
      } else {
        console.log('➕ Creando nueva plantilla');
        // Crear nueva plantilla
        await TemplatesService.saveTemplate(templateData);
        customToast.success({
          title: "¡Plantilla Creada!",
          description: "La nueva plantilla se ha creado exitosamente.",
        });
      }
      
    } catch (error) {
      console.error('Error al guardar la plantilla:', error);
      customToast.error({
        title: "Error al Guardar",
        description: "No se pudo guardar la plantilla. Por favor, intenta nuevamente.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderBulletpointSettings = (element: EmailElement) => {
    if (element.type !== 'bulletpoint') return null;

    return (
      <div className="space-y-6">
        {/* Estilo de viñeta */}
        <div>
          <label className="text-sm font-medium block mb-2">Estilo de viñeta</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'disc', label: 'Círculo relleno' },
              { value: 'circle', label: 'Círculo vacío' },
              { value: 'square', label: 'Cuadrado' }
            ].map(style => (
              <button
                key={style.value}
                onClick={() => updateElement(element.id, {
                  options: { ...element.options, bulletStyle: style.value as 'disc' | 'circle' | 'square' }
                })}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  element.options?.bulletStyle === style.value
                    ? "border-violet-500 bg-violet-50"
                    : "border-gray-200 hover:border-violet-200 hover:bg-violet-50"
                )}
              >
                <div className="flex flex-col items-center gap-2">
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: style.value === 'square' ? '0' : '50%',
                      backgroundColor: style.value === 'circle' ? 'transparent' : '#6366F1',
                      border: style.value === 'circle' ? '2px solid #6366F1' : 'none'
                    }}
                  />
                  <span className="text-xs font-medium">{style.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Color de viñeta */}
        <div>
          <label className="text-sm font-medium block mb-2">Color de viñeta</label>
          <input
            type="color"
            value={element.options?.bulletColor || '#6366F1'}
            onChange={(e) => updateElement(element.id, {
              options: { ...element.options, bulletColor: e.target.value }
            })}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>

        {/* Tamaño de viñeta */}
        <div>
          <label className="text-sm font-medium block mb-2">Tamaño de viñeta</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="8"
              max="24"
              value={element.options?.bulletSize || 16}
              onChange={(e) => updateElement(element.id, {
                options: { ...element.options, bulletSize: parseInt(e.target.value) }
              })}
              className="flex-1"
            />
            <input
              type="number"
              value={element.options?.bulletSize || 16}
              onChange={(e) => updateElement(element.id, {
                options: { ...element.options, bulletSize: parseInt(e.target.value) }
              })}
              className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
            />
            <span className="text-sm text-gray-500">px</span>
          </div>
        </div>

        {/* Espaciado entre items */}
        <div>
          <label className="text-sm font-medium block mb-2">Espaciado entre items</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="4"
              max="32"
              value={element.options?.gap || 16}
              onChange={(e) => updateElement(element.id, {
                options: { ...element.options, gap: parseInt(e.target.value) }
              })}
              className="flex-1"
            />
            <input
              type="number"
              value={element.options?.gap || 16}
              onChange={(e) => updateElement(element.id, {
                options: { ...element.options, gap: parseInt(e.target.value) }
              })}
              className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
            />
            <span className="text-sm text-gray-500">px</span>
          </div>
        </div>

        {/* Tipografía */}
        <div>
          <label className="text-sm font-medium block mb-2">Tipografía</label>
          <div className="space-y-4">
            <select 
              className="w-full border border-gray-200 rounded-lg p-2 text-sm"
              value={element.options?.fontName || 'Inter'}
              onChange={(e) => updateElement(element.id, {
                options: { ...element.options, fontName: e.target.value }
              })}
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Arial">Arial</option>
            </select>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tamaño</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="12"
                    max="24"
                    value={element.options?.fontSize || 16}
                    onChange={(e) => updateElement(element.id, {
                      options: { ...element.options, fontSize: parseInt(e.target.value) }
                    })}
                    className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                  />
                  <span className="text-sm text-gray-500">px</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Peso</label>
                <select
                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm"
                  value={element.options?.fontWeight || 400}
                  onChange={(e) => updateElement(element.id, {
                    options: { ...element.options, fontWeight: parseInt(e.target.value) }
                  })}
                >
                  <option value="300">Light</option>
                  <option value="400">Regular</option>
                  <option value="500">Medium</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Color del texto */}
        <div>
          <label className="text-sm font-medium block mb-2">Color del texto</label>
          <input
            type="color"
            value={element.options?.color || '#1F2937'}
            onChange={(e) => updateElement(element.id, {
              options: { ...element.options, color: e.target.value }
            })}
            className="w-full h-10 rounded cursor-pointer"
          />
        </div>
      </div>
    );
  };

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b bg-white sticky top-0 z-50">
          <div className="px-4">
            <div className="h-14 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/emails/templates" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <ArrowLeft className="w-4 h-4 text-gray-500" />
                </Link>
                <div className="flex items-center gap-2">
                  <h1 className="text-base">{isEditing ? 'Editando /' : 'Draft /'}</h1>
                  <input 
                    type="text" 
                    placeholder="Nombre de la plantilla"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="text-base font-medium focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowSendDialog(true)}
                  className="px-3 py-1.5 text-sm text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar correo
                </button>
                <button 
                  onClick={saveTemplate}
                  disabled={isSaving}
                  className={cn(
                    "px-3 py-1.5 text-sm text-white rounded-lg transition-colors",
                    isSaving 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-violet-600 hover:bg-violet-700"
                  )}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{isEditing ? 'Actualizando...' : 'Guardando...'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      <span>{isEditing ? 'Actualizar plantilla' : 'Guardar plantilla'}</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="px-4 h-10 flex items-center justify-between border-t">
            <div className="flex items-center gap-4">
              <button className={cn(
                "px-3 py-1 text-sm rounded-lg transition-colors",
                "text-violet-600 bg-violet-50"
              )}>
                Desktop
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Mobile
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Panel izquierdo */}
          <div className={cn(
            "w-72 border-r bg-white h-[calc(100vh-96px)] overflow-y-auto flex-shrink-0",
            !showLeftPanel && "hidden"
          )}>
            <div className="p-4">
              <div className="space-y-4">
                {componentCategories.map((category, categoryIndex) => (
                  <Droppable 
                    key={category.title} 
                    droppableId={`components-${categoryIndex}`}
                    isDropDisabled={true}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <h2 className="text-sm font-medium mb-2">{category.title}</h2>
                        <div className="grid grid-cols-3 gap-2">
                          {category.items.map((component, index) => (
                            <Draggable
                              key={`${categoryIndex}-${component.id}`}
                              draggableId={`${categoryIndex}-${component.id}`}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all duration-200",
                                    snapshot.isDragging 
                                      ? "bg-violet-50 border-violet-200 shadow-lg" 
                                      : "border-gray-200 hover:border-violet-200 hover:bg-violet-50"
                                  )}
                                >
                                  <component.icon className="w-5 h-5 text-gray-600" />
                                  <span className="text-xs text-gray-600">{component.label}</span>
                                </div>
                              )}
                            </Draggable>
                          ))}
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </div>
          </div>

          {/* Área de edición */}
          <div className="flex-1 bg-gray-50 h-[calc(100vh-96px)] overflow-y-auto">
            <Droppable droppableId="editor">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-full p-4 md:p-8"
                >
                  <div
                    style={{
                      maxWidth: `${editorSettings.contentMaxWidth}px`,
                      margin: '0 auto',
                      backgroundColor: editorSettings.contentBackground,
                      padding: `${editorSettings.contentPadding}px`,
                      borderRadius: `${editorSettings.contentBorderRadius}px`,
                      width: '100%',
                      minHeight: 'calc(100vh - 160px)',
                    }}
                    className={cn(
                      "relative transition-all duration-200 shadow-sm",
                      snapshot.isDraggingOver && "ring-2 ring-violet-500/20"
                    )}
                  >
                    {elements.length === 0 && !snapshot.isDraggingOver && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <Plus className="w-8 h-8 mb-2" />
                        <p className="text-sm">Arrastra elementos aquí</p>
                      </div>
                    )}
                    {elements.map((element, index) => 
                      renderElement(element, index)
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          </div>

          {/* Panel derecho */}
          <div className={cn(
            "w-80 border-l bg-white h-[calc(100vh-96px)] overflow-y-auto flex-shrink-0",
            !showRightPanel && "hidden"
          )}>
            <div className="p-4">
              {selectedElement ? (
                <div className="space-y-6">
                  {/* Título del elemento */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-medium">
                      {elements.find(el => el.id === selectedElement)?.type === 'image' ? 'Picture' : 'Main Message'}
                    </h2>
                    <span className="text-sm text-gray-500">21</span>
                  </div>

                  {elements.find(el => el.id === selectedElement)?.type === 'image' ? (
                    <div className="space-y-4">
                      {(() => {
                        // Find element once
                        const currentElement = elements.find(el => el.id === selectedElement);
                        if (!currentElement || currentElement.type !== 'image') return null;
                        const currentPadding = currentElement.options?.padding ?? defaultPadding;
                        const borderRadius = currentElement.options?.borderRadius ?? 0;

                        return (
                          <>
                            <div>
                              <label className="text-sm font-medium block mb-2">Imagen</label>
                              <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex flex-col gap-2">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id={`image-settings-${selectedElement}`}
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file && selectedElement) { // Add null check here too
                                        try {
                                          console.log('📤 Subiendo imagen...');
                                          const imageUrl = await TemplatesService.uploadImage(file);
                                          console.log('✅ Imagen subida:', imageUrl);
                                          
                                          const elementToUpdate = elements.find(el => el.id === selectedElement);
                                          console.log('📝 Elemento actual:', elementToUpdate);
                                          
                                          const updatedOptions = {
                                            ...elementToUpdate?.options,
                                            imageUrl,
                                            type: 'image'
                                          };
                                          console.log('📝 Opciones actualizadas:', updatedOptions);
                                          
                                          updateElement(selectedElement, { 
                                            options: updatedOptions
                                          });
                                          
                                          console.log('✅ Elemento actualizado');
                                        } catch (error) {
                                          console.error('❌ Error al subir la imagen:', error);
                                          alert('Error al subir la imagen');
                                        }
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`image-settings-${selectedElement}`}
                                    className="w-full px-4 py-2 bg-violet-50 text-violet-600 rounded-lg text-sm text-center hover:bg-violet-100 cursor-pointer"
                                  >
                                    Cambiar imagen
                                  </label>
                                  {currentElement.options?.imageUrl && (
                                    <button 
                                      onClick={() => updateElement(selectedElement!, { // Use non-null assertion as selectedElement is checked
                                        options: {
                                          ...currentElement.options,
                                          imageUrl: undefined
                                        }
                                      })}
                                      className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100"
                                    >
                                      Eliminar imagen
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-2">Bordes redondeados</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="range"
                                  min="0"
                                  max="32"
                                  value={borderRadius} // Use variable
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                      updateElementStyle(selectedElement!, { borderRadius: Math.max(0, Math.min(32, value)) });
                                    }
                                  }}
                                  className="flex-1"
                                />
                                <input 
                                  type="number"
                                  value={borderRadius} // Use variable
                                  onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      if (!isNaN(value)) {
                                        updateElementStyle(selectedElement!, { borderRadius: Math.max(0, Math.min(32, value)) });
                                      }
                                  }}
                                  className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
                                />
                                <span className="text-sm text-gray-500">px</span>
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium block mb-2">Espaciado</label>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <input 
                                    type="number"
                                    value={currentPadding.left} // Use variable
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      if (!isNaN(value)) {
                                        updateElementPadding(selectedElement!, { left: Math.max(0, value) });
                                      }
                                    }}
                                    min="0"
                                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                                  />
                                  <label className="text-xs text-gray-500 mt-1 block">Izquierda</label>
                                </div>
                                <div>
                                  <input 
                                    type="number"
                                    value={currentPadding.right} // Use variable
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      if (!isNaN(value)) {
                                        updateElementPadding(selectedElement!, { right: Math.max(0, value) });
                                      }
                                    }}
                                    min="0"
                                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                                  />
                                  <label className="text-xs text-gray-500 mt-1 block">Derecha</label>
                                </div>
                                <div>
                                  <input 
                                    type="number"
                                    value={currentPadding.top} // Use variable
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      if (!isNaN(value)) {
                                        updateElementPadding(selectedElement!, { top: Math.max(0, value) });
                                      }
                                    }}
                                    min="0"
                                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                                  />
                                  <label className="text-xs text-gray-500 mt-1 block">Arriba</label>
                                </div>
                                <div>
                                  <input 
                                    type="number"
                                    value={currentPadding.bottom} // Use variable
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value);
                                      if (!isNaN(value)) {
                                        updateElementPadding(selectedElement!, { bottom: Math.max(0, value) });
                                      }
                                    }}
                                    min="0"
                                    className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                                  />
                                  <label className="text-xs text-gray-500 mt-1 block">Abajo</label>
                                </div>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : elements.find(el => el.id === selectedElement)?.type === 'footer' ? (
                    renderFooterSettings(elements.find(el => el.id === selectedElement)!)
                  ) : elements.find(el => el.id === selectedElement)?.type === 'button' ? (
                    renderButtonSettings(elements.find(el => el.id === selectedElement)!)
                  ) : elements.find(el => el.id === selectedElement)?.type === 'divider' ? (
                    renderDividerSettings(elements.find(el => el.id === selectedElement)!)
                  ) : elements.find(el => el.id === selectedElement)?.type === 'bulletpoint' ? (
                    renderBulletpointSettings(elements.find(el => el.id === selectedElement)!)
                  ) : (
                    <>
                      {/* Configuraciones específicas para texto */}
                      <div className="space-y-6">
                        {/* Estilo de texto */}
                        <div>
                          <label className="text-sm font-medium block mb-2">Estilo de texto</label>
                          <select 
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                            value={elements.find(el => el.id === selectedElement)?.options?.type || 'text'}
                            onChange={(e) => updateElement(selectedElement, { 
                              options: {
                                ...elements.find(el => el.id === selectedElement)?.options,
                                type: e.target.value
                              }
                            })}
                          >
                            <option value="h1">Encabezado 1</option>
                            <option value="h2">Encabezado 2</option>
                            <option value="h3">Encabezado 3</option>
                            <option value="h4">Encabezado 4</option>
                            <option value="h5">Encabezado 5</option>
                            <option value="h6">Encabezado 6</option>
                            <option value="paragraph">Párrafo</option>
                            <option value="quote">Cita</option>
                          </select>
                        </div>

                        {/* Tipografía */}
                        <div>
                          <label className="text-sm font-medium block mb-2">Tipografía</label>
                          <div className="space-y-3">
                            <select 
                              className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                              value={elements.find(el => el.id === selectedElement)?.options?.fontName ?? 'Inter'}
                              onChange={(e) => updateElement(selectedElement, { 
                                options: {
                                  ...elements.find(el => el.id === selectedElement)?.options,
                                  fontName: e.target.value
                                }
                              })}
                            >
                              <option value="Inter">Inter</option>
                              <option value="Roboto">Roboto</option>
                              <option value="Helvetica">Helvetica</option>
                              <option value="Arial">Arial</option>
                            </select>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Tamaño</label>
                                <div className="flex items-center gap-2">
                                  <input 
                                    type="number"
                                    min="8"
                                    max="72"
                                    value={elements.find(el => el.id === selectedElement)?.options?.fontSize ?? 16}
                                    onChange={(e) => updateElement(selectedElement, { 
                                      options: {
                                        ...elements.find(el => el.id === selectedElement)?.options,
                                        fontSize: Math.max(8, Math.min(72, parseInt(e.target.value) || 16))
                                      }
                                    })}
                                    className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                                  />
                                  <span className="text-sm text-gray-500">px</span>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 mb-1 block">Peso</label>
                                <select
                                  className="w-full border border-gray-200 rounded px-2 py-1 text-sm"
                                  value={elements.find(el => el.id === selectedElement)?.options?.fontWeight ?? 400}
                                  onChange={(e) => updateElement(selectedElement, { 
                                    options: {
                                      ...elements.find(el => el.id === selectedElement)?.options,
                                      fontWeight: parseInt(e.target.value)
                                    }
                                  })}
                                >
                                  <option value="300">Light</option>
                                  <option value="400">Regular</option>
                                  <option value="500">Medium</option>
                                  <option value="600">Semibold</option>
                                  <option value="700">Bold</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Espaciado */}
                        <div>
                          <label className="text-sm font-medium block mb-2">Espaciado</label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Altura de línea</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  min="1"
                                  max="3"
                                  step="0.1"
                                  value={elements.find(el => el.id === selectedElement)?.options?.lineHeight ?? 1.5}
                                  onChange={(e) => updateElement(selectedElement, { 
                                    options: {
                                      ...elements.find(el => el.id === selectedElement)?.options,
                                      lineHeight: Math.max(1, Math.min(3, parseFloat(e.target.value) || 1.5))
                                    }
                                  })}
                                  className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                                />
                                <span className="text-sm text-gray-500">em</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Espaciado entre letras</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number"
                                  min="-2"
                                  max="10"
                                  step="0.5"
                                  value={elements.find(el => el.id === selectedElement)?.options?.letterSpacing ?? 0}
                                  onChange={(e) => updateElement(selectedElement, { 
                                    options: {
                                      ...elements.find(el => el.id === selectedElement)?.options,
                                      letterSpacing: Math.max(-2, Math.min(10, parseFloat(e.target.value) || 0))
                                    }
                                  })}
                                  className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                                />
                                <span className="text-sm text-gray-500">px</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Transformación de texto */}
                        <div>
                          <label className="text-sm font-medium block mb-2">Transformación</label>
                          <select
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                            value={elements.find(el => el.id === selectedElement)?.options?.textTransform ?? 'none'}
                            onChange={(e) => updateElement(selectedElement, { 
                              options: {
                                ...elements.find(el => el.id === selectedElement)?.options,
                                textTransform: e.target.value as 'none' | 'uppercase' | 'lowercase' | 'capitalize'
                              }
                            })}
                          >
                            <option value="none">Normal</option>
                            <option value="uppercase">MAYÚSCULAS</option>
                            <option value="lowercase">minúsculas</option>
                            <option value="capitalize">Capitalizar</option>
                          </select>
                        </div>

                        {/* Formato */}
                        <div>
                          <label className="text-sm font-medium block mb-2">Formato</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const element = elements.find(el => el.id === selectedElement);
                                if (element?.options) {
                                  updateElementStyle(selectedElement, { 
                                    fontWeight: element.options.fontWeight === 700 ? 400 : 700
                                  });
                                }
                              }}
                              className={cn(
                                "p-2 rounded-lg border border-gray-200 transition-colors flex-1",
                                elements.find(el => el.id === selectedElement)?.options?.fontWeight === 700
                                  ? "bg-violet-50 border-violet-200 text-violet-600"
                                  : "hover:bg-gray-50 text-gray-600"
                              )}
                            >
                              B
                            </button>
                            <button
                              onClick={() => {
                                const element = elements.find(el => el.id === selectedElement);
                                if (element?.options) {
                                  updateElementStyle(selectedElement, { 
                                    fontStyle: element.options.fontStyle === 'italic' ? 'normal' : 'italic'
                                  });
                                }
                              }}
                              className={cn(
                                "p-2 rounded-lg border border-gray-200 transition-colors flex-1",
                                elements.find(el => el.id === selectedElement)?.options?.fontStyle === 'italic'
                                  ? "bg-violet-50 border-violet-200 text-violet-600"
                                  : "hover:bg-gray-50 text-gray-600"
                              )}
                            >
                              I
                            </button>
                            <button
                              onClick={() => {
                                const element = elements.find(el => el.id === selectedElement);
                                if (element?.options) {
                                  updateElementStyle(selectedElement, { 
                                    textDecoration: element.options.textDecoration === 'underline' ? 'none' : 'underline'
                                  });
                                }
                              }}
                              className={cn(
                                "p-2 rounded-lg border border-gray-200 transition-colors flex-1",
                                elements.find(el => el.id === selectedElement)?.options?.textDecoration === 'underline'
                                  ? "bg-violet-50 border-violet-200 text-violet-600"
                                  : "hover:bg-gray-50 text-gray-600"
                              )}
                            >
                              U
                            </button>
                            <button
                              onClick={() => {
                                const element = elements.find(el => el.id === selectedElement);
                                if (element?.options) {
                                  updateElementStyle(selectedElement, { 
                                    textDecoration: element.options.textDecoration === 'line-through' ? 'none' : 'line-through'
                                  });
                                }
                              }}
                              className={cn(
                                "p-2 rounded-lg border border-gray-200 transition-colors flex-1",
                                elements.find(el => el.id === selectedElement)?.options?.textDecoration === 'line-through'
                                  ? "bg-violet-50 border-violet-200 text-violet-600"
                                  : "hover:bg-gray-50 text-gray-600"
                              )}
                            >
                              S
                            </button>
                          </div>
                        </div>

                        {/* Alineación */}
                        <div>
                          <label className="text-sm font-medium block mb-2">Alineación</label>
                          <div className="flex gap-2">
                            {[
                              { icon: AlignLeft, value: 'left' as const },
                              { icon: AlignCenter, value: 'center' as const },
                              { icon: AlignRight, value: 'right' as const },
                              { icon: AlignJustify, value: 'justify' as const }
                            ].map(({ icon: Icon, value }) => (
                              <button
                                key={value}
                                onClick={() => updateElement(selectedElement, { 
                                  options: {
                                    ...elements.find(el => el.id === selectedElement)?.options,
                                    alignment: value
                                  }
                                })}
                                className={cn(
                                  "p-2 rounded-lg border border-gray-200 transition-colors flex-1",
                                  elements.find(el => el.id === selectedElement)?.options?.alignment === value
                                    ? "bg-violet-50 border-violet-200 text-violet-600"
                                    : "hover:bg-gray-50 text-gray-600"
                                )}
                              >
                                <Icon className="w-4 h-4 mx-auto" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color y fondo */}
                        <div>
                          <label className="text-sm font-medium block mb-2">Color y fondo</label>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Color de texto</label>
                              <input 
                                type="color"
                                value={elements.find(el => el.id === selectedElement)?.options?.color || '#000000'}
                                onChange={(e) => updateElementStyle(selectedElement, { color: e.target.value })}
                                className="w-full h-10 rounded cursor-pointer"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Color de fondo</label>
                              <input 
                                type="color"
                                value={elements.find(el => el.id === selectedElement)?.options?.backgroundColor || '#ffffff'}
                                onChange={(e) => updateElementStyle(selectedElement, { backgroundColor: e.target.value })}
                                className="w-full h-10 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Selecciona un elemento para ver sus opciones
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Send Email Dialog */}
      <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <AlertDialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-sm border-none shadow-2xl">
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
                        {templateName}
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
                          {recipients.filter(recipient => {
                            const searchLower = searchRecipientQuery.toLowerCase();
                            return (
                              recipient.email.toLowerCase().includes(searchLower) ||
                              recipient.firstName?.toLowerCase().includes(searchLower) ||
                              recipient.lastName?.toLowerCase().includes(searchLower)
                            );
                          }).map((recipient) => {
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
                                      const newSelectedRecipients = e.target.checked
                                        ? [...selectedRecipients, recipient.id]
                                        : selectedRecipients.filter(id => id !== recipient.id);
                                      setSelectedRecipients(newSelectedRecipients);
                                    }}
                                    className="sr-only peer"
                                  />
                                  <div 
                                    onClick={() => {
                                      if (!recipient.id) return;
                                      const newSelectedRecipients = isSelected
                                        ? selectedRecipients.filter(id => id !== recipient.id)
                                        : [...selectedRecipients, recipient.id];
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
                                    const newSelectedRecipients = isSelected
                                      ? selectedRecipients.filter(id => id !== recipient.id)
                                      : [...selectedRecipients, recipient.id];
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
                        
                        {recipients.length === 0 && (
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
                            {selectedRecipients.length} de {recipients.length} destinatarios seleccionados
                          </span>
                          {selectedRecipients.length > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                              {Math.round((selectedRecipients.length / recipients.length) * 100)}%
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
        </AlertDialogContent>
      </AlertDialog>
    </DragDropContext>
  );
} 