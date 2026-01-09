import { useAppDispatch } from "@shared/store/hooks.ts";
import { addNewActiveOrder } from "@entities/order";

export const CreateNewOrder = () => {
  const dispatch = useAppDispatch();

  const clickHandler = () => {
    console.log("Новый заказ");
    dispatch(addNewActiveOrder());
  };

  return (
    <button className={"btn"} onClick={clickHandler}>
      Новый заказ
    </button>
  );
};
