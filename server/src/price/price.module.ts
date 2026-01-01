import { Module } from '@nestjs/common';
import { PriceController } from './price.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Price } from './price.model';
import { PriceService } from './price.service';
import { OrderParametersOptions } from '../orderParametersOptions/orderParametersOptions.model';
import { PriceParametersOptionConditions } from './priceParametersOptionConditions.model';

@Module({
  providers: [PriceService],
  controllers: [PriceController],
  imports: [
    SequelizeModule.forFeature([
      Price,
      OrderParametersOptions,
      PriceParametersOptionConditions,
    ]),
  ],
  exports: [PriceService],
})
export class PriceModule {}
