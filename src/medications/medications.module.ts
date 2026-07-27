import { Module } from '@nestjs/common';
import { MedicationsController } from './medications.controller';
import { MedicationsService } from './medications.service';
import { SourceFactory } from './sources/source.factory';
import { ParserFactory } from './parsers/parser.factory';
import { MedicationCacheService } from './cache/medication-cache.service';

@Module({
  controllers: [MedicationsController],
  providers: [MedicationsService, SourceFactory, ParserFactory, MedicationCacheService],
  exports: [MedicationsService],
})
export class MedicationsModule {}
