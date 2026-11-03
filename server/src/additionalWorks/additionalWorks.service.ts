import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../users/users.model';
import { ShiftsService } from '../shifts/shifts.service';
import { AdditionalWorks } from './additionalWorks.model';
import {
  AddNewAdditionalWorkDto,
  EditAdditionalWorkDto,
} from './dto/additionalWorks.dto';

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
    if (!param || !user) return null;
    return this.shiftsService.withActiveShift(user, (shift, transaction) =>
      this.additionalWorksRepository.create(
        {
          companyId: user.companyId,
          description: param.description,
          shiftId: shift.id,
          totalValue: param.totalValue,
        },
        { transaction },
      ),
    );
  }

  async edit({
    user,
    param,
  }: {
    user: User | undefined;
    param: EditAdditionalWorkDto;
  }): Promise<AdditionalWorks | null> {
    if (!user) return null;
    return this.shiftsService.withActiveShift(
      user,
      async (shift, transaction) => {
        const existing = await this.additionalWorksRepository.findOne({
          where: { id: param.id, companyId: user.companyId, shiftId: shift.id },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!existing) return null;
        await existing.update(
          { description: param.description, totalValue: param.totalValue },
          { transaction },
        );
        return existing;
      },
    );
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

  async delete({
    user,
    id,
  }: {
    user: User | undefined;
    id: number;
  }): Promise<boolean> {
    if (!user) return false;
    return this.shiftsService.withActiveShift(
      user,
      async (shift, transaction) => {
        const deleted = await this.additionalWorksRepository.destroy({
          where: { id, companyId: user.companyId, shiftId: shift.id },
          transaction,
        });
        return deleted > 0;
      },
    );
  }

  async getByShiftId({
    user,
    param,
  }: {
    user: User | undefined;
    param: { shiftId: number };
  }): Promise<AdditionalWorks[] | null> {
    if (user) {
      const shift = !user.isAdmin
        ? await this.shiftsService.getShiftByUserAndId({
            user,
            shiftId: param.shiftId,
          })
        : null;
      if (shift) {
        return await this.additionalWorksRepository.findAll({
          where: { shiftId: shift.id },
          attributes: [
            'id',
            'shiftId',
            'description',
            'totalValue',
            'createdAt',
          ],
        });
      }
    }
    return null;
  }
}
