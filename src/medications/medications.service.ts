import { Injectable } from '@nestjs/common';
import { SourceFactory } from './sources/source.factory';
import { ParserFactory } from './parsers/parser.factory';
import { MedicationCacheService } from './cache/medication-cache.service';
import { normalizeMedications } from './domain/normalize';
import { Medication } from './domain/medication.entity';
import { MonthReference, parseMonthReference } from '../common/month-reference.util';

export interface GetMedicationListOptions {
  /** Sobrescreve a origem HTTP por um arquivo local (testes/reprocessamento). */
  localFilePath?: string;
}

@Injectable()
export class MedicationsService {
  constructor(
    private readonly sourceFactory: SourceFactory,
    private readonly parserFactory: ParserFactory,
    private readonly cache: MedicationCacheService,
  ) {}

  async getMedicationList(
    monthRaw: string,
    options: GetMedicationListOptions = {},
  ): Promise<Medication[]> {
    const reference = parseMonthReference(monthRaw);

    const cached = this.cache.get(reference.key);
    if (cached && !options.localFilePath) {
      return cached;
    }

    const medications = await this.fetchAndParse(reference, options);
    this.cache.set(reference.key, medications);
    return medications;
  }

  async checkEan(
    ean: string,
    monthRaw: string,
  ): Promise<{ inProgram: boolean; medication?: Medication }> {
    const medications = await this.getMedicationList(monthRaw);
    const medication = medications.find((item) => item.ean === ean);

    return medication ? { inProgram: true, medication } : { inProgram: false };
  }

  listSupportedVersions() {
    return this.parserFactory.listVersions();
  }

  private async fetchAndParse(
    reference: MonthReference,
    options: GetMedicationListOptions,
  ): Promise<Medication[]> {
    const source = this.sourceFactory.create({
      reference,
      localFilePath: options.localFilePath,
    });
    const parser = this.parserFactory.create(reference);

    const pdfBuffer = await source.fetch();
    const rawRows = await parser.parse(pdfBuffer);

    return normalizeMedications(rawRows, reference.key);
  }
}
