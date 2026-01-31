import { ShiftListItemDetailOrders } from "./ShiftListItemDetailOrders";
import { ShiftListItemDetailAdditionalWorks } from "./ShiftListItemDetailAdditionalWorks";

export const ShiftListItemDetail = ({ id }: { id: number }) => {
  return (
    <div className={"flex flex-col gap-4 lg:gap-8 lg:p-2"}>
      <ShiftListItemDetailOrders id={id} />
      <ShiftListItemDetailAdditionalWorks id={id} />
    </div>
  );
};
