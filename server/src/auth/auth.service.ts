import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { UsersSessionsService } from '../users/usersSessions/usersSessions.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private usersSessionsService: UsersSessionsService,
  ) {}

  async login(userDto: CreateUserDto) {
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

  async createNewUser(userDto: CreateUserDto) {
    const hashPassword: string = await bcrypt.hash(userDto.password, 5);
    return await this.userService.createUser({
      ...userDto,
      password: hashPassword,
    });
  }

  private async validateUser(userDto: CreateUserDto) {
    const user = await this.userService.getUserByEmail(userDto.email);
    if (user) {
      const passwordEquals: boolean = await bcrypt.compare(
        userDto.password,
        user.password,
      );
      if (passwordEquals) {
        return user;
      } else {
        throw new UnauthorizedException('Incorrect Name or Password');
      }
    }

    throw new UnauthorizedException('Incorrect Email or Password');
  }
}
