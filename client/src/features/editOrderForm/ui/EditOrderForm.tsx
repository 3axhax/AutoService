import { FormEvent, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { OrderTotalValue } from "./OrderTotalValue";
import { formatedOrderParametersList } from "@entities/orderParameters";
import {
  addOrder,
  deleteActiveOrder,
  editOrder,
  orderErrorSelect,
} from "@entities/order";
import { TrashIcon } from "@heroicons/react/16/solid";
import Carousel, { DotProps } from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { SwitchParameterType } from "./SwitchParameterType";

interface EditOrderFormProps {
  orderId: number;
  onSuccess?: () => void;
  edit?: boolean;
  carouselMaxItems?: number;
}

export const EditOrderForm = ({
  orderId,
  onSuccess,
  edit = false,
  carouselMaxItems = 5,
}: EditOrderFormProps) => {
  const dispatch = useAppDispatch();
  const parametersList = useAppSelector((state) =>
    formatedOrderParametersList(state, orderId),
  );
  const orderError = useAppSelector(orderErrorSelect);

  const carouselRef = useRef<Carousel>(null);

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: Math.min(5, carouselMaxItems),
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: Math.min(4, carouselMaxItems),
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: Math.min(2, carouselMaxItems),
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: Math.min(1, carouselMaxItems),
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

  const CustomDot = ({ index, onClick, active }: DotProps) => {
    return (
      <li data-index={index} className={"dot-carousel"}>
        <button
          aria-label={`Go to slide ${index}`}
          type={"button"}
          onClick={onClick}
          className={`shadow-sm shadow-blue-900 font-medium text-base hover:scale-125 transition-transform duration-200 cursor-pointer shadow-gray-800/10 h-7 w-7 rounded-full border-1 border-blue-900 text-blue-900 mr-2 ${active ? "bg-blue-900 text-white" : ""}`}
        >
          {index ? index + 1 : "1"}
        </button>
      </li>
    );
  };

  return (
    <div>
      <form onSubmit={handlerOnSubmit} className={"w-full pt-12 pb-8 relative"}>
        <Carousel
          ref={carouselRef}
          responsive={responsive}
          showDots={true}
          removeArrowOnDeviceType={["tablet", "mobile"]}
          containerClass={"w-full"}
          sliderClass={"slider"}
          dotListClass={"dot-list top-4 h-4"}
          renderDotsOutside={true}
          customDot={<CustomDot />}
        >
          {parametersList &&
            parametersList.map((parameter) => (
              <div
                className={
                  "shadow-gray-800/10 shadow-xs border-gray-800/20 border-1 px-4 mx-2 py-4 rounded-lg h-full"
                }
              >
                <SwitchParameterType
                  parameter={parameter}
                  orderId={orderId}
                  carousel={carouselRef.current ?? undefined}
                />
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
          <button className={"btn w-full"} type={"submit"}>
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
