import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Shifts } from './shifts.model';
import { User } from '../users/users.model';
import {
  FindAttributeOptions,
  Order,
  literal,
  Op,
  WhereOptions,
  Transaction,
  QueryTypes,
} from 'sequelize';
import { GetShiftListDto } from './dto/shifts.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectModel(Shifts)
    private shiftsRepository: typeof Shifts,
  ) {}

  async withUserShiftTransaction<T>(
    owner: { companyId: number; userId: number },
    action: (transaction: Transaction) => Promise<T>,
    transaction?: Transaction,
  ): Promise<T> {
    const sequelize = this.shiftsRepository.sequelize;
    if (!sequelize) throw new Error('Sequelize instance not found');
    const run = async (current: Transaction) => {
      await sequelize.query(
        'SELECT pg_advisory_xact_lock(:companyId, :userId)',
        {
          replacements: owner,
          type: QueryTypes.SELECT,
          transaction: current,
        },
      );
      return action(current);
    };
    return transaction ? run(transaction) : sequelize.transaction(run);
  }

  async withActiveShift<T>(
    user: User,
    action: (shift: Shifts, transaction: Transaction) => Promise<T>,
  ): Promise<T> {
    return this.withUserShiftTransaction(
      { companyId: user.companyId, userId: user.id },
      async (transaction) => {
        const shift = await this.getActiveShiftByUserCompany({
          companyId: user.companyId,
          userId: user.id,
          transaction,
        });
        if (!shift)
          throw new ConflictException(
            'Смена уже закрыта. Откройте новую смену явно.',
          );
        return action(shift, transaction);
      },
    );
  }

  async withLockedShift<T>(
    target: { companyId: number; shiftId: number },
    action: (shift: Shifts, transaction: Transaction) => Promise<T>,
  ): Promise<T> {
    const where = { companyId: target.companyId, id: target.shiftId };
    const owner = await this.shiftsRepository.findOne({
      where,
      attributes: ['id', 'userId'],
    });
    if (!owner) throw new NotFoundException('Смена не найдена');
    return this.withUserShiftTransaction(
      { companyId: target.companyId, userId: owner.userId },
      async (transaction) => {
        const shift = await this.shiftsRepository.findOne({
          where,
          transaction,
        });
        if (!shift) throw new NotFoundException('Смена не найдена');
        return action(shift, transaction);
      },
    );
  }

  async withLockedShifts<T>(
    target: { companyId: number; shiftIds: number[] },
    action: (shifts: Shifts[], transaction: Transaction) => Promise<T>,
  ): Promise<T> {
    const ids = [...new Set(target.shiftIds)].sort((a, b) => a - b);
    const where = { companyId: target.companyId, id: ids };
    const owners = await this.shiftsRepository.findAll({
      where,
      attributes: ['id', 'userId'],
    });
    if (owners.length !== ids.length)
      throw new NotFoundException('Смена не найдена');
    const userIds = [...new Set(owners.map((shift) => shift.userId))].sort(
      (a, b) => a - b,
    );
    const sequelize = this.shiftsRepository.sequelize;
    if (!sequelize) throw new Error('Sequelize instance not found');
    return sequelize.transaction(async (transaction) => {
      // All batch writers acquire owner locks in the same order to avoid deadlocks.
      for (const userId of userIds)
        await this.withUserShiftTransaction(
          { companyId: target.companyId, userId },
          () => Promise.resolve(undefined),
          transaction,
        );
      const shifts = await this.shiftsRepository.findAll({
        where,
        transaction,
      });
      if (shifts.length !== ids.length)
        throw new NotFoundException('Смена не найдена');
      if (
        shifts.some(
          (shift) =>
            owners.find((owner) => owner.id === shift.id)?.userId !==
            shift.userId,
        )
      )
        throw new ConflictException('Смена изменилась. Повторите запрос.');
      return action(shifts, transaction);
    });
  }

  async getOrCreateActiveShiftByUserCompany({
    companyId,
    userId,
    transaction,
  }: {
    companyId: number;
    userId: number;
    transaction?: Transaction;
  }): Promise<Shifts> {
    return this.withUserShiftTransaction(
      { companyId, userId },
      async (current) => {
        const existing = await this.getActiveShiftByUserCompany({
          companyId,
          userId,
          transaction: current,
        });
        return (
          existing ??
          this.shiftsRepository.create(
            { companyId, userId, active: true },
            { transaction: current },
          )
        );
      },
      transaction,
    );
  }

  async getActiveShiftByUserCompany({
    companyId,
    userId,
    transaction,
  }: {
    companyId: number;
    userId: number;
    transaction?: Transaction;
  }): Promise<Shifts | null> {
    return await this.shiftsRepository.findOne({
      where: { companyId, userId, active: true },
      attributes: ['id', 'active', 'userId'],
      transaction,
      order: [['id', 'ASC']],
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
      return this.withUserShiftTransaction(
        { companyId: user.companyId, userId: user.id },
        (transaction) =>
          this.shiftsRepository.update(
            { active: false, closedAt: new Date() },
            {
              where: {
                companyId: user.companyId,
                userId: user.id,
                active: true,
              },
              transaction,
            },
          ),
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
      const whereProps = {
        companyId: user.companyId,
        ...(!user.isAdmin ? { userId: user.id } : {}),
        ...this._formatIntervalWhereProps(param),
      };

      if (whereProps) {
        const count = await this.shiftsRepository.count({
          where: whereProps,
        });
        const rows = await this.shiftsRepository.findAll({
          ...commonProps,
          where: whereProps,
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

  async getExportShiftIds(user: User, param: GetShiftListDto): Promise<number[]> {
    const shifts = await this.shiftsRepository.findAll({
      where: { companyId: user.companyId, userId: user.id, ...this._formatIntervalWhereProps(param) },
      attributes: ['id'],
    });
    return shifts.map((shift) => shift.id);
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
      andCondition.push({ closedAt: { [Op.lt]: param.closedAtEnd } });
    }

    const orCondition: WhereOptions<Shifts>[] = [{ [Op.and]: andCondition }];

    if (param.closedAtStart && param.closedAtEnd) {
      if (
        now.getTime() < param.closedAtEnd.getTime() &&
        now.getTime() >= param.closedAtStart.getTime()
      ) {
        orCondition.push({ closedAt: null });
      }
    }

    return {
      [Op.or]: orCondition,
    };
  }
}
