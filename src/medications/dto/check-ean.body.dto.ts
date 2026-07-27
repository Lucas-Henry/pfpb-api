import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CheckEanBodyDto {
  @ApiProperty({
    description: 'Código de barras (EAN) do produto.',
    example: '7891721238246',
  })
  @IsNotEmpty()
  ean: string;

  @ApiPropertyOptional({
    description:
      'Mês/ano de referência da lista, no formato YYYY-MM. Quando omitido, usa o mês atual.',
    example: '2026-06',
  })
  @IsOptional()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month deve estar no formato YYYY-MM, ex.: 2026-06',
  })
  month?: string;
}
