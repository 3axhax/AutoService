import { ChangeEvent, HTMLInputTypeAttribute } from "react";

interface InputWithLabelProps {
  name: string;
  label: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  value?: string | number;
  type?: HTMLInputTypeAttribute;
}

export const InputWithLabel = ({
  label,
  name,
  placeholder = "",
  onChange,
  className,
  value,
  type = "text",
}: InputWithLabelProps) => {
  const handlerOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  return (
    <div className={`relative${className ? ` ${className}` : ``}`}>
      <input
        autoComplete={"on"}
        type={type}
        placeholder={placeholder}
        name={name}
        id={name}
        className={"form-control"}
        value={value}
        onChange={handlerOnChange}
      />
      <label className={"form-label"} htmlFor={name}>
        {label}
      </label>
    </div>
  );
};
