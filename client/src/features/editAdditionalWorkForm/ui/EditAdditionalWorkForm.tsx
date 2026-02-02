import { FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { InputWithLabel } from "@shared/ui";
import {
  editAdditionalWork,
  selectAdditionalWorkValue,
} from "@entities/additionalWorks";
import {
  addAdditionalWork,
  deleteActiveAdditionalWork,
  additionalWorkErrorSelect,
  setAdditionalWorksValue,
} from "@entities/additionalWorks";
import { TrashIcon } from "@heroicons/react/24/outline";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { ExtraIcon } from "@shared/ui/Icons/Extra.tsx";

interface EditAdditionalWorkFormProps {
  additionalWorkId: number;
  onSuccess?: () => void;
  edit?: boolean;
}

export const EditAdditionalWorkForm = ({
  additionalWorkId,
  onSuccess,
  edit,
}: EditAdditionalWorkFormProps) => {
  const dispatch = useAppDispatch();
  const values = useAppSelector((state) =>
    selectAdditionalWorkValue(state, additionalWorkId),
  );

  const additionalWorkError = useAppSelector(additionalWorkErrorSelect);

  const setValue = ({
    name,
    value,
  }: {
    name: string;
    value: string | number;
  }) => {
    dispatch(
      setAdditionalWorksValue({
        additionalWorkId: additionalWorkId,
        name,
        value,
      }),
    );
  };

  const handlerOnSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(
      edit
        ? editAdditionalWork(additionalWorkId)
        : addAdditionalWork(additionalWorkId),
    ).then(() => {
      if (onSuccess) {
        onSuccess();
      }
    });
  };

  return (
    <div className={"mb-8"}>
      <h2
        className={
          "text-2xl mb-3 lg:mb-6 text-gray-700 dark:text-gray-50 text-left lg:text-center"
        }
      >
        <ExtraIcon className={"h-7 w-7 inline-flex mr-2"} />
        Запись о дополнительной работе
      </h2>
      <form
        onSubmit={handlerOnSubmit}
        className={"grid gap-5 lg:gap-3 grid-cols-1 lg:grid-cols-[80%_20%]"}
      >
        <InputWithLabel
          className={"self-end"}
          name={"description"}
          label={"Описание"}
          value={values.description ?? ""}
          onChange={(value) => setValue({ name: "description", value })}
        />
        <InputWithLabel
          className={"self-end"}
          name={"totalValue"}
          label={"Сумма"}
          value={values.totalValue ?? ""}
          type={"number"}
          onChange={(value) => setValue({ name: "totalValue", value })}
        />
        {additionalWorkError && (
          <div
            className={"bg-red-200 border-1 rounded-md px-4 py-2 col-span-full"}
          >
            {additionalWorkError}
          </div>
        )}
        <div
          className={
            "col-span-full flex items-center justify-center gap-2 mt-4"
          }
        >
          <button className={`btn btn-blue-dark w-1/2`} type={"submit"}>
            <PencilSquareIcon className="w-5 h-5 inline-flex mr-1" />
            {!edit ? "Записать" : "Изменить"}
          </button>
          {!edit ? (
            <button
              type={"button"}
              className={
                "flex-grow flex-shrink-0 lg:flex-grow-0 lg:flex-shrink lg:basis-auto btn btn-beige cursor-pointer text-red-600 hover:text-red-800 shadow-gray-800/40 hover:shadow-gray-500 dark:hover:shadow-gray-950/20 outline-1 outline-stone-800/20 hover:outline-stone-800/40"
              }
              onClick={() =>
                dispatch(deleteActiveAdditionalWork(additionalWorkId))
              }
            >
              <TrashIcon className="w-5 h-5 inline-flex mr-1" />
              Удалить
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
};
