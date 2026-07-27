import { promises as fs } from 'fs';
import { NotFoundException } from '@nestjs/common';
import { MedicationSource } from '../interfaces/medication-source.interface';

/**
 * Fonte que le um PDF ja existente em disco. Util para testes
 * automatizados e para reprocessar um PDF baixado manualmente,
 * sem depender de rede.
 */
export class LocalFileMedicationSource implements MedicationSource {
  constructor(private readonly filePath: string) {}

  async fetch(): Promise<Buffer> {
    try {
      return await fs.readFile(this.filePath);
    } catch {
      throw new NotFoundException(`Arquivo PDF nao encontrado: ${this.filePath}`);
    }
  }

  describe(): string {
    return `local:${this.filePath}`;
  }
}
