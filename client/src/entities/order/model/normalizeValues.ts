import { getBaseOptionIds } from "@entities/orderParameters/model/selectedOptions";
import type { OrderValue } from "./types";
import type { OrderParametersState } from "@entities/orderParameters/model/types";
import type { PriceItem } from "@entities/price/model/types";

/** Remove values which ceased to be available after changing a parent option. */
export function normalizeOrderValues(
  values: OrderValue,
  settings: OrderParametersState,
  prices: PriceItem[],
): OrderValue {
  const result = { ...values };
  const selectedIds = () => getBaseOptionIds(result, settings.parametersList);
  // Removing one value can invalidate another dependency further down the chain.
  for (let pass = 0; pass <= settings.parametersList.length; pass++) {
    let changed = false;
    const ids = selectedIds();
    for (const parameter of settings.parametersList) {
      const value = result[parameter.name];
      if (value === undefined) continue;
      const required = settings.parameterOptionDependence[parameter.id];
      const allowed = parameter.options
        .filter((option) =>
          Object.entries(settings.optionOptionDependence).every(
            ([parent, targets]) =>
              !ids.includes(Number(parent)) ||
              !targets[parameter.id] ||
              targets[parameter.id].includes(option.id),
          ),
        )
        .map((option) => option.id);
      let next = value;
      if (required && !required.some((id) => ids.includes(id))) {
        delete result[parameter.name];
        changed = true;
        continue;
      }
      if (Array.isArray(value)) {
        next = value.filter(
          (operation) =>
            operation.optionIds.every((id) => allowed.includes(id)) &&
            (!prices.length ||
              operation.optionIds.every((id) =>
                prices.some(
                  (price) =>
                    price.mainOptionId === id &&
                    price.conditions.every((condition) =>
                      [...ids, ...operation.optionIds].includes(condition.id),
                    ),
                ),
              )),
        );
      } else if (
        parameter.options.length &&
        value &&
        typeof value === "object"
      ) {
        next = Object.fromEntries(
          Object.entries(value).filter(([id]) => allowed.includes(Number(id))),
        );
      } else if (
        parameter.options.length &&
        value &&
        !allowed.includes(Number(value))
      ) {
        delete result[parameter.name];
        changed = true;
        continue;
      }
      if (JSON.stringify(value) !== JSON.stringify(next)) {
        result[parameter.name] = next;
        changed = true;
      }
    }
    if (!changed) break;
  }
  return result;
}
