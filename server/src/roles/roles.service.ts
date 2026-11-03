import type { Transaction } from 'sequelize';
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

  async createRole(dto: UserRoleEnum, transaction?: Transaction) {
    return await this.roleRepository.create({ value: dto }, { transaction });
  }

  async getRole(value: UserRoleEnum, transaction?: Transaction) {
    const role = await this.roleRepository.findOne({
      where: { value },
      transaction,
    });

    return role ?? (await this.createRole(value, transaction));
  }
}
