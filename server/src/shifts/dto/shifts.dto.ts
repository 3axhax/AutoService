import { IsNumber, IsOptional } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class GetShiftListDto {
  @Transform(({ value }: TransformFnParams) => {
    const num = value ? parseInt(value as string, 10) : 0;
    return isNaN(num) || num < 1 ? 1 : num;
  })
  @IsNumber()
  @IsOptional()
  currentPage: number;

  @Transform(({ value }: TransformFnParams) => {
    const num = value ? parseInt(value as string, 10) : 0;
    return isNaN(num) || num < 0 ? 20 : num;
  })
  @IsNumber()
  @IsOptional()
  recordPerPage: number;
}
