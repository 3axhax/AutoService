import { ShiftItem } from "@entities/shifts";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ShiftListItemDetail } from "@widgets/workerShiftsHistory/shiftsList/ui/ShiftListItemDetail.tsx";
import {MenuIcon} from "@shared/ui/Icons/MenuIcon.tsx";
import {InProgressIcon} from "@shared/ui/Icons/InProgressIcon.tsx";

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
    <span className={"text-orange-600"}><InProgressIcon className={'inline-flex w-5 h-5 mr-1'} />Смена не закрыта</span>
  );
  const totalValue = `${+item.totalOrdersSum + +item.totalAdditionalWorksSum} ₽`;
  return (
    <li
      className={
        "cursor-pointer border-1 rounded-lg border-stone-700/80 drop-shadow-lg px-2 py-2 odd:bg-stone-200/25"
      }
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <span className={"flex items-center"}>
        <MenuIcon className="h-6 w-6 text-blue-900 inline-flex mr-1" />
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
