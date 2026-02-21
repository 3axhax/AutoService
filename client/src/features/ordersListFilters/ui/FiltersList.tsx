import { useAppSelector } from "@shared/store/hooks.ts";
import { SelectOrdersFiltersList } from "@entities/order";
import { FiltersListItem } from "@features/ordersListFilters/ui/FiltersListItem.tsx";

export const FiltersList = () => {
  const filtersList = useAppSelector(SelectOrdersFiltersList);
  return (
    <div className={"flex gap-2"}>
      {filtersList.map((filter) => (
        <FiltersListItem key={filter.filterName} filter={filter} />
      ))}
    </div>
  );
};
