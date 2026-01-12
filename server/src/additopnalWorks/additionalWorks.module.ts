import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdditionalWorks } from './additionalWorks.model';
import { AdditionalWorksService } from './additionalWorks.service';
import { ShiftsModule } from '../shifts/shifts.module';
import { AdditionalWorksController } from './additionalWorks.controller';

@Module({
  providers: [AdditionalWorksService],
  controllers: [AdditionalWorksController],
  imports: [SequelizeModule.forFeature([AdditionalWorks]), ShiftsModule],
  exports: [AdditionalWorksService],
})
export class AdditionalWorksModule {}
