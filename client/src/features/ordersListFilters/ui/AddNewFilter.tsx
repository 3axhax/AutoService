import { selectOrderParametersList } from "@entities/orderParameters";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { SelectUI } from "@shared/ui";
import { useEffect, useState } from "react";
import { AddNewFilterParameterOptions } from "@features/ordersListFilters/ui/AddNewFilterParameterOptions.tsx";
import { addFilter, FilterItem } from "@entities/order";

interface AddNewFilterProps {
  onCancel: () => void;
}

export const AddNewFilter = ({ onCancel }: AddNewFilterProps) => {
  const dispatch = useAppDispatch();

  const parameterList = useAppSelector(selectOrderParametersList);
  const [selectedParameter, setSelectedParameter] = useState<number>(0);
  const [value, setValue] = useState<string | number | null>(null);
  const [filterValue, setFilterValue] = useState<FilterItem | null>(null);
  const onChange = (value: number) => {
    setSelectedParameter(value);
  };

  const onAccess = () => {
    if (filterValue) {
      dispatch(addFilter(filterValue));
      onCancel();
    }
  };

  useEffect(() => {
    if (value) {
      const parameter = parameterList.find(
        (parameter) => parameter.id === selectedParameter,
      );
      if (parameter) {
        setFilterValue({
          filterName: parameter.name,
          filterValue: value,
        });
      }
    }
  }, [value, parameterList, selectedParameter]);

  useEffect(() => {
    setFilterValue(null);
    setValue(null);
  }, [selectedParameter]);

  return (
    <div>
      <div className={"flex items-center gap-2 justify-between"}>
        <SelectUI<number>
          key={"parameter"}
          label={"Параметр для фильтрации"}
          name={"parameter"}
          options={parameterList.map((item) => ({
            value: item.id,
            label: item.translationRu,
          }))}
          value={selectedParameter}
          onChange={onChange}
        />
        <AddNewFilterParameterOptions
          parameter={parameterList.find(
            (parameter) => parameter.id === selectedParameter,
          )}
          value={value}
          setValue={setValue}
        />
      </div>
      <div className="flex items-center justify-stretch gap-5 lg:gap-3 flex-wrap mt-2">
        <button
          className={"btn btn-orange flex-grow w-1/2 ml-auto"}
          type={"button"}
          onClick={onAccess}
        >
          Добавить
        </button>
        <button
          type={"button"}
          className={
            "flex-grow flex-shrink-0 lg:flex-grow-0 lg:flex-shrink lg:basis-auto btn btn-beige cursor-pointer text-red-600 hover:text-red-800 shadow-gray-800/40 dark:hover:shadow-gray-950/20 hover:shadow-gray-500 outline-1 outline-stone-800/20 hover:outline-stone-800/40"
          }
          onClick={onCancel}
        >
          Отменить
        </button>
      </div>
    </div>
  );
};
