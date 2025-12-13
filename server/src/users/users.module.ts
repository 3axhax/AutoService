import { Global, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './users.model';
import { Role } from '../roles/roles.model';
import { UserRole } from '../roles/users-roles.model';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';
import { UsersSessionsModule } from './usersSessions/usersSessions.module';

@Global()
@Module({
  providers: [UsersService],
  imports: [
    SequelizeModule.forFeature([User, Role, UserRole]),
    RolesModule,
    AuthModule,
    UsersSessionsModule,
  ],
  exports: [UsersService],
})
export class UsersModule {}
