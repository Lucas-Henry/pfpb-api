/**
 * Representa uma origem capaz de fornecer os bytes brutos do PDF
 * da lista de medicamentos do PFPB para um determinado mes/ano.
 *
 * Implementacoes possiveis: download via HTTP (gov.br) ou leitura
 * de um arquivo local (util para testes e para reprocessar PDFs
 * ja baixados).
 */
export interface MedicationSource {
  /** Busca o PDF e retorna seu conteudo bruto. */
  fetch(): Promise<Buffer>;

  /** Identificador legivel da origem, usado em logs e cache. */
  describe(): string;
}
