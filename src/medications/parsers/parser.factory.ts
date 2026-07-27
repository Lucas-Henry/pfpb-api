import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MedicationParser } from '../interfaces/medication-parser.interface';
import { MonthReference } from '../../common/month-reference.util';
import { PARSER_VERSION_TABLE } from './version-table';

/**
 * Factory Method: dado um mes/ano, decide qual MedicationParser
 * deve interpretar o PDF daquele periodo. A decisao e por parametro
 * explicito (a version table), nao por deteccao automatica do
 * layout - mais simples e mais previsivel para este projeto.
 */
@Injectable()
export class ParserFactory {
  create(reference: MonthReference): MedicationParser {
    const applicable = PARSER_VERSION_TABLE
      .filter((entry) => entry.validFrom <= reference.key)
      .sort((a, b) => (a.validFrom < b.validFrom ? 1 : -1))[0];

    if (!applicable) {
      throw new InternalServerErrorException(
        `Nenhum parser cadastrado cobre o mes ${reference.key}. ` +
          `Adicione uma entrada em version-table.ts.`,
      );
    }

    return applicable.parser;
  }

  listVersions() {
    return PARSER_VERSION_TABLE.map((entry) => ({
      validFrom: entry.validFrom,
      version: entry.parser.version,
      notes: entry.notes,
    }));
  }
}
