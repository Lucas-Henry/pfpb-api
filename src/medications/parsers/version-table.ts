import { MedicationParser } from '../interfaces/medication-parser.interface';
import { PfpbPdfParserV1 } from './pfpb-pdf-parser-v1';

export interface ParserVersionEntry {
  /** "YYYY-MM" a partir do qual esta versao de layout passou a valer. */
  validFrom: string;
  parser: MedicationParser;
  notes: string;
}

/**
 * Fonte da verdade de qual parser usar para cada mes. Atualize esta
 * tabela manualmente quando o Ministerio da Saude mudar o layout do
 * PDF - adicione uma nova entrada no topo com o mes em que a mudanca
 * comecou a valer; nao remova as entradas antigas, para continuar
 * conseguindo reprocessar PDFs antigos.
 */
export const PARSER_VERSION_TABLE: ParserVersionEntry[] = [
  {
    validFrom: '2024-01',
    parser: new PfpbPdfParserV1(),
    notes: 'Layout de 3 colunas (produto, indicacao, codigo de barras) em uso desde 2024.',
  },
];
