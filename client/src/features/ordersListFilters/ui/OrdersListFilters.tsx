import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { AddNewFilter } from "./AddNewFilter";
import { FiltersList } from "./FiltersList";

export const OrdersListFilters = () => {
  const { openModal, closeModal } = useInfoModalData();

  const handlerAddFilter = () => {
    openModal({
      title: `Добавить фильтр`,
      body: <AddNewFilter onCancel={closeModal} />,
      hasButtons: false,
    });
  };

  return (
    <div className={"flex items-center gap-2"}>
      <button className={"btn btn-blue-light"} onClick={handlerAddFilter}>
        <PlusCircleIcon className="h-5 w-5 inline-flex mr-1 -ml-1 text-white" />
        Добавить фильтр
      </button>
      <FiltersList />
    </div>
  );
};
