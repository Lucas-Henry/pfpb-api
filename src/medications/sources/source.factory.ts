import { Injectable } from '@nestjs/common';
import { MedicationSource } from '../interfaces/medication-source.interface';
import { HttpMedicationSource } from './http-medication-source';
import { LocalFileMedicationSource } from './local-file-medication-source';
import { MonthReference } from '../../common/month-reference.util';

export interface SourceRequest {
  reference: MonthReference;
  /** Caminho local opcional; quando presente, sobrepoe o download HTTP. */
  localFilePath?: string;
}

/**
 * Factory Method: isola o resto do pipeline da decisao de "de onde
 * vem o PDF". Hoje resolve entre HTTP (gov.br) e arquivo local; uma
 * terceira origem (ex.: um bucket S3 de PDFs arquivados) entraria
 * aqui sem tocar em MedicationsService.
 */
@Injectable()
export class SourceFactory {
  create(request: SourceRequest): MedicationSource {
    if (request.localFilePath) {
      return new LocalFileMedicationSource(request.localFilePath);
    }
    return new HttpMedicationSource(request.reference);
  }
}
