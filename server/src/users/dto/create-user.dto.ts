import {
  IsEmail,
  IsString,
  MinLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { MIN_PASSWORD_LENGTH } from './constants.dto';

@ValidatorConstraint({ name: 'passwordsMatch', async: false })
export class PasswordsMatchConstraint implements ValidatorConstraintInterface {
  validate(confirmedPassword: string, args: ValidationArguments) {
    const object = args.object as CreateUserDto;
    return confirmedPassword === object.password;
  }

  defaultMessage() {
    return 'Пароли не совпадают';
  }
}

export class CreateUserDto {
  @IsString({ message: 'Must be a string' })
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `Длина пароля должна быть от ${MIN_PASSWORD_LENGTH} символов`,
  })
  readonly password: string;

  @IsString({ message: 'Must be a string' })
  @MinLength(MIN_PASSWORD_LENGTH, {
    message: `Длина пароля должна быть от ${MIN_PASSWORD_LENGTH} символов`,
  })
  @Validate(PasswordsMatchConstraint)
  readonly confirmedPassword: string;

  @IsString({ message: 'Must be a string' })
  @IsEmail({}, { message: 'Некорректный E-mail' })
  readonly email: string;

  @IsString({ message: 'Must be a string' })
  @MinLength(2, {
    message: `Длина имени должна быть от 2 символов`,
  })
  readonly name: string;

  @IsString({ message: 'Must be a string' })
  @MinLength(2, {
    message: `Длина имени компании должна быть от 2 символов`,
  })
  readonly companyName: string;
}
