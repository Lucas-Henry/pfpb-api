import PDFDocument from 'pdfkit';
import { createWriteStream } from 'fs';

const rows: Array<[string, string, string]> = [
  ['GLIBENCLAMIDA 5MG', 'DIABETES', '7896862910556'],
  ['GLIBENCLAMIDA 5MG', 'DIABETES', '7896714266695'],
  ['DAPAGLIFLOZINA 10 MG', 'DIABETES MELLITUS + DOENCA CARDIOVASCULAR', '5000456028554'],
  ['DAPAGLIFLOZINA 10 MG', 'DIABETES MELLITUS + DOENCA CARDIOVASCULAR', '5000456028561'],
  ['DAPAGLIFLOZINA 10 MG', 'DIABETES MELLITUS + DOENCA CARDIOVASCULAR', '5000456070416'],
];

const doc = new PDFDocument({ size: 'A4', margin: 40 });
doc.pipe(createWriteStream(__dirname + '/test-lista.pdf'));

doc.fontSize(10);
doc.text('PRODUTO', 40, 40);
doc.text('INDICACAO', 260, 40);
doc.text('CODIGO DE BARRAS', 460, 40);

let y = 70;
for (const [index, [product, indication, ean]] of rows.entries()) {
  // Forca a quebra de linha so na primeira linha (largura estreita),
  // como acontece de forma inconsistente no PDF oficial.
  const indicationWidth = index === 0 ? 90 : 190;

  doc.text(product, 40, y);
  doc.text(indication, 260, y, { width: indicationWidth });
  doc.text(ean, 460, y);
  y += 30;
}

doc.end();
