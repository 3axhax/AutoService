import { FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { InputWithLabel, RadioGroup, SelectList, SelectUI } from "@shared/ui";
import { GraphInput } from "./GraphInput";
import { OrderTotalValue } from "./OrderTotalValue";
import {
  formatedOrderParametersList,
  ParametersType,
  selectOrderParametersOrdersValue,
} from "@entities/orderParameters";
import { addOrder, orderErrorSelect, setOrdersValue } from "@entities/order";

export const EditOrderForm = () => {
  const orderId = 0;

  const dispatch = useAppDispatch();
  const parametersList = useAppSelector((state) =>
    formatedOrderParametersList(state, orderId),
  );
  const values = useAppSelector((state) =>
    selectOrderParametersOrdersValue(state, orderId),
  );

  const orderError = useAppSelector(orderErrorSelect);

  const setValue = ({
    name,
    value,
  }: {
    name: string;
    value: string | number | Record<string, number>;
  }) => {
    dispatch(setOrdersValue({ orderId: orderId, name, value }));
  };

  const handlerOnSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(values);
    dispatch(addOrder(orderId));
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
              case ParametersType.GRAPH_INPUT:
                return (
                  <GraphInput
                    key={parameter.id}
                    label={parameter.translationRu}
                    className={"self-end"}
                    value={(values[parameter.name] as string) ?? ""}
                    onChange={(value) => {
                      setValue({ name: parameter.name, value });
                    }}
                  />
                );
            }
          })}
        <OrderTotalValue orderId={orderId} />
        {orderError && (
          <div
            className={"bg-red-200 border-1 rounded-md px-4 py-2 col-span-full"}
          >
            {orderError}
          </div>
        )}
        <button className={"btn col-span-full"} type={"submit"}>
          Завершить
        </button>
      </form>
    </div>
  );
};
