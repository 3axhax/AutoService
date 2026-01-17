import { RadioGroup, SelectUI } from "@shared/ui";
import { ParametersItem } from "@entities/orderParameters";

interface SelectOrRadioProps {
  parameter: ParametersItem;
  value: string;
  onChange: (value: string) => void;
}

export const SelectOrRadio = ({
  parameter,
  value,
  onChange,
}: SelectOrRadioProps) => {
  return (
    <>
      {parameter.options.length > 0 && parameter.options.length < 5 ? (
        <RadioGroup
          key={parameter.id}
          label={parameter.translationRu}
          name={parameter.name}
          options={parameter.options.map((item) => ({
            value: item.id.toString(),
            label: item.translationRu,
          }))}
          value={value}
          onChange={onChange}
          className={"flex-col"}
          type={"col"}
        />
      ) : (
        <SelectUI
          className={"self-start"}
          key={parameter.id}
          label={parameter.translationRu}
          name={parameter.name}
          options={parameter.options.map((item) => ({
            value: item.id.toString(),
            label: item.translationRu,
          }))}
          value={value}
          onChange={onChange}
        />
      )}
    </>
  );
};
