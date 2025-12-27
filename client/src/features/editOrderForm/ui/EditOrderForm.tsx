import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  formatedOrderParametersList,
  ParametersType,
  setOrdersValue,
} from "@entities/orderParameters";
import { InputWithLabel } from "@shared/ui/InputWithLabel.tsx";
import SelectUI from "@shared/ui/SelectUI.tsx";
import RadioGroup from "@shared/ui/RadioGroup.tsx";
import { FormEvent } from "react";
import { selectOrderParametersOrdersValue } from "@entities/orderParameters/model/selectors.ts";
import { SelectList } from "@shared/ui/SelectList";

export const EditOrderForm = () => {
  const dispatch = useAppDispatch();
  const parametersList = useAppSelector((state) =>
    formatedOrderParametersList(state, 0),
  );
  const values = useAppSelector((state) =>
    selectOrderParametersOrdersValue(state, 0),
  );

  const setValue = ({
    name,
    value,
  }: {
    name: string;
    value: string | number | Record<string, number>;
  }) => {
    dispatch(setOrdersValue({ orderId: 0, name, value }));
  };

  const handlerOnSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(values);
  };

  return (
    <div>
      <form onSubmit={handlerOnSubmit} className={"grid gap-5 grid-cols-4"}>
        {parametersList &&
          parametersList.map((parameter) => {
            switch (parameter.type) {
              case ParametersType.INPUT:
                return (
                  <InputWithLabel
                    className={"self-end"}
                    key={parameter.id}
                    name={parameter.name}
                    label={parameter.translationRu}
                    value={(values[parameter.name] as string) ?? ""}
                    onChange={(value) =>
                      setValue({ name: parameter.name, value })
                    }
                  />
                );
              case ParametersType.SELECT:
                return (
                  <SelectUI
                    className={"self-start"}
                    key={parameter.id}
                    label={parameter.translationRu}
                    name={parameter.name}
                    options={parameter.options.map((item) => ({
                      value: item.id.toString(),
                      label: item.translationRu,
                    }))}
                    value={(values[parameter.name] as string) ?? ""}
                    onChange={(value) =>
                      setValue({ name: parameter.name, value })
                    }
                  />
                );
              case ParametersType.RADIO:
                return (
                  <RadioGroup
                    key={parameter.id}
                    label={parameter.translationRu}
                    name={parameter.name}
                    options={parameter.options.map((item) => ({
                      value: item.id.toString(),
                      label: item.translationRu,
                    }))}
                    value={(values[parameter.name] as string) ?? ""}
                    onChange={(value) =>
                      setValue({ name: parameter.name, value })
                    }
                  />
                );
              case ParametersType.SELECT_LIST:
                return (
                  <SelectList<string>
                    key={parameter.id}
                    name={parameter.name}
                    label={parameter.translationRu}
                    placeholder={`${parameter.translationRu}...`}
                    className={"self-start"}
                    options={parameter.options.map((item) => ({
                      value: item.id.toString(),
                      label: item.translationRu,
                    }))}
                    value={
                      (values[parameter.name] as Record<string, number>) ?? {}
                    }
                    onChange={(value) =>
                      setValue({ name: parameter.name, value })
                    }
                  />
                );
            }
          })}
        <button className={"btn col-span-full"} type={"submit"}>
          Закрыть
        </button>
      </form>
    </div>
  );
};
