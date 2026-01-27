import { ShiftListItemDetailOrders } from "@widgets/workerShiftsHistory/shiftsList/ui/ShiftListItemDetailOrders.tsx";

export const ShiftListItemDetail = ({ id }: { id: number }) => {
  return (
    <div className={"border-[1px] rounded-md p-4 border-blue-500"}>
      <ShiftListItemDetailOrders id={id} />
    </div>
  );
};
