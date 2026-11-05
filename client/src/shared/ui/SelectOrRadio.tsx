import { RadioGroup, RadioOption } from "./RadioGroup";
import { SelectUI, SelectUIOption } from "./SelectUI";

interface SelectOrRadioProps {
  label: string;
  name: string;
  options: RadioOption[] | SelectUIOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const SelectOrRadio = ({
  label,
  name,
  options,
  value,
  onChange,
  disabled = false,
  placeholder,
}: SelectOrRadioProps) => {
  return (
    <>
      {options.length > 0 && options.length <= 5 ? (
        <RadioGroup
          label={label}
          name={name}
          options={options.map((option) => ({ ...option, disabled: disabled || option.disabled }))}
          value={value}
          onChange={onChange}
          className={"flex-col"}
          type={"col"}
        />
      ) : (
        <SelectUI
          className={"text-left"}
          label={label}
          name={name}
          options={options}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    </>
  );
};
