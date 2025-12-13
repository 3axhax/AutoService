import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './users.model';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesService } from '../roles/roles.service';
import { UsersSessionsService } from './usersSessions/usersSessions.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userRepository: typeof User,
    private roleService: RolesService,
    private userSessionsService: UsersSessionsService,
  ) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.userRepository.create(dto);
    const role = await this.roleService.getRole('USER');
    await user.$set('roles', [role.id]);
    user.roles = [role];
    return user;
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      include: { all: true },
    });
  }

  async getUserById(id: number) {
    return await this.userRepository.findOne({
      where: { id },
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
}
