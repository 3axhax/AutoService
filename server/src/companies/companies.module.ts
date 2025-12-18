import { Module } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Companies } from './companies.model';
import { CompaniesService } from './companies.service';

@Module({
  providers: [CompaniesService],
  controllers: [CompaniesController],
  imports: [SequelizeModule.forFeature([Companies])],
  exports: [CompaniesService],
})
export class CompaniesModule {}
