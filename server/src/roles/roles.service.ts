import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role } from './roles.model';
import { UserRoleEnum } from './roles.types';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role)
    private roleRepository: typeof Role,
  ) {}

  async createRole(dto: UserRoleEnum) {
    return await this.roleRepository.create({ value: dto });
  }

  async getRole(value: UserRoleEnum) {
    const role = await this.roleRepository.findOne({
      where: { value },
    });

    return role ?? (await this.createRole(value));
  }
}
