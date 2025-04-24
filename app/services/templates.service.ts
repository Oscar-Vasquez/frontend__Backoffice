import { EmailTemplate } from '@/types/email-template';

export class TemplatesService {
  private static API_URL = 'http://localhost:3001/api/v1/firebase/database';

  private static convertDates(template: any): EmailTemplate {
    return {
      ...template,
      createdAt: template.createdAt ? 
        (template.createdAt._seconds ? new Date(template.createdAt._seconds * 1000) : new Date(template.createdAt)) 
        : new Date(),
      updatedAt: template.updatedAt ? 
        (template.updatedAt._seconds ? new Date(template.updatedAt._seconds * 1000) : new Date(template.updatedAt))
        : new Date()
    };
  }

  static async getTemplates(): Promise<EmailTemplate[]> {
    try {
      const response = await fetch(`${this.API_URL}/templates`);
      if (!response.ok) {
        throw new Error('Error al obtener las plantillas');
      }
      const templates = await response.json();
      return templates.map(this.convertDates);
    } catch (error) {
      console.error('Error en getTemplates:', error);
      throw error;
    }
  }

  static async getTemplateById(id: string): Promise<EmailTemplate> {
    try {
      console.log('🔍 Obteniendo plantilla por ID:', id);
      const response = await fetch(`${this.API_URL}/templates/${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener la plantilla');
      }
      const template = await response.json();
      console.log('📄 Plantilla obtenida del servidor:', template);
      const convertedTemplate = this.convertDates(template);
      console.log('📄 Plantilla convertida:', convertedTemplate);
      return convertedTemplate;
    } catch (error) {
      console.error('Error en getTemplateById:', error);
      throw error;
    }
  }

  static async saveTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    try {
      const response = await fetch(`${this.API_URL}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(template)
      });

      if (!response.ok) {
        throw new Error('Error al guardar la plantilla');
      }

      const savedTemplate = await response.json();
      return this.convertDates(savedTemplate);
    } catch (error) {
      console.error('Error en saveTemplate:', error);
      throw error;
    }
  }

  static async deleteTemplate(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_URL}/templates/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la plantilla');
      }
    } catch (error) {
      console.error('Error en deleteTemplate:', error);
      throw error;
    }
  }

  static async uploadImage(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.API_URL}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      return data.data.url;
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw error;
    }
  }

  static async updateTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    try {
      console.log('🔄 Actualizando plantilla:', template);
      const response = await fetch(`${this.API_URL}/templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(template)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la plantilla');
      }

      const updatedTemplate = await response.json();
      console.log('✅ Plantilla actualizada en el servidor:', updatedTemplate);
      const convertedTemplate = this.convertDates(updatedTemplate);
      console.log('✅ Plantilla convertida:', convertedTemplate);
      return convertedTemplate;
    } catch (error) {
      console.error('Error en updateTemplate:', error);
      throw error;
    }
  }
} 