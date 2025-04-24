import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tipos de Operadores | WorkExpress Dashboard",
  description: "Gestión de tipos de operadores en el sistema WorkExpress",
};

export default function OperatorTypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-slate-50 to-zinc-50">
      {children}
    </div>
  );
} 