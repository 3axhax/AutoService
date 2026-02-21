import { ParametersItem, ParametersType } from "@entities/orderParameters";
import { InputWithLabel } from "@shared/ui";

interface AddNewFilterParameterOptionsProps {
  parameter: ParametersItem | undefined;
  value: string | number | null;
  setValue: (value: string | number | null) => void;
}

export const AddNewFilterParameterOptions = ({
  parameter,
  value,
  setValue,
}: AddNewFilterParameterOptionsProps) => {
  return (
    <div>
      {parameter ? (
        parameter.type === ParametersType.INPUT ? (
          <InputWithLabel
            className={"self-end"}
            key={parameter.id}
            name={parameter.name}
            label={parameter.translationRu}
            placeholder={parameter.translationRu}
            value={value ?? ""}
            onChange={(value) => setValue(value)}
          />
        ) : null
      ) : null}
    </div>
  );
};
