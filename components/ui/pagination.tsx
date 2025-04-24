import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);

  // Si solo hay una página, no mostramos la paginación
  if (totalPages <= 1) {
    return null;
  }

  // Función para generar el array de páginas a mostrar
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    let pages: (number | "ellipsis")[] = [];

    if (totalPages <= maxPagesToShow) {
      // Si hay pocas páginas, mostramos todas
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Siempre mostramos la primera página
      pages.push(1);

      // Calculamos el rango de páginas alrededor de la página actual
      const leftBound = Math.max(2, currentPage - 1);
      const rightBound = Math.min(totalPages - 1, currentPage + 1);

      // Añadimos ellipsis si es necesario antes del rango
      if (leftBound > 2) {
        pages.push("ellipsis");
      }

      // Añadimos las páginas del rango
      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }

      // Añadimos ellipsis si es necesario después del rango
      if (rightBound < totalPages - 1) {
        pages.push("ellipsis");
      }

      // Siempre mostramos la última página
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex justify-center items-center space-x-1" aria-label="Pagination">
      {/* Botón Anterior */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 w-8"
        aria-label="Página anterior"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>

      {/* Números de página */}
      {pageNumbers.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <span key={`ellipsis-${index}`} className="px-2">
              <MoreHorizontalIcon className="h-4 w-4 text-muted-foreground" />
            </span>
          );
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page as number)}
            className={`h-8 w-8 ${
              currentPage === page
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
            aria-label={`Ir a la página ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        );
      })}

      {/* Botón Siguiente */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 w-8"
        aria-label="Página siguiente"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </nav>
  );
}
