import { RequireSession } from './roles-auth.decorator';
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegistrationRateLimitGuard } from './registration-rate-limit.guard';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from '../users/dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/logout')
  @HttpCode(200)
  @RequireSession()
  logout(@Headers('authorization') authorization: string) {
    return this.authService.logout(authorization.split(' ')[1]);
  }

  @Post('/login')
  login(@Body() userDto: LoginUserDto) {
    return this.authService.login(userDto);
  }

  @Post('/register')
  @UseGuards(RegistrationRateLimitGuard)
  register(@Body() userDto: CreateUserDto) {
    return this.authService.register(userDto);
  }
}
