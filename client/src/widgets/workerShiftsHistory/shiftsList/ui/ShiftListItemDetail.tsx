import { ShiftListItemDetailOrders } from "./ShiftListItemDetailOrders";
import { ShiftListItemDetailAdditionalWorks } from "./ShiftListItemDetailAdditionalWorks";

export const ShiftListItemDetail = ({ id }: { id: number }) => {
  return (
    <div
      className={
        "flex flex-col gap-8 py-2"
      }
    >
      <ShiftListItemDetailOrders id={id} />
      <ShiftListItemDetailAdditionalWorks id={id} />
    </div>
  );
};
