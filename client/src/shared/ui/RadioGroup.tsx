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
}

const RadioGroup = <T = string,>({
  label,
  name,
  options,
  value,
  onChange,
  className,
  labelClassName,
  required = false,
}: RadioGroupProps<T>) => {
  return (
    <fieldset
      className={`radio-group-container flex ${className ? " " + className : ""}`}
    >
      <p
        className={`group-label inline-flex mr-5${labelClassName ? " " + labelClassName : ""}`}
      >
        {label}
        {required && <span className="required-asterisk">*</span>}
      </p>
      <div
        className={`radio-options inline-flex gap-[15px] horizontal-layout`}
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
