import { FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { InputWithLabel, RadioGroup, SelectList } from "@shared/ui";
import { GraphInput } from "./GraphInput";
import { OrderTotalValue } from "./OrderTotalValue";
import {
  formatedOrderParametersList,
  ParametersItem,
  ParametersType,
  selectOrderParametersOrdersValue,
} from "@entities/orderParameters";
import {
  addOrder,
  deleteActiveOrder,
  editOrder,
  orderErrorSelect,
  setOrdersValue,
} from "@entities/order";
import { TrashIcon } from "@heroicons/react/16/solid";
import { SelectOrRadio } from "@features/editOrderForm/ui/SelectOrRadio.tsx";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

interface EditOrderFormProps {
  orderId: number;
  onSuccess?: () => void;
  edit?: boolean;
}

export const EditOrderForm = ({
  orderId,
  onSuccess,
  edit = false,
}: EditOrderFormProps) => {
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

  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const handlerOnSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(edit ? editOrder(orderId) : addOrder(orderId)).then(() => {
      if (onSuccess) {
        onSuccess();
      }
    });
  };

  const SwitchParameterType = (parameter: ParametersItem) => {
    switch (parameter.type) {
      case ParametersType.INPUT:
        return (
          <InputWithLabel
            className={"self-end"}
            key={parameter.id}
            name={parameter.name}
            label={parameter.translationRu}
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
            className={"self-start"}
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

  return (
    <div>
      <form onSubmit={handlerOnSubmit} className={"w-full pt-12 pb-8 relative"}>
        <Carousel
          responsive={responsive}
          showDots={true}
          removeArrowOnDeviceType={["tablet", "mobile"]}
          containerClass={"w-full"}
          sliderClass={"slider"}
          dotListClass={"dot-list top-4 h-4"}
          renderDotsOutside={true}
        >
          {parametersList &&
            parametersList.map((parameter) => (
              <div
                className={
                  "shadow-gray-800/10 shadow-xs border-gray-800/20 border-1 px-4 mx-2 py-4 rounded-lg h-full"
                }
              >
                {SwitchParameterType(parameter)}
              </div>
            ))}
        </Carousel>
        {orderError && (
          <div
            className={"bg-red-200 border-1 rounded-md px-4 py-2 col-span-full"}
          >
            {orderError}
          </div>
        )}
        <OrderTotalValue
          orderId={orderId}
          className={"col-span-full border-b-2 w-fit"}
        />
        <div className={"col-span-full flex gap-2"}>
          <button className={"btn w-[calc(100%-46px)]"} type={"submit"}>
            {!edit ? "Завершить" : "Изменить"}
          </button>
          {!edit ? (
            <button
              type={"button"}
              className={
                "w-[36px] h-[36px] text-red-600 hover:text-red-700 transition-colors cursor-pointer"
              }
              onClick={() => dispatch(deleteActiveOrder(orderId))}
            >
              <TrashIcon className="w-[36px] h-[36px]" />
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
};
