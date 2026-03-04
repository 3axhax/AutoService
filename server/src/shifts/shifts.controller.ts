import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ShiftsService } from './shifts.service';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';
import { GetShiftListDto } from './dto/shifts.dto';
import { UserRoleEnum } from '../roles/roles.types';

@Controller('shifts')
export class ShiftsController {
  constructor(private shiftsService: ShiftsService) {}

  @Get('getActive')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WORKER)
  @UseGuards(RolesGuard)
  getActiveShiftByUser(@User() user: UserModel | undefined) {
    return this.shiftsService.getActiveShiftByUser({ user });
  }

  @Get('closeAllActive')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WORKER)
  @UseGuards(RolesGuard)
  closeActiveShiftByUser(@User() user: UserModel | undefined) {
    return this.shiftsService.closeAllActiveShiftByUser({ user });
  }

  @Get('createActive')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WORKER)
  @UseGuards(RolesGuard)
  createActiveShiftByUser(@User() user: UserModel | undefined) {
    return this.shiftsService.createActiveShiftByUser({ user });
  }

  @Get('getList')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WORKER)
  @UseGuards(RolesGuard)
  getList(
    @User() user: UserModel | undefined,
    @Query() param: GetShiftListDto,
  ) {
    return this.shiftsService.getList({ user, param });
  }
}
