import { TrashIcon } from "@heroicons/react/16/solid";
import { ChangeEvent } from "react";

interface SelectedListItemProps {
  item: { id: number; label: string; value: number };
  onChange: (value: number) => void;
  onDelete: (id: number) => void;
}

export const SelectedListItem = ({
  item,
  onChange,
  onDelete,
}: SelectedListItemProps) => {
  const handlerDeleteRecord = (id: number) => {
    onDelete(id);
  };

  const handlerOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (parseFloat(e.target.value) > 0) {
      onChange(parseFloat(e.target.value));
    } else {
      onChange(0);
    }
  };

  return (
    <>
      <span className={""}>{item.label}</span>
      <div className={"flex items-center"}>
        <input
          type={"number"}
          className={"form-control w-15 px-2 py-1"}
          onChange={handlerOnChange}
          value={item.value}
        />
        <button
          type={"button"}
          className={
            "w-5 h-5 text-red-600 hover:text-red-700 transition-colors cursor-pointer ml-2.5 inline-flex"
          }
          onClick={() => handlerDeleteRecord(item.id)}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};
