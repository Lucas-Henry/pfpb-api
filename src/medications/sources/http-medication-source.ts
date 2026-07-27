import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { MedicationSource } from '../interfaces/medication-source.interface';
import { MonthReference, monthNamePtBr } from '../../common/month-reference.util';

const GOV_BR_BASE_URL =
  'https://www.gov.br/saude/pt-br/composicao/sectics/farmacia-popular/codigos-de-barras';

/**
 * Fonte que baixa o PDF oficial diretamente do gov.br.
 * A URL segue o padrao observado nas publicacoes do Ministerio
 * da Saude: .../codigos-de-barras/{ano}/lista-de-medicamentos-pfpb-ean-{mes}-{ano}.pdf
 */
export class HttpMedicationSource implements MedicationSource {
  private readonly logger = new Logger(HttpMedicationSource.name);

  constructor(private readonly reference: MonthReference) {}

  buildUrl(): string {
    const monthName = monthNamePtBr(this.reference);
    return `${GOV_BR_BASE_URL}/${this.reference.year}/lista-de-medicamentos-pfpb-ean-${monthName}-${this.reference.year}.pdf`;
  }

  async fetch(): Promise<Buffer> {
    const url = this.buildUrl();
    this.logger.log(`Baixando lista PFPB de ${url}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `Nao foi possivel baixar a lista PFPB para ${this.reference.key} (status ${response.status}). ` +
          `Verifique se o PDF para esse mes ja foi publicado em ${url}.`,
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  describe(): string {
    return `http:${this.reference.key}`;
  }
}
