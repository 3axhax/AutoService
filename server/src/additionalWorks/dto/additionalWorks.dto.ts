import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class AddNewAdditionalWorkDto {
  @IsString()
  @IsOptional()
  description: string;

  // Empty client input explicitly means zero; omitted edits leave the amount unchanged.
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string'
      ? value.trim() === ''
        ? 0
        : Number(value)
      : value,
  )
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  totalValue: number;
}

export class EditAdditionalWorkDto extends AddNewAdditionalWorkDto {
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' && value.trim() !== '' ? Number(value) : value,
  )
  @IsInt()
  @Min(1)
  id: number;
}
