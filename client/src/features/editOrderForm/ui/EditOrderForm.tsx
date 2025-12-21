import { useAppSelector } from "@shared/store/hooks.ts";
import { selectOrderParametersList } from "@entities/orderParameters";
import { InputWithLabel } from "@shared/ui/InputWithLabel.tsx";
import SelectUI from "@shared/ui/SelectUI.tsx";
import RadioGroup from "@shared/ui/RadioGroup.tsx";

export const EditOrderForm = () => {
  const parametersList = useAppSelector(selectOrderParametersList);
  return (
    <div className={"flex"}>
      {parametersList &&
        parametersList.map((parameter) => {
          switch (parameter.type) {
            case "INPUT":
              return (
                <InputWithLabel
                  key={parameter.id}
                  name={parameter.name}
                  label={parameter.translationRu}
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
                  value={""}
                  onChange={(value) => {
                    console.log(value);
                  }}
                />
              );
            case "RADIO":
              return (
                <RadioGroup
                  label={parameter.translationRu}
                  name={parameter.name}
                  options={parameter.options.map((item) => ({
                    value: item.id.toString(),
                    label: item.translationRu,
                  }))}
                  value={""}
                  onChange={(value) => {
                    console.log(value);
                  }}
                />
              );
          }
        })}
    </div>
  );
};
