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
    <ul className={"flex flex-col gap-2 pb-2"}>
      {list &&
        list.map((item) => (
          <li key={item.id} className={"flex justify-between"}>
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
