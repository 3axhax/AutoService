import { ShiftItem } from "@entities/shifts";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ShiftListItemDetail } from "@widgets/workerShiftsHistory/shiftsList/ui/ShiftListItemDetail.tsx";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

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
    <span className={"text-green-700"}>Смена не закрыта</span>
  );
  const totalValue = `${+item.totalOrdersSum + +item.totalAdditionalWorksSum} ₽`;
  return (
    <li
      className={
        "cursor-pointer border-1 rounded-lg border-stone-700/80 drop-shadow-lg px-2 py-2 odd:bg-stone-200/55"
      }
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <span className={"flex"}>
        <CheckCircleIcon className="h-6 w-6 text-green-700 inline-flex mr-2" />
        Начало:&nbsp;{createdAt}, Окончание:&nbsp;{closedAt}, Сумма:&nbsp;
        <span className={"text-base font-medium"}>{totalValue}</span>
        <ChevronDownIcon
          className={`inline-flex h-5 w-5 ml-auto text-gray-600 transition-transform group-hover:text-green-800 duration-200 ${activeItem ? "rotate-180" : ""}`}
        />
      </span>
      {activeItem && <ShiftListItemDetail id={item.id} />}
    </li>
  );
};
