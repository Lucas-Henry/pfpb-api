import { Module } from '@nestjs/common';
import { MedicationsModule } from './medications/medications.module';

@Module({
  imports: [MedicationsModule],
})
export class AppModule {}
