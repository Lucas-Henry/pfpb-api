import { Logger } from '@nestjs/common';
import { MedicationParser, RawMedicationRow } from '../interfaces/medication-parser.interface';
import { PdfTableExtractor, TableRow } from './pdf-table-extractor';

const EAN_PATTERN = /^\d{8,14}$/;
const HEADER_KEYWORDS = ['PRODUTO', 'INDICACAO', 'INDICAÇÃO', 'CODIGO', 'CÓDIGO', 'BARRAS'];

/**
 * Parser para o layout de PDF em uso desde 2024/2025: cada linha da
 * tabela tem exatamente 3 colunas -> [produto, indicacao, ean].
 * Se o Ministerio da Saude mudar esse layout, uma nova classe
 * (PfpbPdfParserV2) deve ser criada e registrada na version table,
 * sem alterar esta.
 */
export class PfpbPdfParserV1 implements MedicationParser {
  readonly version = 'pfpb-pdf-v1';

  private readonly logger = new Logger(PfpbPdfParserV1.name);
  private readonly extractor = new PdfTableExtractor();

  async parse(pdfBuffer: Buffer): Promise<RawMedicationRow[]> {
    const rows = await this.extractor.extractRows(pdfBuffer);
    const dataRows = rows.filter((row) => this.isDataRow(row));

    const parsed: RawMedicationRow[] = [];
    for (const row of dataRows) {
      const mapped = this.mapRow(row);
      if (mapped) {
        parsed.push(mapped);
      } else {
        this.logger.warn(`Linha ignorada (formato inesperado) na pagina ${row.page}: ${row.cells.join(' | ')}`);
      }
    }

    return parsed;
  }

  private isDataRow(row: TableRow): boolean {
    if (row.cells.length < 3) return false;
    const joined = row.cells.join(' ').toUpperCase();
    return !HEADER_KEYWORDS.some((keyword) => joined.includes(keyword));
  }

  private mapRow(row: TableRow): RawMedicationRow | null {
    // O EAN e sempre a ultima celula numerica da linha; produto e
    // indicacao ocupam as celulas anteriores (indicacao pode quebrar
    // em mais de uma celula quando o texto e longo, ex.: "DIABETES
    // MELLITUS + DOENCA CARDIOVASCULAR").
    const last = row.cells[row.cells.length - 1];
    if (!EAN_PATTERN.test(last)) return null;

    const [product, ...rest] = row.cells.slice(0, -1);
    if (!product || rest.length === 0) return null;

    return {
      product,
      indication: rest.join(' '),
      ean: last,
    };
  }
}
