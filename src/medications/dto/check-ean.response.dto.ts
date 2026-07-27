import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicationDto } from './medication.dto';

export class CheckEanResponseDto {
  @ApiProperty({
    description: 'Indica se o código de barras consultado faz parte do Programa Farmácia Popular no mês de referência.',
    example: true,
  })
  inProgram: boolean;

  @ApiPropertyOptional({
    description: 'Detalhes do medicamento, presente apenas quando inProgram é true.',
    type: MedicationDto,
  })
  medication?: MedicationDto;
}
