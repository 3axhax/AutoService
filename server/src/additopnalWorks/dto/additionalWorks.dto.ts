import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class AddNewAdditionalWorkDto {
  @IsString()
  @IsOptional()
  description: string;

  @Transform(({ value }: TransformFnParams) => {
    const num = value ? parseInt(value as string, 10) : 0;
    return isNaN(num) ? 0 : num;
  })
  @IsNumber()
  @IsOptional()
  totalValue: number;
}
