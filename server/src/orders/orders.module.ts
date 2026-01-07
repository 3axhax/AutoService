import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrdersService } from './orders.service';
import { Orders } from './orders.model';
import { OrdersOptionValues } from './ordersOptionValues.model';
import { OrderParametersModule } from '../orderParameters/orderParameters.module';

@Module({
  providers: [OrdersService],
  controllers: [OrdersController],
  imports: [
    SequelizeModule.forFeature([Orders, OrdersOptionValues]),
    OrderParametersModule,
  ],
  exports: [OrdersService],
})
export class OrdersModule {}
