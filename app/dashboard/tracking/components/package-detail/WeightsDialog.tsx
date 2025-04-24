'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Scale, BarChart3, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface WeightFormData {
  weight: number;
  volumetricWeight: number;
}

interface WeightsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  weights: WeightFormData;
  isUpdating: boolean;
  onWeightChange: (field: keyof WeightFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

/**
 * Componente de diálogo para editar los pesos del paquete
 */
export const WeightsDialog: React.FC<WeightsDialogProps> = ({
  isOpen,
  onOpenChange,
  weights,
  isUpdating,
  onWeightChange,
  onSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-blue-500" />
            <span>Editar Pesos</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }} className="grid gap-6 py-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Peso Real */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-gray-500" />
                <span>Peso Real (kg)</span>
              </Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ingrese el peso real en kg"
                  value={weights.weight}
                  onChange={onWeightChange('weight')}
                  className="pr-12"
                  required
                  disabled={isUpdating}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                  kg
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                El peso real del paquete en kilogramos
              </p>
            </div>
            
            {/* Peso Volumétrico */}
            <div className="space-y-2">
              <Label htmlFor="volumetricWeight" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-500" />
                <span>Peso Volumétrico (kg)</span>
              </Label>
              <div className="relative">
                <Input
                  id="volumetricWeight"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ingrese el peso volumétrico en kg"
                  value={weights.volumetricWeight}
                  onChange={onWeightChange('volumetricWeight')}
                  className="pr-12"
                  required
                  disabled={isUpdating}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                  kg
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                El peso volumétrico calculado del paquete
              </p>
            </div>
          </div>
          
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={isUpdating}
              className="ml-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 