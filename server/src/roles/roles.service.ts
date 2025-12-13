import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Role, userRoleType } from './roles.model';
import { CreateRoleDto } from './dto/create-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role)
    private roleRepository: typeof Role,
  ) {}
  async createRole(dto: CreateRoleDto) {
    return await this.roleRepository.create(dto);
  }

  async getRole(value: userRoleType) {
    const role = await this.roleRepository.findOne({
      where: { value },
    });

    return role ?? (await this.createRole({ value, description: value }));
  }
}
