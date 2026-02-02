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
      <p
        className={
          "text-lg text-left text-gray-700 dark:text-white font-medium group-label lg:mr-5 mb-2"
        }
      >
        {label}
      </p>
      <input
        autoComplete={"on"}
        type={type}
        placeholder={placeholder}
        name={name}
        id={name}
        className={"input"}
        value={value}
        onChange={handlerOnChange}
      />
    </div>
  );
};
