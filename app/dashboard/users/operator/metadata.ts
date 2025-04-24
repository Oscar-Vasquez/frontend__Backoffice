import { generateMeta } from "@/lib/utils";

export function generateMetadata() {
  return generateMeta({
    title: "Grupos de Usuarios",
    description: "Gestión de usuarios y permisos del sistema",
    canonical: "/dashboard/users/operator"
  });
} 