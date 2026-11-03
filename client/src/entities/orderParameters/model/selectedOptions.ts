import type { ParametersItem } from "./types";

/** Only declared option parameters can contribute pricing conditions. */
export function getBaseOptionIds(values: Record<string, unknown>, parameters: ParametersItem[]): number[] {
  return parameters.flatMap(parameter => {
    if (!["SELECT", "SELECT_LIST"].includes(parameter.type)) return [];
    const value = values[parameter.name];
    if (Array.isArray(value) || typeof value === "boolean") return [];
    const ids = value && typeof value === "object"
      ? Object.entries(value).filter(([, count]) => Number(count) > 0).map(([id]) => Number(id))
      : value ? [Number(value)] : [];
    return ids.filter(id => Number.isFinite(id) && parameter.options.some(option => option.id === id));
  });
}
