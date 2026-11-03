import { ValidationPipe } from '@nestjs/common';
import { Op } from 'sequelize';
import { parseDateFromFormat } from './parseDateFromFormat';
import { GetShiftListDto } from '../shifts/dto/shifts.dto';
import { ShiftsService } from '../shifts/shifts.service';

describe('calendar report boundaries', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 10, 5));
  });
  afterEach(() => jest.useRealTimers());
  it.each([
    ['03.11.2026', new Date(2026, 10, 4)],
    ['31.12.2026', new Date(2027, 0, 1)],
    ['29.02.2024', new Date(2024, 2, 1)],
  ])('uses exclusive next-day midnight for %s', (value, expected) => {
    expect(parseDateFromFormat(value, true)).toEqual(expected);
  });
  it.each([
    'bad',
    '31.02.2026',
    '03junk.11.2026',
    '01.01.2026junk',
    '29.02.2025',
  ])('rejects invalid calendar string %s', (value) => {
    expect(parseDateFromFormat(value)).toBeUndefined();
  });
  it.each(['bad', '31.02.2026', 123, {}, true])(
    'rejects malformed shift dates instead of removing the filter: %j',
    async (value) => {
      const pipe = new ValidationPipe({ transform: true, whitelist: true });
      for (const field of ['closedAtStart', 'closedAtEnd'])
        await expect(
          pipe.transform(
            { [field]: value },
            { type: 'body', metatype: GetShiftListDto },
          ),
        ).rejects.toThrow();
    },
  );
  it('uses a half-open interval in the shift query', async () => {
    const dto = (await new ValidationPipe({
      transform: true,
    }).transform(
      { closedAtStart: '03.11.2026', closedAtEnd: '03.11.2026' },
      { type: 'body', metatype: GetShiftListDto },
    )) as GetShiftListDto;
    const where = new ShiftsService({} as never)._formatIntervalWhereProps(dto);
    expect(where[Op.or]).toEqual([
      {
        [Op.and]: [
          { closedAt: { [Op.gte]: new Date(2026, 10, 3) } },
          { closedAt: { [Op.lt]: new Date(2026, 10, 4) } },
        ],
      },
    ]);
  });
  it.each([
    [new Date(2026, 10, 3), true],
    [new Date(2026, 10, 3, 23, 59, 59, 999), true],
    [new Date(2026, 10, 4), false],
  ])('active shifts follow the same interval at %s', (now, includeActive) => {
    jest.setSystemTime(now);
    const where = new ShiftsService({} as never)._formatIntervalWhereProps({
      currentPage: 1,
      recordPerPage: 20,
      closedAtStart: new Date(2026, 10, 3),
      closedAtEnd: new Date(2026, 10, 4),
    });
    expect(where[Op.or]).toHaveLength(includeActive ? 2 : 1);
  });
});
