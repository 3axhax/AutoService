import { BadRequestException } from '@nestjs/common';

interface Parameter {
  id: number;
  name: string;
  type: string;
  options: { id: number }[];
}

/** Validate the same company dependencies used by the order form before saving. */
export function validateOrderDependencies(
  values: Record<string, unknown>,
  parameters: Parameter[],
  settings: {
    parameterOptionDependence: string;
    optionOptionDependence: string;
  },
) {
  const required = JSON.parse(
    settings.parameterOptionDependence || '{}',
  ) as Record<string, number[]>;
  const dependent = JSON.parse(
    settings.optionOptionDependence || '{}',
  ) as Record<string, Record<string, number[]>>;
  const idsFor = (parameter: Parameter): number[] => {
    const value = values[parameter.name];
    if (parameter.type === 'COMPOSITE_LIST' && Array.isArray(value)) {
      return value.flatMap(
        (item: { optionIds?: number[] }) => item?.optionIds ?? [],
      );
    }
    if (!['SELECT', 'SELECT_LIST'].includes(parameter.type) || !value)
      return [];
    return typeof value === 'object'
      ? Object.entries(value)
          .filter(
            ([, count]) => Number.isFinite(Number(count)) && Number(count) > 0,
          )
          .map(([id]) => Number(id))
      : [Number(value)];
  };
  const selected = parameters.flatMap((parameter) =>
    parameter.type === 'COMPOSITE_LIST' ? [] : idsFor(parameter),
  );
  for (const parameter of parameters) {
    const value = values[parameter.name];
    if (value === undefined || value === null || value === '') continue;
    if (
      required[parameter.id] &&
      !required[parameter.id].some((id) => selected.includes(id))
    ) {
      throw new BadRequestException(`Недоступный параметр: ${parameter.name}`);
    }
    const allowed = parameter.options
      .filter((option) =>
        Object.entries(dependent).every(
          ([parent, targets]) =>
            !selected.includes(Number(parent)) ||
            !targets[parameter.id] ||
            targets[parameter.id].includes(option.id),
        ),
      )
      .map((option) => option.id);
    if (parameter.type === 'COMPOSITE_LIST' && Array.isArray(value)) {
      for (const operation of value) {
        const ids = Array.isArray(operation?.optionIds)
          ? operation.optionIds.map(Number)
          : [];
        for (const parent of ids) {
          const allowedChildren = dependent[parent]?.[parameter.id];
          if (
            allowedChildren &&
            !ids.some((id) => allowedChildren.includes(id))
          ) {
            throw new BadRequestException(
              `Недопустимое сочетание: ${parameter.name}`,
            );
          }
        }
      }
    }
    if (idsFor(parameter).some((id) => !allowed.includes(id))) {
      throw new BadRequestException(`Недопустимая опция: ${parameter.name}`);
    }
  }
}
