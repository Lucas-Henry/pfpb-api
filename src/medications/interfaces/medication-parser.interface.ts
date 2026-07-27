/**
 * Linha crua extraida do PDF, antes de qualquer normalizacao
 * (trim, dedupe, validacao de EAN).
 */
export interface RawMedicationRow {
  product: string;
  indication: string;
  ean: string;
}

/**
 * Estrategia de parsing de um PDF da lista PFPB para um conjunto
 * de linhas cruas. Cada versao de layout do PDF publicado pelo
 * Ministerio da Saude tem sua propria implementacao.
 */
export interface MedicationParser {
  parse(pdfBuffer: Buffer): Promise<RawMedicationRow[]>;

  /** Identificador da versao do parser, usado em logs e na rota de introspeccao. */
  readonly version: string;
}
