import { Module } from '@nestjs/common';
import { PriceController } from './price.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Price } from './price.model';
import { PriceService } from './price.service';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';
import { PriceParametersOptionConditions } from './priceParametersOptionConditions.model';
import { OrderParametersModule } from '../orderParameters/orderParameters.module';

@Module({
  providers: [PriceService],
  controllers: [PriceController],
  imports: [
    SequelizeModule.forFeature([
      Price,
      OrderParametersOptions,
      PriceParametersOptionConditions,
    ]),
    OrderParametersModule,
  ],
  exports: [PriceService],
})
export class PriceModule {}
