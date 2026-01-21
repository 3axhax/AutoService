import Select from "react-select";

export interface SelectUIOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectUIProps<T = string> {
  label?: string;
  name: string;
  options: SelectUIOption<T>[];
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export const SelectUI = <T extends string | number = string>({
  label,
  name,
  options,
  value,
  onChange,
  required = false,
  placeholder = "Выберите вариант",
  className = "",
  ...other
}: SelectUIProps<T>) => {
  const handleChange = (selectedOption: SelectUIOption<T> | null) => {
    if (selectedOption) {
      onChange(selectedOption.value);
    }
  };

  const selectedValue =
    options.find((option) => option.value === value) || null;

  return (
    <div className={`${className}`}>
      {label ? (
        <label
          htmlFor={name}
          className="text-lg font-medium text-gray-800"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      ) : null}
      <Select<SelectUIOption<T>>
        menuPortalTarget={document.body}
        menuPosition="fixed"
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        value={selectedValue}
        onChange={handleChange}
        options={options}
        inputId={name}
        placeholder={placeholder}
        aria-required={required}
        classNames={{
          control: (state) =>
            `mt-2 !min-h-10 !border !rounded-lg !bg-white !shadow-sm transition-all duration-200 outline-none text-left ${
              state.isFocused
                ? "!border-blue-900 !ring-1 !ring-blue-900 !ring-opacity-20"
                : "!border-gray-300 hover:!border-blue-900 hover:!shadow-blue-900"
            } ${
              state.isDisabled
                ? "!bg-gray-50 !cursor-not-allowed !opacity-50"
                : ""
            }`,
          menu: () =>
            "!border !border-gray-200 !rounded-lg !shadow-lg !mt-1 !bg-white",
          menuList: () => "!py-1",
          option: (state) =>
            `!px-3 !py-2 !cursor-pointer ${
              state.isSelected
                ? "!bg-blue-900 !text-white"
                : state.isFocused
                  ? "!bg-blue-50 !text-gray-900"
                  : "!text-gray-700 hover:!bg-gray-50"
            } ${state.isDisabled ? "!opacity-50 !cursor-not-allowed" : ""}`,
          placeholder: () => "!text-gray-400",
          singleValue: () => "!text-gray-900",
          valueContainer: () => "!px-3 !py-1",
          indicatorsContainer: () => "!pr-2",
          dropdownIndicator: (state) =>
            `!text-gray-400 hover:!text-blue-900 transition-all duration-300 ease-in-out ${
              state.selectProps.menuIsOpen ? "!rotate-180 !text-blue-900" : "!text-blue-900"
            }`,
          clearIndicator: () => "!text-gray-400 hover:!text-gray-600",
          indicatorSeparator: () => "!bg-transparent",
          noOptionsMessage: () => "!text-gray-500 !py-4",
        }}
        {...other}
      />
    </div>
  );
};

export default SelectUI;
