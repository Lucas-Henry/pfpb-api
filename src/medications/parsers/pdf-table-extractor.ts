export interface PositionedTextItem {
  text: string;
  x: number;
  y: number;
  page: number;
}

export interface TableRow {
  page: number;
  y: number;
  /** Celulas na ordem em que aparecem da esquerda para a direita. */
  cells: string[];
}

interface Cell {
  text: string;
  startX: number;
  endX: number;
}

interface InternalRow {
  page: number;
  y: number;
  cells: Cell[];
}

const ROW_Y_TOLERANCE = 3; // px de tolerancia para agrupar itens na mesma linha
const COLUMN_GAP_THRESHOLD = 8; // px de espaco horizontal para considerar nova coluna
const CONTINUATION_X_TOLERANCE = 15; // px de tolerancia para casar uma linha de continuacao com sua coluna

/**
 * Extrai todo o texto de um PDF preservando a posicao (x, y) de
 * cada fragmento, e agrupa os fragmentos em linhas/colunas por
 * proximidade geometrica. E a base reutilizavel para qualquer
 * parser de layout tabular do PFPB.
 */
export class PdfTableExtractor {
  async extractRows(pdfBuffer: Buffer): Promise<TableRow[]> {
    const items = await this.extractPositionedText(pdfBuffer);
    const rows = this.groupIntoRows(items);
    const merged = this.mergeContinuationRows(rows);

    return merged.map((row) => ({
      page: row.page,
      y: row.y,
      cells: row.cells.map((cell) => cell.text),
    }));
  }

  private async extractPositionedText(pdfBuffer: Buffer): Promise<PositionedTextItem[]> {
    // O build "legacy" do pdfjs-dist so e distribuido como ESM (.mjs)
    // nesta versao; import() dinamico funciona em um projeto CommonJS.
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const document = await pdfjs.getDocument({ data: new Uint8Array(pdfBuffer) }).promise;
    const items: PositionedTextItem[] = [];

    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();

      for (const item of content.items as Array<{ str: string; transform: number[] }>) {
        const text = item.str.trim();
        if (!text) continue;

        const [, , , , x, y] = item.transform;
        items.push({ text, x, y, page: pageNumber });
      }
    }

    return items;
  }

  private groupIntoRows(items: PositionedTextItem[]): InternalRow[] {
    type PendingRow = { page: number; y: number; items: PositionedTextItem[] };
    const pendingRows: PendingRow[] = [];

    for (const item of items) {
      const existingRow = pendingRows.find(
        (row) => row.page === item.page && Math.abs(row.y - item.y) <= ROW_Y_TOLERANCE,
      );

      if (existingRow) {
        existingRow.items.push(item);
      } else {
        pendingRows.push({ page: item.page, y: item.y, items: [item] });
      }
    }

    // No sistema de coordenadas do PDF, y crescente = mais alto na pagina;
    // ordenamos por y decrescente para obter a ordem visual de leitura.
    pendingRows.sort((a, b) => (a.page !== b.page ? a.page - b.page : b.y - a.y));

    return pendingRows.map((row) => ({
      page: row.page,
      y: row.y,
      cells: this.mergeIntoCells(row.items),
    }));
  }

  /** Ordena os fragmentos por x e junta os que estao proximos (mesma coluna). */
  private mergeIntoCells(rowItems: PositionedTextItem[]): Cell[] {
    const sorted = [...rowItems].sort((a, b) => a.x - b.x);
    const cells: Cell[] = [];

    for (const item of sorted) {
      const lastCell = cells[cells.length - 1];
      const gap = lastCell ? item.x - lastCell.endX : Infinity;
      const estimatedWidth = item.text.length * 4.5; // estimativa de largura por caractere

      if (lastCell && gap <= COLUMN_GAP_THRESHOLD) {
        lastCell.text += ` ${item.text}`;
        lastCell.endX = Math.max(lastCell.endX, item.x + estimatedWidth);
      } else {
        cells.push({ text: item.text, startX: item.x, endX: item.x + estimatedWidth });
      }
    }

    for (const cell of cells) {
      cell.text = cell.text.replace(/\s+/g, ' ').trim();
    }

    return cells;
  }

  /**
   * Quando uma celula (geralmente a indicacao) quebra em mais de uma
   * linha dentro do PDF, a linha extra aparece como uma "linha" com
   * uma unica celula. Detectamos esse caso pela posicao x e anexamos
   * o texto na celula correspondente da linha de dados anterior, em
   * vez de trata-la como uma nova linha da tabela.
   */
  private mergeContinuationRows(rows: InternalRow[]): InternalRow[] {
    const merged: InternalRow[] = [];

    for (const row of rows) {
      const previous = merged[merged.length - 1];
      const isContinuationCandidate = row.cells.length === 1 && previous && previous.cells.length >= 2;

      if (isContinuationCandidate) {
        const continuationCell = row.cells[0];
        const targetCell = previous.cells.find(
          (cell) => Math.abs(cell.startX - continuationCell.startX) <= CONTINUATION_X_TOLERANCE,
        );

        if (targetCell) {
          targetCell.text = `${targetCell.text} ${continuationCell.text}`.trim();
          continue;
        }
      }

      merged.push(row);
    }

    return merged;
  }
}
