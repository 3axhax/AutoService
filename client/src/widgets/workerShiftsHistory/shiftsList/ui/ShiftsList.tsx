import { useAppSelector } from "@shared/store/hooks.ts";
import { SelectShiftListSortByCreated } from "@entities/shifts";
import { ShiftsListItem } from "./ShiftsListItem.tsx";
import { useState } from "react";

export const ShiftsList = () => {
  const shiftsList = useAppSelector(SelectShiftListSortByCreated);
  const [openedItem, setOpenedItem] = useState<number>(0);

  const handlerOnclick = (id: number) => {
    setOpenedItem(id === openedItem ? 0 : id);
  };

  return (
    <ul className={"text-start flex flex-col gap-2"}>
      {shiftsList.map((item) => (
        <ShiftsListItem
          key={item.id}
          item={item}
          onClick={() => handlerOnclick(item.id)}
          activeItem={openedItem === item.id}
        />
      ))}
    </ul>
  );
};
