import { Injectable } from '@nestjs/common';
import { Medication } from '../domain/medication.entity';

/**
 * Cache em memoria do resultado ja parseado de cada mes. A lista
 * oficial so muda mensalmente, entao nao ha necessidade de
 * reparsear o PDF a cada requisicao.
 *
 * Troca facil por um cache persistente (arquivo/Redis) depois,
 * mantendo a mesma interface get/set.
 */
@Injectable()
export class MedicationCacheService {
  private readonly cache = new Map<string, Medication[]>();

  get(monthKey: string): Medication[] | undefined {
    return this.cache.get(monthKey);
  }

  set(monthKey: string, medications: Medication[]): void {
    this.cache.set(monthKey, medications);
  }

  has(monthKey: string): boolean {
    return this.cache.has(monthKey);
  }

  clear(monthKey?: string): void {
    if (monthKey) {
      this.cache.delete(monthKey);
    } else {
      this.cache.clear();
    }
  }
}
