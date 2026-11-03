export const parseDateFromFormat = (
  value: unknown,
  end?: boolean,
): Date | undefined => {
  if (typeof value !== 'string' || !/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(value))
    return undefined;
  const parts = value.split('.');

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined;

  const date = new Date(year, month, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  // Exclusive upper bound: includes every fractional second of the selected day.
  if (end) date.setDate(date.getDate() + 1);
  return date;
};
