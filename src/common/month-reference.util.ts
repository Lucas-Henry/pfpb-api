import { BadRequestException } from '@nestjs/common';

/** Nomes de mes em portugues, na ordem usada pelas URLs do gov.br. */
const PT_BR_MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'marco',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

export interface MonthReference {
  year: number;
  month: number; // 1-12
  key: string; // "YYYY-MM", usado como chave de cache e na version table
}

const MONTH_REFERENCE_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

/**
 * Converte uma string "YYYY-MM" (formato aceito pela API) em uma
 * MonthReference estruturada. Lanca BadRequestException se o
 * formato for invalido.
 */
export function parseMonthReference(raw: string): MonthReference {
  const match = MONTH_REFERENCE_PATTERN.exec(raw);
  if (!match) {
    throw new BadRequestException(
      `Referencia de mes invalida: "${raw}". Use o formato YYYY-MM, ex.: 2026-06.`,
    );
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  return { year, month, key: `${match[1]}-${match[2]}` };
}

/** Nome do mes em portugues (minusculo, sem acento), usado na URL do PDF. */
export function monthNamePtBr(reference: MonthReference): string {
  return PT_BR_MONTH_NAMES[reference.month - 1];
}

/** Chave "YYYY-MM" do mes atual, usada como default quando ?month nao e informado. */
export function currentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}
