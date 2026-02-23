import {
  FilterItem,
  getOrdersListForAdmin,
  removeFilter,
  setCurrentPage,
} from "@entities/order";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { selectFormatedParameterForFilter } from "@entities/orderParameters/model";
import { XMarkIcon } from "@heroicons/react/16/solid";

interface FiltersListItemProps {
  filter: FilterItem;
}

export const FiltersListItem = ({ filter }: FiltersListItemProps) => {
  const dispatch = useAppDispatch();
  const parameter = useAppSelector((state) =>
    selectFormatedParameterForFilter(state, filter),
  );
  const removeFilterHandler = () => {
    dispatch(removeFilter(filter.filterName));
    dispatch(setCurrentPage(1));
    dispatch(getOrdersListForAdmin());
  };
  return (
    <div className={"rounded-md px-3 py-2 btn-white cursor-default"}>
      {parameter?.parameterName}: "{parameter?.value}"
      <XMarkIcon
        className="w-5 h-5 inline-flex ml-1 cursor-pointer text-red-600 hover:text-red-800"
        onClick={removeFilterHandler}
      />
    </div>
  );
};
