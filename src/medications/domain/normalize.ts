import { RawMedicationRow } from '../interfaces/medication-parser.interface';
import { Medication } from './medication.entity';

/**
 * Normaliza linhas cruas do parser: aplica trim, remove espacos
 * duplicados e deduplica por (produto, indicacao, ean) - a lista
 * oficial repete o mesmo EAN quando ha mais de um fabricante para
 * o mesmo principio ativo, mas nao repete a combinacao completa.
 */
export function normalizeMedications(
  rows: RawMedicationRow[],
  sourceMonth: string,
): Medication[] {
  const seen = new Set<string>();
  const result: Medication[] = [];

  for (const row of rows) {
    const medication: Medication = {
      product: collapseWhitespace(row.product),
      indication: collapseWhitespace(row.indication),
      ean: row.ean.trim(),
      sourceMonth,
    };

    const dedupeKey = `${medication.product}|${medication.indication}|${medication.ean}`;
    if (seen.has(dedupeKey)) continue;

    seen.add(dedupeKey);
    result.push(medication);
  }

  return result;
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}
