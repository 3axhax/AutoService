import { DateSelectInterval } from "@shared/ui";
import { useAppDispatch } from "@shared/store/hooks.ts";
import { getShiftsList, setShiftsFilters } from "@entities/shifts";

export const WorkerShiftsHistoryFilters = () => {
  const dispatch = useAppDispatch();
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
      />
    </div>
  );
};
