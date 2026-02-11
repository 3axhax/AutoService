import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrdersService } from './orders.service';
import { Orders } from './orders.model';
import { OrdersOptionValues } from './ordersOptionValues.model';
import { OrderParametersModule } from '../orderParameters/orderParameters.module';
import { ShiftsModule } from '../shifts/shifts.module';
import { PriceModule } from '../price/price.module';
import { DownloadExcelModule } from '../downloadExcel/downloadExcel.module';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  imports: [
    SequelizeModule.forFeature([Orders, OrdersOptionValues]),
    OrderParametersModule,
    ShiftsModule,
    PriceModule,
    DownloadExcelModule,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
