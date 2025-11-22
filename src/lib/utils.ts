import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { format, parseISO } from "date-fns";
import { ptBR, enUS, es } from "date-fns/locale";
import type { Locale as AppLocale } from "@/lib/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateStr: string, pattern = "dd/MM/yyyy") =>
  format(parseISO(dateStr), pattern, { locale: ptBR });

export function resolveDateLocale(locale: AppLocale) {
  if (locale === "en") {
    return enUS;
  }
  if (locale === "es") {
    return es;
  }
  return ptBR;
}

export const formatDateWithLocale = (
  dateStr: string,
  pattern: string,
  locale: AppLocale
) => format(parseISO(dateStr), pattern, { locale: resolveDateLocale(locale) });
