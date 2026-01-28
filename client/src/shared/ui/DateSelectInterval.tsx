import { forwardRef, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { ru } from "date-fns/locale/ru";
import { XMarkIcon } from "@heroicons/react/16/solid";

import "react-datepicker/dist/react-datepicker.css";
registerLocale("ru", ru);

interface ExampleCustomInputProps {
  className?: string;
  value?: string;
  onClick?: () => void;
}

interface DateSelectProps {
  placeholder?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  onChange?: (dates: [Date | null, Date | null]) => void;
}

export const DateSelectInterval = ({
  placeholder,
  startDate: startDateProps,
  endDate: endDateProps,
  onChange: onChangeProps,
}: DateSelectProps) => {
  const [startDate, setStartDate] = useState<Date | null>(
    startDateProps ?? null,
  );
  const [endDate, setEndDate] = useState<Date | null>(endDateProps ?? null);

  const onChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    if (onChangeProps) {
      onChangeProps(dates);
    }
  };

  const clearDate = () => {
    if (onChangeProps && startDate && endDate) {
      onChangeProps([null, null]);
    }
    setStartDate(null);
    setEndDate(null);
  };

  const ExampleCustomInput = forwardRef<
    HTMLButtonElement,
    ExampleCustomInputProps
  >(({ value, onClick, className }, ref) => {
    return (
      <button type="button" className={className} onClick={onClick} ref={ref}>
        {value !== "" ? value : placeholder}
      </button>
    );
  });

  return (
    <div className={"flex flex-row-reverse"}>
      {(startDate || endDate) && (
        <button
          type={"button"}
          className={"btn btn-orange p-2 ml-2"}
          onClick={clearDate}
        >
          <XMarkIcon className={"h-[20px] w-[20px] text-red-900"} />
        </button>
      )}
      <DatePicker
        locale={ru}
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={onChange}
        dateFormat="P"
        placeholderText={placeholder ?? "Укажите интервал"}
        customInput={
          <ExampleCustomInput className="btn btn-blue-light min-w-[220px]" />
        }
      />
    </div>
  );
};
