import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  Min,
  Max,
  ValidateBy,
  ValidateIf,
  ValidateNested,
  ValidationArguments,
} from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import { GetShiftListDto } from '../../shifts/dto/shifts.dto';
import { parseDateFromFormat } from '../../utils/parseDateFromFormat';

const numberValue = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' && value.trim() !== '' ? Number(value) : value;

export class DeleteOrdersDto {
  @Transform(({ value }: TransformFnParams): unknown => {
    const convert = (id: unknown): unknown =>
      typeof id === 'string' && /^\d+$/.test(id) ? Number(id) : id;
    return Array.isArray(value) ? value.map(convert) : convert(value);
  })
  @ValidateBy({
    name: 'orderIds',
    validator: {
      validate: (value: unknown) => {
        const ids = Array.isArray(value) ? value : [value];
        return (
          ids.length > 0 &&
          ids.every(
            (id: unknown) =>
              typeof id === 'number' &&
              Number.isInteger(id) &&
              id > 0 &&
              id <= 2147483647,
          )
        );
      },
      defaultMessage: () =>
        'id must be a positive integer or a non-empty array of positive integers',
    },
  })
  id: number | number[];
}

export class OrderFilterItem {
  @IsString()
  @IsNotEmpty()
  filterName: string;

  @ValidateBy({
    name: 'orderFilterValue',
    validator: {
      validate: (value: unknown, args: ValidationArguments) => {
        if (value === null) return true;
        const { filterName } = args.object as OrderFilterItem;
        if (filterName === 'userId') {
          if (
            typeof value !== 'number' &&
            !(typeof value === 'string' && /^\d+$/.test(value))
          )
            return false;
          const id = Number(value);
          return Number.isSafeInteger(id) && id > 0;
        }
        if (['createdAtStart', 'createdAtEnd'].includes(filterName))
          return parseDateFromFormat(value) !== undefined;
        return (
          typeof value === 'string' ||
          (typeof value === 'number' && Number.isFinite(value))
        );
      },
      defaultMessage: () =>
        'filterValue must match the filter: positive integer userId, calendar date or string/finite number/null',
    },
  })
  filterValue: string | number | null;
}

export class GetOrdersListDto {
  @Transform(numberValue)
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsInt()
  @Min(1)
  currentPage: number = 1;

  @Transform(numberValue)
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsInt()
  @Min(1)
  recordPerPage: number = 20;

  @IsArray()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  @Type(() => OrderFilterItem)
  filters: OrderFilterItem[] = [];
}

export class DownloadWorkerOrdersDto extends GetShiftListDto {
  @Transform(numberValue)
  @ValidateIf((_, value: unknown) => value !== undefined)
  @IsInt()
  @Min(1)
  @Max(2147483647)
  shiftId?: number;
}
