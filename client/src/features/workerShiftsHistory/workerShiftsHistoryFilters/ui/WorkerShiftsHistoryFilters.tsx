import { DateSelectInterval } from "@shared/ui";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { getShiftsList, setShiftsFilters } from "@entities/shifts";
import { parseDateFromFormat } from "@shared/utils/parseDateFromFormat";

export const WorkerShiftsHistoryFilters = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.shifts.filters);
  const onChangeShiftClosedAt = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    if ((start && end) || (!start && !end)) {
      const dateOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      };
      dispatch(
        setShiftsFilters({
          closedAtStart: !start
            ? start
            : start.toLocaleString("ru", dateOptions),
          closedAtEnd: !end ? end : end.toLocaleString("ru", dateOptions),
        }),
      );
      dispatch(getShiftsList());
    }
  };
  return (
    <div className={"mb-4 flex"}>
      <DateSelectInterval
        placeholder={"Интервал окончания смены"}
        onChange={onChangeShiftClosedAt}
        startDate={
          filters.closedAtStart
            ? parseDateFromFormat(filters.closedAtStart)
            : null
        }
        endDate={
          filters.closedAtEnd ? parseDateFromFormat(filters.closedAtEnd) : null
        }
      />
    </div>
  );
};
