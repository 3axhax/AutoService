import { ShiftListItemDetailOrders } from "./ShiftListItemDetailOrders";
import { ShiftListItemDetailAdditionalWorks } from "./ShiftListItemDetailAdditionalWorks";

export const ShiftListItemDetail = ({ id }: { id: number }) => {
  return (
    <div
      className={
        "flex flex-col gap-2 border-[1px] rounded-md p-4 border-blue-500"
      }
    >
      <ShiftListItemDetailOrders id={id} />
      <ShiftListItemDetailAdditionalWorks id={id} />
    </div>
  );
};
