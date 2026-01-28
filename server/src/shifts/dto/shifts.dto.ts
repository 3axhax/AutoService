import { IsDate, IsNumber, IsOptional } from 'class-validator';
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

const parseDateFromFormat = (
  value: string,
  end?: boolean,
): Date | undefined => {
  const parts = value.split('.');
  if (parts.length !== 3) return undefined;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined;

  const date = new Date(year, month, day);

  if (end) {
    date.setHours(23);
    date.setMinutes(59);
    date.setSeconds(59);
  }

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
};
