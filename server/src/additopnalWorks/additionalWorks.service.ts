import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/users.model';
import { ShiftsService } from '../shifts/shifts.service';
import { AdditionalWorks } from './additionalWorks.model';
import { AddNewAdditionalWorkDto } from './dto/additionalWorks.dto';

@Injectable()
export class AdditionalWorksService {
  constructor(
    @InjectModel(AdditionalWorks)
    private additionalWorksRepository: typeof AdditionalWorks,
    private shiftsService: ShiftsService,
  ) {}

  async addNew({
    user,
    param,
  }: {
    user: User | undefined;
    param: AddNewAdditionalWorkDto;
  }): Promise<AdditionalWorks | null> {
    if (param && user) {
      const shift =
        await this.shiftsService.getOrCreateActiveShiftByUserCompany({
          userId: user.id,
          companyId: user.companyId,
        });

      return await this.additionalWorksRepository.create({
        companyId: user.companyId,
        description: param.description,
        shiftId: shift.id,
        totalValue: param.totalValue,
      });
    }
    return null;
  }

  async fromActiveShift({
    user,
  }: {
    user: User | undefined;
  }): Promise<AdditionalWorks[] | null> {
    if (user) {
      const shift = await this.shiftsService.getActiveShiftByUser({ user });
      if (shift) {
        return await this.additionalWorksRepository.findAll({
          where: { shiftId: shift.id },
          attributes: ['id', 'description', 'totalValue', 'createdAt'],
        });
      }
    }
    return null;
  }
}
