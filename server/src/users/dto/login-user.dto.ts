import { IsEmail, IsString, MinLength } from 'class-validator';
import { MIN_PASSWORD_LENGTH } from './constants.dto';

export class LoginUserDto {
  @IsString({ message: 'Must be a string' })
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `Длина пароля должна быть от ${MIN_PASSWORD_LENGTH} символов`,
  })
  readonly password: string;

  @IsString({ message: 'Must be a string' })
  @IsEmail({}, { message: 'Некорректный E-mail' })
  readonly email: string;
}
