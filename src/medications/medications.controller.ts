import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MedicationsService } from './medications.service';
import { MedicationDto } from './dto/medication.dto';
import { ListMedicationsQueryDto } from './dto/list-medications.query.dto';
import { CheckEanResponseDto } from './dto/check-ean.response.dto';
import { currentMonthKey } from '../common/month-reference.util';

@ApiTags('medicamentos')
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Get()
  @ApiOperation({
    summary: 'Lista os medicamentos do Programa Farmácia Popular em um mês de referência',
    description:
      'Baixa (ou reaproveita do cache) a lista oficial do PFPB publicada em PDF pelo ' +
      'Ministério da Saúde e retorna os itens já normalizados.',
  })
  @ApiQuery({ name: 'month', required: false })
  @ApiResponse({ status: 200, type: [MedicationDto] })
  async list(@Query() query: ListMedicationsQueryDto): Promise<MedicationDto[]> {
    const month = query.month ?? currentMonthKey();
    return this.medicationsService.getMedicationList(month);
  }

  @Get('versions')
  @ApiOperation({
    summary: 'Lista as versões de parser cadastradas',
    description:
      'Introspecção da tabela de versionamento: a partir de qual mês cada parser passou a valer.',
  })
  async listVersions() {
    return this.medicationsService.listSupportedVersions();
  }

  @Get(':ean')
  @ApiOperation({
    summary: 'Verifica se um código de barras (EAN) está no Programa Farmácia Popular',
  })
  @ApiParam({ name: 'ean', description: 'Código de barras do produto.', example: '7891721238246' })
  @ApiQuery({ name: 'month', required: false })
  @ApiResponse({ status: 200, type: CheckEanResponseDto })
  async checkEan(
    @Param('ean') ean: string,
    @Query() query: ListMedicationsQueryDto,
  ): Promise<CheckEanResponseDto> {
    const month = query.month ?? currentMonthKey();
    return this.medicationsService.checkEan(ean, month);
  }
}
