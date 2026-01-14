import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';
import { Orders } from './orders.model';

@Controller('orders')
export class OrdersController {
  constructor(private orderService: OrdersService) {}

  @Post('add')
  @Roles('ADMIN', 'WORKER')
  @UseGuards(RolesGuard)
  addNewOrder(
    @User() user: UserModel | undefined,
    @Body() param: Record<string, string | Record<number | string, number>>,
  ): Promise<Orders | null> {
    return this.orderService.addNew({ user, param });
  }

  @Get('fromActiveShift')
  @Roles('ADMIN', 'WORKER')
  @UseGuards(RolesGuard)
  fromActiveShift(
    @User() user: UserModel | undefined,
  ): Promise<Orders[] | null> {
    return this.orderService.fromActiveShift({ user });
  }

  @Post('delete')
  @Roles('ADMIN', 'WORKER')
  @UseGuards(RolesGuard)
  deleteOrder(
    @User() user: UserModel | undefined,
    @Body() param: { id: number },
  ): Promise<boolean> {
    return this.orderService.delete({ user, id: param.id });
  }
}
