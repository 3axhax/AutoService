import { OrderItem } from "@entities/order";

export const formatVehicleName = (order: OrderItem) => {
  const car_number = order.optionValues.find(
    (value) => value.parameter.name === "car_number",
  );
  const car_make = order.optionValues.find(
    (value) => value.parameter.name === "car_make",
  );
  const car_type = order.optionValues.find(
    (value) => value.parameter.name === "car_type",
  );
  const wheel_diameter = order.optionValues.find(
    (value) => value.parameter.name === "wheel_diameter",
  );
  const carMakeName =
    car_make && car_make.option ? car_make.option.translationRu : null;
  return (
    <ul className={"flex flex-col"}>
      {(carMakeName || car_number) && (
        <ul className={"flex gap-1.5 justify-center"}>
          {carMakeName && <li>{carMakeName}</li>}
          {car_number && <li>№{car_number.value}</li>}
        </ul>
      )}
      {(car_type || wheel_diameter) && (
        <ul className={"flex gap-1.5 justify-center"}>
          {car_type && <li>{car_type.option?.translationRu}</li>}
          {wheel_diameter && <li>Ø{wheel_diameter.option?.translationRu}</li>}
        </ul>
      )}
    </ul>
  );
};

export const formatClientType = (order: OrderItem) => {
  const client_type = order.optionValues.find(
    (value) => value.parameter.name === "client_type",
  );
  const legal = order.optionValues.find(
    (value) => value.parameter.name === "legal_list",
  );
  return (
    <ul className={"flex flex-col items-start"}>
      {client_type && <li>{client_type?.option?.translationRu}</li>}
      {legal && <li>{legal?.option?.translationRu}</li>}
    </ul>
  );
};

export const formatWorkList = (order: OrderItem) => {
  const type_work = order.optionValues.filter(
    (value) => value.parameter.name === "type_work",
  );
  const materials = order.optionValues.filter(
    (value) => value.parameter.name === "materials",
  );
  const typeWorkList = (
    <ul className={"text-left lg:text-center"}>
      {type_work.map((item, index) => (
        <li key={index}>
          {item.option?.translationRu ?? ""} x {item.count}
        </li>
      ))}
    </ul>
  );
  const materialsList = (
    <ul className={"text-left lg:text-center"}>
      {materials.map((item, index) => (
        <li key={index}>
          {item.option?.translationRu ?? ""} x {item.count}
        </li>
      ))}
    </ul>
  );
  return (
    <div>
      {typeWorkList}
      {type_work.length > 0 && materials.length > 0 ? (
        <hr className={"text-gray-700/50 ml-0 md:ml-10"} />
      ) : null}
      {materialsList}
    </div>
  );
};
