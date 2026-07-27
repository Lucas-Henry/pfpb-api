import { readFileSync } from 'fs';
import { PfpbPdfParserV1 } from '../src/medications/parsers/pfpb-pdf-parser-v1';
import { normalizeMedications } from '../src/medications/domain/normalize';

async function main() {
  const pdfBuffer = readFileSync(__dirname + '/test-lista.pdf');
  const parser = new PfpbPdfParserV1();

  const rawRows = await parser.parse(pdfBuffer);
  console.log('Raw rows:', JSON.stringify(rawRows, null, 2));

  const normalized = normalizeMedications(rawRows, '2026-06');
  console.log('Normalized:', JSON.stringify(normalized, null, 2));
}

main();
