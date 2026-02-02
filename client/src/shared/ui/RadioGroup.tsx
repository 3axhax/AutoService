export interface RadioOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface RadioGroupProps<T = string> {
  label: string;
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  type?: "row" | "col";
}

export const RadioGroup = <T = string,>({
  label,
  name,
  options,
  value,
  onChange,
  className,
  labelClassName,
  required = false,
  type = "row",
}: RadioGroupProps<T>) => {
  return (
    <fieldset
      className={`radio-group-container flex ${className ? " " + className : ""}`}
    >
      <p
        className={`text-gray-700 dark:text-white text-lg font-medium group-label inline-flex mr-5 mb-2${labelClassName ? " " + labelClassName : ""}`}
      >
        {label}
        {required && <span className="required-asterisk">*</span>}
      </p>
      <div
        className={`radio-options flex horizontal-layout${type === "col" ? " flex-col gap-2" : "flex-row gap-[15px]"}`}
        role="radiogroup"
        aria-labelledby={`${name}-label`}
      >
        {options.map((option) => (
          <label
            key={option.value as string}
            className={`radio-label cursor-pointer flex gap-2 items-center ${option.disabled ? "disabled" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value as string}
              checked={value === option.value}
              onChange={() => {
                onChange(option.value);
              }}
              disabled={option.disabled}
              className="radio-input cursor-pointer"
              aria-checked={value === option.value}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default RadioGroup;
