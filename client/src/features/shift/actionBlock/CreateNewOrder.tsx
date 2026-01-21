import { useAppDispatch } from "@shared/store/hooks.ts";
import { addNewActiveOrder } from "@entities/order";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

export const CreateNewOrder = () => {
  const dispatch = useAppDispatch();

  const clickHandler = () => {
    dispatch(addNewActiveOrder());
  };

  return (
    <button className={"btn btn-blue-light inline-flex"} onClick={clickHandler}>
      <PlusCircleIcon className="h-5 w-5 inline-flex mr-1 -ml-1 text-white" />
      Новый заказ
    </button>
  );
};
