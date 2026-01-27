import { ShiftItem } from "@entities/shifts";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ShiftListItemDetail } from "@widgets/workerShiftsHistory/shiftsList/ui/ShiftListItemDetail.tsx";

interface ShiftsListItemProps {
  item: ShiftItem;
  onClick?: () => void;
  activeItem?: boolean;
}

export const ShiftsListItem = ({
  item,
  onClick,
  activeItem,
}: ShiftsListItemProps) => {
  const createdAt = new Date(item.createdAt).toLocaleString("ru-RU");
  const closedAt = item.closedAt ? (
    new Date(item.closedAt).toLocaleString("ru-RU")
  ) : (
    <span className={"text-green-600"}>Смена не закрыта</span>
  );
  const totalValue = `${+item.totalOrdersSum + +item.totalAdditionalWorksSum} ₽`;
  return (
    <li
      className={"cursor-pointer"}
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <div>
        <ChevronDownIcon
          className={`inline-flex h-4 w-4 mr-2 text-gray-600 transition-transform group-hover:text-green-800 duration-200 ${activeItem ? "rotate-180" : ""}`}
        />
        Начало - {createdAt}, Окончание - {closedAt}, Сумма - {totalValue}
      </div>
      {activeItem && <ShiftListItemDetail id={item.id} />}
    </li>
  );
};
