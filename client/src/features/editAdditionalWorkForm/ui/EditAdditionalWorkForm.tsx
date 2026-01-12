import { FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { InputWithLabel } from "@shared/ui";
import { selectAdditionalWorkParametersAdditionalWorksValue } from "@entities/additionalWorks";
import {
  addAdditionalWork,
  deleteActiveAdditionalWork,
  additionalWorkErrorSelect,
  setAdditionalWorksValue,
} from "@entities/additionalWorks";
import { TrashIcon } from "@heroicons/react/16/solid";

interface EditAdditionalWorkFormProps {
  additionalWorkId: number;
  onSuccess?: () => void;
}

export const EditAdditionalWorkForm = ({
  additionalWorkId,
  onSuccess,
}: EditAdditionalWorkFormProps) => {
  const dispatch = useAppDispatch();
  const values = useAppSelector((state) =>
    selectAdditionalWorkParametersAdditionalWorksValue(state, additionalWorkId),
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
    dispatch(addAdditionalWork(additionalWorkId)).then(() => {
      if (onSuccess) {
        onSuccess();
      }
    });
  };

  return (
    <div className={"mt-5"}>
      <form
        onSubmit={handlerOnSubmit}
        className={"grid gap-3 grid-cols-[80%_20%]"}
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
        <div className={"col-span-full flex gap-2"}>
          <button className={"btn w-[calc(100%-46px)]"} type={"submit"}>
            Записать
          </button>
          <button
            type={"button"}
            className={
              "w-[36px] h-[36px] text-red-600 hover:text-red-700 transition-colors cursor-pointer"
            }
            onClick={() =>
              dispatch(deleteActiveAdditionalWork(additionalWorkId))
            }
          >
            <TrashIcon className="w-[36px] h-[36px]" />
          </button>
        </div>
      </form>
    </div>
  );
};
