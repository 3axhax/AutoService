import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { parseDateFromFormat } from '../../utils/parseDateFromFormat';

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

  @Transform(({ value }: TransformFnParams) => {
    if (!value) return undefined;
    return parseDateFromFormat(value as string);
  })
  @IsDate()
  @IsOptional()
  closedAtStart?: Date;

  @Transform(({ value }: TransformFnParams) => {
    if (!value) return undefined;
    return parseDateFromFormat(value as string, true);
  })
  @IsDate()
  @IsOptional()
  closedAtEnd?: Date;
}
