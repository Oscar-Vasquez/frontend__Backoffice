"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { customToast } from "@/app/components/ui/custom-toast";
import { useRouter } from "next/navigation";

// ID de compañía que queremos usar
const COMPANY_ID = "ea4af179-bfe1-4c6d-ad21-1c836377ff84";

interface Branch {
  id: string;
  name: string;
  address: string;
  province: string;
  phone: string;
  isActive: boolean;
}

interface BranchFormData {
  name: string;
  address: string;
  province: string;
  phone: string;
  isActive: boolean;
}

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
  onSuccess: () => void;
}

export function BranchDialog({ open, onOpenChange, branch, onSuccess }: BranchDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    address: '',
    province: '',
    phone: '',
    isActive: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name || '',
        address: branch.address || '',
        province: branch.province || '',
        phone: branch.phone || '',
        isActive: branch.isActive ?? true
      });
    } else {
      // Inicializar con valores vacíos
      setFormData({
        name: '',
        address: '',
        province: '',
        phone: '',
        isActive: true
      });
    }
    // Clear errors when dialog opens with new data
    setErrors({});
  }, [branch, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    
    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria";
    }
    
    if (!formData.province.trim()) {
      newErrors.province = "La provincia es obligatoria";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "El formato del teléfono no es válido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      // Obtener la URL base de la API
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error("La URL de la API no está configurada");
      }
      
      // Solo enviar los campos estándar que espera el modelo Prisma
      const requestData = {
        name: formData.name,
        address: formData.address,
        province: formData.province,
        phone: formData.phone,
        is_active: formData.isActive,
        // No incluimos company_id ya que el backend lo sobrescribe
      };
      
      // URL para la operación actual (crear o actualizar)
      const url = branch
        ? `${baseUrl}/branches/${branch.id}`
        : `${baseUrl}/branches`;
        
      console.log('📤 Enviando solicitud a:', url);
      console.log('📦 Datos de la solicitud:', requestData);

      // Enviar la solicitud
      const response = await fetch(url, {
        method: branch ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('workexpress_token')}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('📥 Estado de la respuesta:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Error en la respuesta de la API:', errorData);
        
        // Proporcionar información detallada sobre el error
        let errorMsg = errorData.message || `Error al ${branch ? 'actualizar' : 'crear'} la sucursal`;
        
        if (errorData.message && errorData.message.includes('Foreign key constraint violated: `fk_branches_company')) {
          errorMsg += ". El backend está intentando usar un company_id que no existe en la base de datos. Por favor, contacta al administrador para configurar DEFAULT_COMPANY_ID en el backend o crear una compañía con ID 00000000-0000-0000-0000-000000000000.";
        }
        
        throw new Error(errorMsg);
      }

      const responseData = await response.json();
      console.log('✅ Datos de la respuesta:', responseData);
      
      customToast.success({
        title: branch ? "Sucursal Actualizada" : "Sucursal Creada",
        description: branch ? "La sucursal se actualizó correctamente" : "La sucursal se creó correctamente"
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Error:', error);
      customToast.error({
        title: "Error",
        description: error instanceof Error ? error.message : `No se pudo ${branch ? 'actualizar' : 'crear'} la sucursal`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!loading) {
        onOpenChange(isOpen);
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{branch ? 'Editar Sucursal' : 'Nueva Sucursal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              className={errors.name ? "border-destructive" : ""}
              required
            />
            {errors.name && <p className="text-sm font-medium text-destructive">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address" className={errors.address ? "text-destructive" : ""}>Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, address: e.target.value }));
                if (errors.address) {
                  setErrors(prev => ({ ...prev, address: '' }));
                }
              }}
              className={errors.address ? "border-destructive" : ""}
              required
            />
            {errors.address && <p className="text-sm font-medium text-destructive">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="province" className={errors.province ? "text-destructive" : ""}>Provincia</Label>
            <Input
              id="province"
              value={formData.province}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, province: e.target.value }));
                if (errors.province) {
                  setErrors(prev => ({ ...prev, province: '' }));
                }
              }}
              className={errors.province ? "border-destructive" : ""}
              required
            />
            {errors.province && <p className="text-sm font-medium text-destructive">{errors.province}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className={errors.phone ? "text-destructive" : ""}>Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, phone: e.target.value }));
                if (errors.phone) {
                  setErrors(prev => ({ ...prev, phone: '' }));
                }
              }}
              className={errors.phone ? "border-destructive" : ""}
              required
            />
            {errors.phone && <p className="text-sm font-medium text-destructive">{errors.phone}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Sucursal Activa</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : branch ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 