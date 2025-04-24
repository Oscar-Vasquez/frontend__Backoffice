import { type ClassValue, clsx } from "clsx";
import { Metadata } from "next";
import { twMerge } from "tailwind-merge";
import * as d3 from "d3-color";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateAvatarFallback(string: string) {
  const names = string.split(" ").filter((name: string) => name);
  const mapped = names.map((name: string) => name.charAt(0).toUpperCase());

  return mapped.join("");
}

export function formatDate(date: string | Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };

  return new Date(date).toLocaleDateString('es-ES', options);
}

export function formatInvoiceDate(date: string | Date): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function generateMeta({
  title,
  description,
  canonical
}: {
  title: string;
  description: string;
  canonical: string;
}): Metadata {
  const baseUrlString = process.env.BASE_URL || 'http://localhost:3000';
  const dashboardBaseUrlString = process.env.DASHBOARD_BASE_URL || baseUrlString;
  const ogImageUrl = `${dashboardBaseUrlString}/seo.jpg`;

  let metadataBase: URL | undefined;
  try {
    metadataBase = new URL(baseUrlString);
  } catch (e) {
    console.warn(`Invalid BASE_URL during build: ${baseUrlString}. Falling back.`);
    metadataBase = new URL('http://localhost:3000');
  }

  return {
    title: `${title} - Dashboard`,
    description: description,
    metadataBase: metadataBase,
    alternates: {
      canonical: `/dashboard${canonical}`
    },
    openGraph: {
      images: [ogImageUrl]
    }
  };
}

export function getHSLValue(hex: string): string {
  return d3.color(hex)!.formatHsl().slice(4, -1).replaceAll(",", "");
}

export const formatCurrency = (amount: number | string) => {
  if (amount === null || amount === undefined) return 'US$ 0.00';
  
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return 'US$ 0.00';
  
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(numericAmount);
};
