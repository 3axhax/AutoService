import { ShiftItem } from "@entities/shifts";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { ShiftListItemDetail } from "@widgets/workerShiftsHistory/shiftsList/ui/ShiftListItemDetail.tsx";
import { MenuIcon } from "@shared/ui/Icons/MenuIcon.tsx";
import { InProgressIcon } from "@shared/ui/Icons/InProgressIcon.tsx";

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
    <span className={"text-orange-600 dark:text-orange-400"}>
      <InProgressIcon className={"inline-flex w-5 h-5 mr-1"} />
      Смена не закрыта
    </span>
  );
  const totalValue = +item.totalOrdersSum + +item.totalAdditionalWorksSum;
  const totalValueWithDiscount =
    +item.totalOrdersSumWithDiscount + +item.totalAdditionalWorksSum;
  return (
    <li
      className={
        "cursor-pointer bg-white dark:bg-gray-950 border-1 rounded-lg border-stone-700/80 transition-shadow ease-in-out duration-200 shadow-lg px-2 py-2 group hover:shadow-blue-950/55"
      }
      onClick={() => {
        if (onClick) onClick();
      }}
    >
      <span
        className={
          "flex flex-col lg:flex-row items-start lg:items-center text-gray-700 dark:text-white"
        }
      >
        <span>
          <MenuIcon className="h-6 w-6 text-blue-900 dark:text-blue-400 inline-flex lg:mx-1 -mt-1" />
          Начало:&nbsp;{createdAt},&nbsp;
        </span>
        <span>Окончание:&nbsp;{closedAt},&nbsp;</span>
        <span>
          Сумма:&nbsp;
          <span className={"text-base font-medium"}>
            {totalValueWithDiscount} ₽
          </span>
          &nbsp;
          {totalValueWithDiscount !== totalValue ? (
            <span className={"ml-2 text-sm"}>(без скидки {totalValue} ₽)</span>
          ) : null}
        </span>
        <ChevronDownIcon
          className={`absolute lg:relative right-4 inline-flex h-5 w-5 ml-auto mr-2 text-gray-600 dark:text-white/80 transition-transform group-hover:text-blue-950 dark:group-hover:text-white duration-200 ${activeItem ? "rotate-180" : ""}`}
        />
      </span>
      {activeItem && <ShiftListItemDetail id={item.id} />}
    </li>
  );
};
