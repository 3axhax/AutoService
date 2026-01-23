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
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import Carousel, {
  DotProps,
  Direction,
  ButtonGroupProps,
} from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { SwitchParameterType } from "./SwitchParameterType";
import { ChevronLeftIcon } from "@shared/ui/Icons/ChevronLeft.tsx";

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
          className={`shadow-sm font-medium text-base hover:scale-125 transition-transform duration-200 cursor-pointer shadow-gray-800/20 hover:shadow-gray-800/50 h-7 w-7 rounded-full border-1 border-blue-900 text-blue-900 mr-2 ${active ? "bg-blue-900 text-white" : ""}`}
        >
          {index ? index + 1 : "1"}
        </button>
      </li>
    );
  };

  const ButtonArrow = ({
    onClick,
    direction,
    disabled,
  }: {
    onClick?: () => void;
    direction: Direction;
    disabled?: boolean;
  }) => {
    return (
      <button
        onClick={onClick}
        type={"button"}
        className={`absolute cursor-pointer top-1/2 -translate-y-1/2 text-blue-900 hover:text-orange-500 transition-colors duration-200 ${direction === "left" ? "-left-8" : "-right-8 rotate-180"} ${disabled ? "hidden" : ""}`}
        aria-label={direction === "left" ? "Previous slide" : "Next slide"}
      >
        {direction === "left" ? (
          <ChevronLeftIcon className={"h-10 w-10"} />
        ) : (
          <ChevronLeftIcon className={"h-10 w-10"} />
        )}
      </button>
    );
  };

  const ButtonGroup = ({ next, previous, ...rest }: ButtonGroupProps) => {
    const disabledLeft = rest.carouselState?.currentSlide === 0;
    const disabledRight =
      rest.carouselState &&
      rest.carouselState.currentSlide ===
        rest.carouselState.totalItems - rest.carouselState.slidesToShow;
    return (
      <div className="carousel-button-group">
        <ButtonArrow
          direction={"right"}
          disabled={disabledRight}
          onClick={next}
        />
        <ButtonArrow
          direction={"left"}
          disabled={disabledLeft}
          onClick={previous}
        />
      </div>
    );
  };

  return (
    <form
      onSubmit={handlerOnSubmit}
      className={"w-full my-10 container px-4 lg:px-8"}
    >
      <div className={"relative pt-12 pb-3"}>
        <Carousel
          ref={carouselRef}
          responsive={responsive}
          showDots={true}
          removeArrowOnDeviceType={["tablet", "mobile"]}
          containerClass={""}
          sliderClass={"slider"}
          dotListClass={"dot-list top-4 h-4"}
          renderDotsOutside={true}
          arrows={false}
          renderButtonGroupOutside={true}
          customDot={<CustomDot />}
          customButtonGroup={<ButtonGroup />}
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
      </div>
      {orderError && (
        <div
          className={"bg-red-200 border-1 rounded-md px-4 py-2 col-span-full"}
        >
          {orderError}
        </div>
      )}
      <div className="flex items-center justify-stretch gap-3">
          <button className={"btn btn-orange w-1/2 ml-auto"} type={"submit"}>
            {!edit ? (
              <CheckCircleIcon className="w-5 h-5 inline-flex mr-1" />
            ) : (
              <PencilSquareIcon className="w-5 h-5 inline-flex mr-1" />
            )}
            {!edit ? "Завершить" : "Изменить"}
          </button>
          {!edit ? (
            <button
              type={"button"}
              className={
                "btn btn-beige cursor-pointer text-red-600 hover:text-red-800 shadow-gray-800/40 hover:shadow-gray-500 outline-1 outline-stone-800/20 hover:outline-stone-800/40"
              }
              onClick={() => dispatch(deleteActiveOrder(orderId))}
            >
              <TrashIcon className="w-5 h-5 inline-flex mr-1" />
              Удалить
            </button>
          ) : null}
        <OrderTotalValue orderId={orderId} className={"w-fit"} />
      </div>
    </form>
  );
};
