import { Module } from '@nestjs/common';
import { CompaniesParametersOptionsController } from './companiesParametersOptions.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompaniesParametersOptions } from './companiesParametersOptions.model';
import { CompaniesParametersOptionsService } from './companiesParametersOptions.service';

@Module({
  providers: [CompaniesParametersOptionsService],
  controllers: [CompaniesParametersOptionsController],
  imports: [SequelizeModule.forFeature([CompaniesParametersOptions])],
  exports: [CompaniesParametersOptionsService],
})
export class CompaniesParametersOptionsModule {}
