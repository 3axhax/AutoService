import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';
import { AdditionalWorksService } from './additionalWorks.service';
import { AdditionalWorks } from './additionalWorks.model';
import {
  AddNewAdditionalWorkDto,
  EditAdditionalWorkDto,
} from './dto/additionalWorks.dto';
import { UserRoleEnum } from '../roles/roles.types';

@Controller('additionalWorks')
export class AdditionalWorksController {
  constructor(private additionalWorksService: AdditionalWorksService) {}

  @Get('fromActiveShift')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WORKER)
  @UseGuards(RolesGuard)
  fromActiveShift(
    @User() user: UserModel | undefined,
  ): Promise<AdditionalWorks[] | null> {
    return this.additionalWorksService.fromActiveShift({ user });
  }

  @Post('add')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WORKER)
  @UseGuards(RolesGuard)
  addAdditionalWork(
    @User() user: UserModel | undefined,
    @Body() param: AddNewAdditionalWorkDto,
  ): Promise<AdditionalWorks | null> {
    return this.additionalWorksService.addNew({ user, param });
  }

  @Post('edit')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WORKER)
  @UseGuards(RolesGuard)
  editAdditionalWork(
    @User() user: UserModel | undefined,
    @Body() param: EditAdditionalWorkDto,
  ): Promise<AdditionalWorks | null> {
    return this.additionalWorksService.edit({ user, param });
  }

  @Post('delete')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WORKER)
  @UseGuards(RolesGuard)
  deleteAdditionalWork(
    @User() user: UserModel | undefined,
    @Body() param: { id: number },
  ): Promise<boolean> {
    return this.additionalWorksService.delete({ user, id: param.id });
  }

  @Get('getByShiftId')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.WORKER)
  @UseGuards(RolesGuard)
  byShiftId(
    @User() user: UserModel | undefined,
    @Query() param: { shiftId: number },
  ): Promise<AdditionalWorks[] | null> {
    return this.additionalWorksService.getByShiftId({ user, param });
  }
}
