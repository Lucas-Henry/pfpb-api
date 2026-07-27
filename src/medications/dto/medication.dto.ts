import { ApiProperty } from '@nestjs/swagger';

export class MedicationDto {
  @ApiProperty({
    description: 'Nome do produto conforme publicado na lista oficial do PFPB.',
    example: 'CLORIDRATO DE METFORMINA 850MG',
  })
  product: string;

  @ApiProperty({
    description: 'Indicação terapêutica associada ao produto.',
    example: 'DIABETES',
  })
  indication: string;

  @ApiProperty({
    description: 'Código de barras (EAN) do produto, como string para preservar zeros à esquerda.',
    example: '7891721238246',
  })
  ean: string;

  @ApiProperty({
    description: 'Mês/ano de referência do PDF de onde este item foi extraído, no formato YYYY-MM.',
    example: '2026-06',
  })
  sourceMonth: string;
}
