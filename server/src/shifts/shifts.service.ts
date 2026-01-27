import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Shifts } from './shifts.model';
import { User } from '../users/users.model';
import { FindAttributeOptions, literal } from 'sequelize';

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

  async closeAllActiveShiftByUser({ user }: { user: User | undefined }) {
    if (user) {
      return await this.shiftsRepository.update(
        { active: false, closedAt: new Date() },
        {
          where: {
            companyId: user.companyId,
            userId: user.id,
            active: true,
          },
        },
      );
    }
    return null;
  }

  async createActiveShiftByUser({
    user,
  }: {
    user: User | undefined;
  }): Promise<Shifts | null> {
    if (user) {
      await this.getOrCreateActiveShiftByUserCompany({
        userId: user.id,
        companyId: user.companyId,
      });
      return await this.getActiveShiftByUser({ user });
    }
    return null;
  }

  async getList({ user }: { user: User | undefined }) {
    if (user) {
      const sequelize = this.shiftsRepository.sequelize;
      if (!sequelize) {
        throw new Error('Sequelize instance not found');
      }
      const commonAttributes: FindAttributeOptions = [
        'id',
        'active',
        'createdAt',
        'closedAt',
        [
          literal(
            `(SELECT COALESCE(SUM("totalValue"), 0) FROM "orders" WHERE "shiftId" = "Shifts"."id")`,
          ),
          'totalOrdersSum',
        ],
        [
          literal(
            `(SELECT COALESCE(SUM("totalValue"), 0) FROM "additionalWorks" WHERE "shiftId" = "Shifts"."id")`,
          ),
          'totalAdditionalWorksSum',
        ],
      ];
      if (user.roles.length === 1 && user.roles[0].value === 'WORKER') {
        return await this.shiftsRepository.findAll({
          where: { userId: user.id, companyId: user.companyId },
          attributes: commonAttributes,
        });
      }
      if (
        user.roles.length > 0 &&
        user.roles.map((role) => role.value).includes('ADMIN')
      ) {
        return await this.shiftsRepository.findAll({
          where: { companyId: user.companyId },
        });
      }
    }
    return null;
  }

  async getShiftByUserAndId({
    user,
    shiftId,
  }: {
    user: User | undefined;
    shiftId: number;
  }): Promise<Shifts | null> {
    if (user) {
      return await this.shiftsRepository.findOne({
        where: {
          companyId: user.companyId,
          userId: user.id,
          id: shiftId,
        },
      });
    }
    return null;
  }
}
