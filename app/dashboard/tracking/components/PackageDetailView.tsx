"use client";

import { PackageDetailView as ModularPackageDetailView } from './package-detail/PackageDetailView';

// Re-exportamos el componente modular con el mismo nombre para mantener la compatibilidad
export const PackageDetailView = ModularPackageDetailView;