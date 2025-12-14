import { Module } from '@nestjs/common';
import { OrderParametersController } from './orderParameters.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrderParameters } from './orderParameters.model';
import { OrderParametersService } from './orderParameters.service';

@Module({
  providers: [OrderParametersService],
  controllers: [OrderParametersController],
  imports: [SequelizeModule.forFeature([OrderParameters])],
  exports: [OrderParametersService],
})
export class OrderParametersModule {}
