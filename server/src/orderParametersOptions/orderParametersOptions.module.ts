import { Module } from '@nestjs/common';
import { OrderParametersOptionsController } from './orderParametersOptions.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderParametersOptions } from './orderParametersOptions.model';
import { OrderParametersOptionsService } from './orderParametersOptions.service';

@Module({
  providers: [OrderParametersOptionsService],
  controllers: [OrderParametersOptionsController],
  imports: [SequelizeModule.forFeature([OrderParametersOptions])],
  exports: [OrderParametersOptionsService],
})
export class OrderParametersOptionsModule {}
