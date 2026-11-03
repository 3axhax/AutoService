import { UniqueConstraintError } from 'sequelize';
import { normalizeEmail } from '../users/normalize-email';
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from '../users/dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { UsersSessionsService } from '../users/usersSessions/usersSessions.service';
import { ConflictException } from '@nestjs/common/exceptions/conflict.exception';
import { UserRoleEnum } from '../roles/roles.types';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private usersSessionsService: UsersSessionsService,
    private companiesService: CompaniesService,
  ) {}

  async login(userDto: LoginUserDto) {
    const user = await this.validateUser(userDto);
    const session = await this.usersSessionsService.createSession(user.id);
    const plainUser = user.get({ plain: true });
    return {
      id: user.id,
      name: user.name,
      roles: plainUser.roles.map((role) => role.value),
      token: session.token,
    };
  }

  private async validateUser(userDto: LoginUserDto) {
    const user = await this.userService.getUserByEmail(userDto.email);
    if (user) {
      const passwordEquals: boolean = await bcrypt.compare(
        userDto.password,
        user.password,
      );
      if (passwordEquals) {
        return user;
      } else {
        throw new UnauthorizedException('Incorrect Email or Password');
      }
    }

    throw new UnauthorizedException('Incorrect Email or Password');
  }

  async logout(token: string) {
    return this.usersSessionsService.revokeSession(token);
  }

  async register(userDto: CreateUserDto) {
    const email = normalizeEmail(userDto.email);
    try {
      return await this.userService.withRegistrationTransaction(
        email,
        async (transaction) => {
          const existing = await this.userService.getUserByEmail(
            email,
            transaction,
          );
          if (existing)
            throw new ConflictException(
              'Пользователь с такой почтой уже существует',
            );
          const createdCompany = await this.companiesService.createCompany(
            {
              fullName: userDto.companyName,
            },
            transaction,
          );
          const createdUser = await this.userService.createUser(
            {
              email,
              name: userDto.name,
              companyId: createdCompany.id,
              password: await bcrypt.hash(userDto.password, 10),
              confirmed: true,
              confirmedDate: null,
              confirmedToken: await bcrypt.hash(
                `${userDto.name}${userDto.email}`,
                10,
              ),
              adminToken: await bcrypt.hash(
                `${userDto.name}${userDto.email}`,
                10,
              ),
            },
            UserRoleEnum.ADMIN,
            transaction,
          );

          const session = await this.usersSessionsService.createSession(
            createdUser.id,
            transaction,
          );
          const plainUser = createdUser.get({ plain: true });
          return {
            id: createdUser.id,
            name: createdUser.name,
            roles: plainUser.roles.map((role) => role.value),
            token: session.token,
          };
        },
      );
    } catch (error) {
      if (
        error instanceof ConflictException ||
        (error instanceof UniqueConstraintError &&
          Object.keys(error.fields ?? {}).some((field) =>
            field.includes('email'),
          ))
      )
        throw new ConflictException(
          'Пользователь с такой почтой уже существует',
        );
      throw new HttpException(
        'Ошибка при создании пользователя',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
