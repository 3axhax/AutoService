import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  getOrdersListForAdmin,
  SelectOrdersFiltersCreatedAt,
  SelectOrdersFiltersList,
  setCreatedAtFilter,
  setCurrentPage,
} from "@entities/order";
import { FiltersListItem } from "@features/ordersListFilters/ui/FiltersListItem.tsx";
import { DateSelectInterval } from "@shared/ui";

export const FiltersList = () => {
  const dispatch = useAppDispatch();
  const filtersList = useAppSelector(SelectOrdersFiltersList);
  const { createdAtStart, createdAtEnd } = useAppSelector(
    SelectOrdersFiltersCreatedAt,
  );

  const onChangeShiftClosedAt = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    if ((start && end) || (!start && !end)) {
      const dateOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      dispatch(
        setCreatedAtFilter({
          createdAtStart: !start
            ? start
            : start.toLocaleString("ru", dateOptions),
          createdAtEnd: !end ? end : end.toLocaleString("ru", dateOptions),
        }),
      );
      dispatch(setCurrentPage(1));
      dispatch(getOrdersListForAdmin());
    }
  };

  return (
    <div className={"flex gap-2"}>
      <DateSelectInterval
        placeholder={"Дата создания заказа"}
        onChange={onChangeShiftClosedAt}
        startDate={createdAtStart}
        endDate={createdAtEnd}
      />
      {filtersList.map((filter) => (
        <FiltersListItem key={filter.filterName} filter={filter} />
      ))}
    </div>
  );
};
