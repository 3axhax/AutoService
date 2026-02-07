import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Shifts } from './shifts.model';
import { User } from '../users/users.model';
import {
  FindAttributeOptions,
  Order,
  literal,
  Op,
  WhereOptions,
} from 'sequelize';
import { GetShiftListDto } from './dto/shifts.dto';

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

  async getList({
    user,
    param,
  }: {
    user: User | undefined;
    param: GetShiftListDto;
  }): Promise<{
    totalRecord: number;
    currentPage: number;
    rows: Shifts[] | null;
  }> {
    if (user) {
      const sequelize = this.shiftsRepository.sequelize;
      if (!sequelize) {
        throw new Error('Sequelize instance not found');
      }
      const limit = param.recordPerPage ?? 20;
      const offset = param.currentPage ? (param.currentPage - 1) * limit : 0;
      const commonProps = {
        offset,
        limit,
        order: [['createdAt', 'DESC']] as Order,
        attributes: [
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
              `(SELECT COALESCE(SUM("totalValueWithDiscount"), 0) FROM "orders" WHERE "shiftId" = "Shifts"."id")`,
            ),
            'totalOrdersSumWithDiscount',
          ],
          [
            literal(
              `(SELECT COALESCE(SUM("totalValue"), 0) FROM "additionalWorks" WHERE "shiftId" = "Shifts"."id")`,
            ),
            'totalAdditionalWorksSum',
          ],
        ] as FindAttributeOptions,
      };
      const whereProps =
        user.roles.length === 1 && user.roles[0].value === 'WORKER'
          ? { userId: user.id, companyId: user.companyId }
          : user.roles.length > 0 &&
              user.roles.map((role) => role.value).includes('ADMIN')
            ? { companyId: user.companyId }
            : null;

      if (whereProps) {
        const { count, rows } = await this.shiftsRepository.findAndCountAll({
          ...commonProps,
          where: { ...whereProps, ...this._formatIntervalWhereProps(param) },
        });
        return {
          totalRecord: count,
          currentPage: param.currentPage,
          rows: rows,
        };
      }
    }
    return {
      totalRecord: 0,
      currentPage: param.currentPage,
      rows: null,
    };
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

  _formatIntervalWhereProps(param: GetShiftListDto): WhereOptions<Shifts> {
    if (!param.closedAtStart && !param.closedAtEnd) {
      return {};
    }

    const now = new Date();

    const andCondition: WhereOptions<Shifts>[] = [];

    if (param.closedAtStart) {
      andCondition.push({ closedAt: { [Op.gte]: param.closedAtStart } });
    }

    if (param.closedAtEnd) {
      andCondition.push({ closedAt: { [Op.lte]: param.closedAtEnd } });
    }

    const orCondition: WhereOptions<Shifts>[] = [{ [Op.and]: andCondition }];

    if (param.closedAtStart && param.closedAtEnd) {
      if (
        now.getTime() < param.closedAtEnd.getTime() &&
        now.getTime() > param.closedAtStart.getTime()
      ) {
        orCondition.push({ closedAt: null });
      }
    }

    return {
      [Op.or]: orCondition,
    };
  }
}
