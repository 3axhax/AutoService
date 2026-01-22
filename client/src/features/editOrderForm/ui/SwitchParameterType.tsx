import {
  ParametersItem,
  ParametersType,
  selectOrderParametersOrdersValue,
} from "@entities/orderParameters";
import { InputWithLabel, RadioGroup, SelectList } from "@shared/ui";
import { SelectOrRadio } from "@features/editOrderForm/ui/SelectOrRadio.tsx";
import { GraphInput } from "@features/editOrderForm/ui/GraphInput.tsx";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { setOrdersValue } from "@entities/order";
import Carousel from "react-multi-carousel";

interface SwitchParameterTypeProps {
  parameter: ParametersItem;
  orderId: number;
  carousel?: Carousel;
}

export const SwitchParameterType = ({
  parameter,
  orderId,
  carousel,
}: SwitchParameterTypeProps) => {
  const dispatch = useAppDispatch();

  const values = useAppSelector((state) =>
    selectOrderParametersOrdersValue(state, orderId),
  );

  const setValue = ({
    name,
    value,
  }: {
    name: string;
    value: string | number | Record<string, number>;
  }) => {
    if (
      carousel &&
      [ParametersType.SELECT, ParametersType.INPUT].includes(parameter.type) &&
      !values[parameter.name]
    ) {
      carousel.next(1);
    }
    dispatch(setOrdersValue({ orderId: orderId, name, value }));
  };

  switch (parameter.type) {
    case ParametersType.INPUT:
      return (
        <InputWithLabel
          className={"self-end"}
          key={parameter.id}
          name={parameter.name}
          label={parameter.translationRu}
          placeholder={parameter.translationRu}
          value={(values[parameter.name] as string) ?? ""}
          onChange={(value) => setValue({ name: parameter.name, value })}
        />
      );
    case ParametersType.SELECT:
      return (
        <SelectOrRadio
          key={parameter.id}
          parameter={parameter}
          value={(values[parameter.name] as string) ?? ""}
          onChange={(value) => setValue({ name: parameter.name, value })}
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
          onChange={(value) => setValue({ name: parameter.name, value })}
        />
      );
    case ParametersType.SELECT_LIST:
      return (
        <SelectList<string>
          key={parameter.id}
          name={parameter.name}
          label={parameter.translationRu}
          placeholder={`${parameter.translationRu}...`}
          className={"text-left"}
          options={parameter.options.map((item) => ({
            value: item.id.toString(),
            label: item.translationRu,
          }))}
          value={(values[parameter.name] as Record<string, number>) ?? {}}
          onChange={(value) => setValue({ name: parameter.name, value })}
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
};
