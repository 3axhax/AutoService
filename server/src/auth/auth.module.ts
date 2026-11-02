import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationRateLimitGuard } from './registration-rate-limit.guard';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { UsersSessionsService } from '../users/usersSessions/usersSessions.service';
import { UsersSessionsModule } from '../users/usersSessions/usersSessions.module';
import { UsersSessions } from '../users/usersSessions/usersSessions.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersSessionsService, RegistrationRateLimitGuard],
  imports: [
    forwardRef(() => UsersModule),
    SequelizeModule.forFeature([UsersSessions]),
    UsersSessionsModule,
    CompaniesModule,
  ],
  exports: [AuthModule],
})
export class AuthModule {}
