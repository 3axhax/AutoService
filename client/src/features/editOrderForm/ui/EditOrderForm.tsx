import { useAppSelector } from "@shared/store/hooks.ts";
import { selectOrderParametersList } from "@entities/orderParameters";
import { InputWithLabel } from "@shared/ui/InputWithLabel.tsx";
import SelectUI from "@shared/ui/SelectUI.tsx";
import RadioGroup from "@shared/ui/RadioGroup.tsx";
import {FormEvent, useEffect, useState} from "react";

export const EditOrderForm = () => {
  const parametersList = useAppSelector(selectOrderParametersList);
  const [values, setValues] = useState<Record<string, string | number>>({});

  useEffect(() => {
    if (parametersList && parametersList.length > 0) {
      setValues(parametersList.reduce((acc, parameter) => ({...acc, [parameter.name]: ''}), {}));
    }
  }, [parametersList]);

  const setValue = ({name, value}: {name: string, value: string | number}) => {
    setValues({...values, [name]: value});
  }

  const handlerOnSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(values);
  }

  return (
    <div>
      <form onSubmit={handlerOnSubmit} className={"flex"}>
      {parametersList &&
        parametersList.map((parameter) => {
          switch (parameter.type) {
            case "INPUT":
              return (
                <InputWithLabel
                  key={parameter.id}
                  name={parameter.name}
                  label={parameter.translationRu}
                  value={values[parameter.name] ?? ''}
                  onChange={(value) =>
                      setValue({name: parameter.name, value})}
                />
              );
            case "SELECT":
              return (
                <SelectUI
                  key={parameter.id}
                  label={parameter.translationRu}
                  name={parameter.name}
                  options={parameter.options.map((item) => ({
                    value: item.id.toString(),
                    label: item.translationRu,
                  }))}
                  value={values[parameter.name] ?? ''}
                  onChange={(value) =>
                    setValue({name: parameter.name, value})}
                />
              );
            case "RADIO":
              return (
                <RadioGroup
                    key={parameter.id}
                  label={parameter.translationRu}
                  name={parameter.name}
                  options={parameter.options.map((item) => ({
                    value: item.id.toString(),
                    label: item.translationRu,
                  }))}
                    value={values[parameter.name] ?? ''}
                    onChange={(value) =>
                        setValue({name: parameter.name, value})}
                />
              );
          }
        })}
        <button className={"btn"} type={"submit"}>Закрыть</button>
      </form>
    </div>
  );
};
