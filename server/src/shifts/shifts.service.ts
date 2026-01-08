import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Shifts } from './shifts.model';
import { User } from '../users/users.model';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectModel(Shifts)
    private shiftsRepository: typeof Shifts,
  ) {}

  async getOrCreateActiveShiftByUserCompany({
    companyId,
    userId,
  }: {
    companyId: number;
    userId: number;
  }): Promise<Shifts> {
    const existShifts = await this.shiftsRepository.findOne({
      where: { companyId, userId, active: true },
    });
    if (existShifts) {
      return existShifts;
    }
    return await this.shiftsRepository.create({
      companyId,
      userId,
      active: true,
    });
  }

  async getActiveShiftByUserCompany({
    companyId,
    userId,
  }: {
    companyId: number;
    userId: number;
  }): Promise<Shifts | null> {
    return await this.shiftsRepository.findOne({
      where: { companyId, userId, active: true },
      attributes: ['id', 'active'],
    });
  }

  async getActiveShiftByUser({ user }: { user: User | undefined }) {
    if (user) {
      return await this.getActiveShiftByUserCompany({
        companyId: user.companyId,
        userId: user.id,
      });
    }
    return null;
  }
}
