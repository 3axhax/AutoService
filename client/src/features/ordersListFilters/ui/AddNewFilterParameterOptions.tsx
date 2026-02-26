import { ParametersItem, ParametersType } from "@entities/orderParameters";
import { InputWithLabel, RadioGroup } from "@shared/ui";
import { SelectOrRadio } from "@shared/ui/SelectOrRadio.tsx";

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
        ) : [ParametersType.SELECT, ParametersType.SELECT_LIST].includes(
            parameter.type,
          ) ? (
          <SelectOrRadio
            key={parameter.id}
            label={parameter.translationRu}
            name={parameter.name}
            options={parameter.options.map((item) => ({
              value: item.id.toString(),
              label: item.translationRu,
            }))}
            value={value ? value.toString() : ""}
            onChange={setValue}
          />
        ) : parameter.type === ParametersType.GRAPH_INPUT ? (
          <RadioGroup<number>
            key={parameter.id}
            name={parameter.name}
            label={parameter.translationRu}
            options={[
              { label: "Есть", value: 1 },
              { label: "Нет", value: 0 },
            ]}
            value={value ? 1 : 0}
            onChange={setValue}
            className={"flex-col"}
            type={"col"}
          />
        ) : null
      ) : null}
    </div>
  );
};
