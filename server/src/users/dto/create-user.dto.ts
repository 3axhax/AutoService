import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Must be a string' })
  @Length(4, 16, {
    message: 'Length must be from 4 to 16 characters',
  })
  readonly password: string;

  @IsString({ message: 'Must be a string' })
  @IsEmail({}, { message: 'Incorrect Email' })
  readonly email: string;
}
