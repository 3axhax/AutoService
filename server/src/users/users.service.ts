import { Transaction, QueryTypes, fn, col, where } from 'sequelize';
import { normalizeEmail } from './normalize-email';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserCreationAttrs } from './users.model';
import { RolesService } from '../roles/roles.service';
import { UsersSessionsService } from './usersSessions/usersSessions.service';
import { Role } from '../roles/roles.model';
import { UserRoleEnum } from '../roles/roles.types';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
    private roleService: RolesService,
    private userSessionsService: UsersSessionsService,
  ) {}

  async withRegistrationTransaction<T>(
    email: string,
    action: (transaction: Transaction) => Promise<T>,
  ): Promise<T> {
    const sequelize = this.userRepository.sequelize;
    if (!sequelize) throw new Error('Sequelize instance not found');
    return sequelize.transaction(async (transaction) => {
      await sequelize.query(
        'SELECT pg_advisory_xact_lock(92031, hashtext(:email))',
        {
          replacements: { email: normalizeEmail(email) },
          type: QueryTypes.SELECT,
          transaction,
        },
      );
      return action(transaction);
    });
  }

  async createUser(
    dto: UserCreationAttrs,
    userRole: UserRoleEnum = UserRoleEnum.WORKER,
    transaction?: Transaction,
  ) {
    const user = await this.userRepository.create(dto, { transaction });
    const role = await this.roleService.getRole(userRole, transaction);
    await user.$set('roles', [role.id], { transaction });
    user.roles = [role];
    const newUser = await this.getUserById(user.id, transaction);
    if (newUser) {
      return newUser;
    }
    throw new HttpException(
      'Ошибка при создании пользователя',
      HttpStatus.BAD_REQUEST,
    );
  }

  async getUserByEmail(email: string, transaction?: Transaction) {
    return await this.userRepository.findOne({
      where: where(
        fn('lower', fn('btrim', col('email'))),
        normalizeEmail(email),
      ),
      transaction,
      include: { all: true },
    });
  }

  async getUserById(id: number, transaction?: Transaction) {
    return await this.userRepository.findOne({
      where: { id },
      transaction,
      include: { all: true },
    });
  }

  async getUserByToken(token: string) {
    const session = await this.userSessionsService.checkUser({ token });
    if (session) {
      return await this.getUserById(session.userId);
    }
    return null;
  }

  async getUsersList({
    user,
  }: {
    user: User | undefined;
  }): Promise<User[] | null> {
    if (user) {
      return await this.userRepository.findAll({
        where: { companyId: user.companyId },
        include: [
          {
            model: Role,
            attributes: ['value'],
            through: { attributes: [] },
          },
        ],
        attributes: ['id', 'name', 'rolesList'],
      });
    }
    return null;
  }
}
