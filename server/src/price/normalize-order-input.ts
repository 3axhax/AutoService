import { BadRequestException } from '@nestjs/common';

interface Parameter {
  name: string;
  type: string;
}

/** The same normalized values must feed pricing and persisted option values. */
export function normalizeOrderInput(
  input: Record<string, unknown>,
  parameters: Parameter[],
  allowId: boolean,
): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new BadRequestException('Некорректные параметры заказа');
  const names = new Map(
    parameters.map((parameter) => [parameter.name, parameter]),
  );
  const values: Record<string, unknown> = {};
  const invalid = (name: string): never => {
    throw new BadRequestException(`Некорректное значение параметра: ${name}`);
  };
  const numeric = (value: unknown) =>
    typeof value === 'number' ||
    (typeof value === 'string' && value.trim() !== '')
      ? Number(value)
      : NaN;
  for (const [name, value] of Object.entries(input)) {
    if (name === 'id' && allowId) {
      const id = numeric(value);
      if (!Number.isSafeInteger(id) || id < 1) invalid(name);
      values.id = id;
      continue;
    }
    const parameter = names.get(name);
    if (!parameter)
      throw new BadRequestException(`Недоступный параметр: ${name}`);
    if (value === undefined || value === null || value === '') continue;
    switch (parameter.type) {
      case 'SELECT': {
        const id = numeric(value);
        if (!Number.isSafeInteger(id) || id < 1) invalid(name);
        values[name] = id;
        break;
      }
      case 'SELECT_LIST': {
        if (typeof value !== 'object' || Array.isArray(value)) invalid(name);
        const quantities: Record<string, number> = {};
        for (const [option, quantity] of Object.entries(value as object)) {
          const id = Number(option),
            count = numeric(quantity);
          if (
            !Number.isSafeInteger(id) ||
            id < 1 ||
            !Number.isSafeInteger(count) ||
            count < 0
          )
            invalid(name);
          if (count > 0) quantities[String(id)] = count;
        }
        if (Object.keys(quantities).length) values[name] = quantities;
        break;
      }
      case 'COMPOSITE_LIST': {
        if (!Array.isArray(value)) invalid(name);
        const operations = value as unknown[];
        const ids = new Set<string>();
        for (const operation of operations) {
          if (
            !operation ||
            typeof operation !== 'object' ||
            Array.isArray(operation)
          )
            invalid(name);
          const id = (operation as Record<string, unknown>).id;
          if (id !== undefined) {
            if (
              typeof id !== 'string' ||
              id.trim() === '' ||
              id.length > 64 ||
              ids.has(id)
            )
              invalid(name);
            ids.add(id as string);
          }
        }
        values[name] = operations.map((operation, index) => {
          if (
            !operation ||
            typeof operation !== 'object' ||
            Array.isArray(operation)
          )
            invalid(name);
          const item = operation as Record<string, unknown>;
          if (!Array.isArray(item.optionIds)) invalid(name);
          const count = item.count === undefined ? 1 : numeric(item.count);
          const optionIds = (item.optionIds as unknown[]).map(numeric);
          if (
            !Number.isSafeInteger(count) ||
            count < 1 ||
            optionIds.some((id) => !Number.isSafeInteger(id) || id < 1)
          )
            invalid(name);
          let id = item.id as string | undefined;
          if (id === undefined) {
            let suffix = index + 1;
            do {
              id = `operation-${suffix++}`;
            } while (ids.has(id));
            ids.add(id);
          }
          return { ...item, id, optionIds, count };
        });
        break;
      }
      case 'INPUT':
        if (typeof value === 'string') values[name] = value;
        else if (typeof value === 'number' && Number.isFinite(value))
          values[name] = value.toString();
        else invalid(name);
        break;
      case 'GRAPH_INPUT':
        if (typeof value !== 'string') invalid(name);
        values[name] = value;
        break;
      default:
        invalid(name);
    }
  }
  return values;
}
