import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função auxiliar para formatação de datas
export const formatDate = (dateStr: string, pattern = "dd/MM/yyyy") =>
  format(parseISO(dateStr), pattern, { locale: ptBR });
