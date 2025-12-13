import { Global, Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Role } from './roles.model';
import { User } from '../users/users.model';
import { UserRole } from './users-roles.model';

@Global()
@Module({
  providers: [RolesService],
  imports: [SequelizeModule.forFeature([Role, User, UserRole])],
  exports: [RolesService],
})
export class RolesModule {}
