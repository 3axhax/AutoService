import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/roles-auth.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { User } from '../decorators/user.decorator';
import { User as UserModel } from '../users/users.model';
import { AdditionalWorksService } from './additionalWorks.service';
import { AdditionalWorks } from './additionalWorks.model';
import { AddNewAdditionalWorkDto } from './dto/additionalWorks.dto';

@Controller('additionalWorks')
export class AdditionalWorksController {
  constructor(private additionalWorksService: AdditionalWorksService) {}

  @Post('add')
  @Roles('ADMIN', 'WORKER')
  @UseGuards(RolesGuard)
  addNewOrder(
    @User() user: UserModel | undefined,
    @Body() param: AddNewAdditionalWorkDto,
  ): Promise<AdditionalWorks | null> {
    return this.additionalWorksService.addNew({ user, param });
  }

  @Get('fromActiveShift')
  @Roles('ADMIN', 'WORKER')
  @UseGuards(RolesGuard)
  fromActiveShift(
    @User() user: UserModel | undefined,
  ): Promise<AdditionalWorks[] | null> {
    return this.additionalWorksService.fromActiveShift({ user });
  }
}
