import Select, { MultiValue } from "react-select";
import { SelectedList } from "./SelectedList";
import { useRef } from "react";

interface SelectListOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectListProps<T = string> {
  name: string;
  className?: string;
  options: SelectListOption<T>[];
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
  label?: string;
  placeholder?: string;
}

export const SelectList = <T extends string = string>({
  name,
  className,
  options,
  value,
  onChange,
  label,
  placeholder,
}: SelectListProps<T>) => {
  const selectRef = useRef(null);
  const handleChange = (selectedOption: MultiValue<SelectListOption<T>>) => {
    if (selectedOption.length > 0) {
      onChange(
        selectedOption.reduce((acc, item) => {
          return { ...acc, [item.value]: value[item.value] ?? 1 };
        }, {}),
      );
    } else {
      onChange({});
    }
  };

  const handleListValueOnChange = ({
    id,
    value: inputValue,
  }: {
    id: number;
    value: number;
  }) => {
    onChange({ ...value, [id]: inputValue });
  };

  const handleListValueOnDelete = (id: number) => {
    const tmpValue = { ...value };
    delete tmpValue[id];
    onChange(tmpValue);
  };

  const selectedValue = options.filter(
    (option) => Object.keys(value).includes(option.value) || null,
  );

  return (
    <div className={className}>
      {label ? (
        <label
          htmlFor={name}
          className="text-lg font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      ) : null}
      <SelectedList
        list={Object.keys(value).map((item) => {
          const option = options.find((option) => option.value === item);
          return {
            id: option ? +option.value : 0,
            label: option ? option.label : "",
            value: value[item],
          };
        })}
        onChange={handleListValueOnChange}
        onDelete={handleListValueOnDelete}
      />
      <Select
        ref={selectRef}
        menuPosition="absolute"
        classNamePrefix="custom-select"
        menuPortalTarget={document.body}
        className={className}
        value={selectedValue}
        options={options}
        isMulti={true}
        closeMenuOnSelect={false}
        onChange={handleChange}
        inputId={name}
        placeholder={placeholder ?? ""}
        components={{
          MultiValue: () => null,
        }}
      />
    </div>
  );
};
