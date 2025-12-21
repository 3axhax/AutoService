import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OrderParametersOptions } from './orderParametersOptions.model';

@Injectable()
export class OrderParametersOptionsService {
  constructor(
    @InjectModel(OrderParametersOptions)
    private orderParametersOptionsRepository: typeof OrderParametersOptions,
  ) {}

  async getAll(): Promise<OrderParametersOptions[] | null> {
    return this.orderParametersOptionsRepository.findAll();
  }
}
