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

  async register(userDto: CreateUserDto) {
    console.log(userDto);
    const userDb = await this.userService.getUserByEmail(userDto.email);
    if (userDb) {
      throw new ConflictException('Пользователь с такой почтой уже существует');
    }
    try {
      const createdCompany = await this.companiesService.createCompany({
        fullName: userDto.companyName,
      });
      const createdUser = await this.userService.createUser(
        {
          email: userDto.email,
          name: userDto.name,
          companyId: createdCompany.id,
          password: await bcrypt.hash(userDto.password, 10),
          confirmed: true,
          confirmedDate: null,
          confirmedToken: await bcrypt.hash(
            `${userDto.name}${userDto.email}`,
            10,
          ),
          adminToken: await bcrypt.hash(`${userDto.name}${userDto.email}`, 10),
        },
        UserRoleEnum.ADMIN,
      );

      const session = await this.usersSessionsService.createSession(
        createdUser.id,
      );
      const plainUser = createdUser.get({ plain: true });
      return {
        id: createdUser.id,
        name: createdUser.name,
        roles: plainUser.roles.map((role) => role.value),
        token: session.token,
      };
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Ошибка при создании пользователя',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
