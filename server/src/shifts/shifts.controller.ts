import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ShiftsService } from './shifts.service';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';

@Controller('shifts')
export class ShiftsController {
  constructor(private shiftsService: ShiftsService) {}

  @Get('getActive')
  @Roles('ADMIN', 'WORKER')
  @UseGuards(RolesGuard)
  getActiveShiftByUser(@User() user: UserModel | undefined) {
    return this.shiftsService.getActiveShiftByUser({ user });
  }

  @Get('closeAllActive')
  @Roles('ADMIN', 'WORKER')
  @UseGuards(RolesGuard)
  closeActiveShiftByUser(@User() user: UserModel | undefined) {
    return this.shiftsService.closeAllActiveShiftByUser({ user });
  }

  @Get('createActive')
  @Roles('ADMIN', 'WORKER')
  @UseGuards(RolesGuard)
  createActiveShiftByUser(@User() user: UserModel | undefined) {
    return this.shiftsService.createActiveShiftByUser({ user });
  }
}
