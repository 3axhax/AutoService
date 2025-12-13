import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { UsersSessionsService } from '../users/usersSessions/usersSessions.service';
import { UsersSessionsModule } from '../users/usersSessions/usersSessions.module';
import { UsersSessions } from '../users/usersSessions/usersSessions.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UsersSessionsService],
  imports: [
    forwardRef(() => UsersModule),
    SequelizeModule.forFeature([UsersSessions]),
    UsersSessionsModule,
  ],
  exports: [AuthModule],
})
export class AuthModule {}
