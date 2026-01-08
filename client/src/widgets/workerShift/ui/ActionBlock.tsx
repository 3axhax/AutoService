import { useAppSelector } from "@shared/store/hooks.ts";
import { SelectWorkerActiveShift } from "@entities/shifts";

export const ActionBlock = () => {
  const isActiveShift = useAppSelector(SelectWorkerActiveShift);
  return (
    <div className={"flex justify-between"}>
      <div className={"flex justify-start gap-3"}>
        {!isActiveShift ? (
          <>
            <button className={"btn"}>Начать смену</button>
          </>
        ) : (
          <>
            <button className={"btn"}>Новый заказ</button>
            <button className={"btn"}>Дополнительные работы</button>
          </>
        )}
      </div>
      <div className={"flex justify-end gap-3"}>
        {isActiveShift && <button className={"btn"}>Закончить смену</button>}
      </div>
    </div>
  );
};
