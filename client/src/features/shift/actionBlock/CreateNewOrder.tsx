import { useAppDispatch } from "@shared/store/hooks.ts";
import { addNewActiveOrder } from "@entities/order";

export const CreateNewOrder = () => {
  const dispatch = useAppDispatch();

  const clickHandler = () => {
    dispatch(addNewActiveOrder());
  };

  return (
    <button className={"btn btn-purple"} onClick={clickHandler}>
      Новый заказ
    </button>
  );
};
