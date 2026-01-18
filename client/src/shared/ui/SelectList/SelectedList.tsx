import { SelectedListItem } from "@shared/ui/SelectList/SelectedListItem.tsx";

interface SelectedListProps {
  list: { id: number; label: string; value: number }[];
  onChange: ({ id, value }: { id: number; value: number }) => void;
  onDelete: (id: number) => void;
}

export const SelectedList = ({
  list,
  onChange,
  onDelete,
}: SelectedListProps) => {
  return (
    <ul className={"flex flex-col mb-2"}>
      {list &&
        list.map((item) => (
          <li
            key={item.id}
            className={
              "flex justify-between border-b-1 border-gray-400 last:border-b-0 items-center p-2 even:bg-gray-300/20"
            }
          >
            <SelectedListItem
              item={item}
              onChange={(value) => {
                onChange({ id: item.id, value });
              }}
              onDelete={onDelete}
            />
          </li>
        ))}
    </ul>
  );
};
