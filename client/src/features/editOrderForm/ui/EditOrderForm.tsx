import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import {
  formatedOrderParametersList,
  setOrdersValue,
} from "@entities/orderParameters";
import { InputWithLabel } from "@shared/ui/InputWithLabel.tsx";
import SelectUI from "@shared/ui/SelectUI.tsx";
import RadioGroup from "@shared/ui/RadioGroup.tsx";
import { FormEvent } from "react";
import { selectOrderParametersOrdersValue } from "@entities/orderParameters/model/selectors.ts";

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
    value: string | number;
  }) => {
    dispatch(setOrdersValue({ orderId: 0, name, value }));
  };

  const handlerOnSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(values);
  };

  return (
    <div>
      <form onSubmit={handlerOnSubmit} className={"flex"}>
        {parametersList &&
          parametersList.map((parameter) => {
            switch (parameter.type) {
              case "INPUT":
                return (
                  <InputWithLabel
                    key={parameter.id}
                    name={parameter.name}
                    label={parameter.translationRu}
                    value={values[parameter.name] ?? ""}
                    onChange={(value) =>
                      setValue({ name: parameter.name, value })
                    }
                  />
                );
              case "SELECT":
                return (
                  <SelectUI
                    key={parameter.id}
                    label={parameter.translationRu}
                    name={parameter.name}
                    options={parameter.options.map((item) => ({
                      value: item.id.toString(),
                      label: item.translationRu,
                    }))}
                    value={values[parameter.name] ?? ""}
                    onChange={(value) =>
                      setValue({ name: parameter.name, value })
                    }
                  />
                );
              case "RADIO":
                return (
                  <RadioGroup
                    key={parameter.id}
                    label={parameter.translationRu}
                    name={parameter.name}
                    options={parameter.options.map((item) => ({
                      value: item.id.toString(),
                      label: item.translationRu,
                    }))}
                    value={values[parameter.name] ?? ""}
                    onChange={(value) =>
                      setValue({ name: parameter.name, value })
                    }
                  />
                );
            }
          })}
        <button className={"btn"} type={"submit"}>
          Закрыть
        </button>
      </form>
    </div>
  );
};
