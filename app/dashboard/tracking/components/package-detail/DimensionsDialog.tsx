"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Box, Ruler, ArrowLeftRight, ArrowUpDown, Loader2 } from 'lucide-react';
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

interface DimensionsFormData {
  length: number;
  width: number;
  height: number;
}

interface DimensionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dimensions: DimensionsFormData;
  isUpdating: boolean;
  onDimensionChange: (field: keyof DimensionsFormData) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

/**
 * Componente de diálogo para editar las dimensiones del paquete
 */
export const DimensionsDialog: React.FC<DimensionsDialogProps> = ({
  isOpen,
  onOpenChange,
  dimensions,
  isUpdating,
  onDimensionChange,
  onSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-5 w-5 text-blue-500" />
            <span>Editar Dimensiones</span>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }} className="grid gap-6 py-4">
          <div className="grid grid-cols-1 gap-6">
            {/* Largo */}
            <div className="space-y-2">
              <Label htmlFor="length" className="flex items-center gap-2">
                <Ruler className="h-4 w-4 text-gray-500" />
                <span>Largo (cm)</span>
              </Label>
              <div className="relative">
                <Input
                  id="length"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ingrese el largo en cm"
                  value={dimensions.length}
                  onChange={onDimensionChange('length')}
                  className="pr-12"
                  required
                  disabled={isUpdating}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                  cm
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                El largo del paquete en centímetros
              </p>
            </div>
            
            {/* Ancho */}
            <div className="space-y-2">
              <Label htmlFor="width" className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-gray-500" />
                <span>Ancho (cm)</span>
              </Label>
              <div className="relative">
                <Input
                  id="width"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ingrese el ancho en cm"
                  value={dimensions.width}
                  onChange={onDimensionChange('width')}
                  className="pr-12"
                  required
                  disabled={isUpdating}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                  cm
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                El ancho del paquete en centímetros
              </p>
            </div>
            
            {/* Alto */}
            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-gray-500" />
                <span>Alto (cm)</span>
              </Label>
              <div className="relative">
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Ingrese el alto en cm"
                  value={dimensions.height}
                  onChange={onDimensionChange('height')}
                  className="pr-12"
                  required
                  disabled={isUpdating}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                  cm
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                El alto del paquete en centímetros
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