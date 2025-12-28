import { useInfoModalData } from "@app/providers/infoModalProvider";
import { SignatureInput } from "./SignatureInput";
import { useEffect, useState } from "react";

interface GraphInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const GraphInput = ({
  label,
  value,
  onChange,
  className,
}: GraphInputProps) => {
  const { openModal, open } = useInfoModalData();

  const [signatureImg, setSignatureImg] = useState<string>("");

  useEffect(() => {
    if (!open && signatureImg) {
      onChange(signatureImg);
    }
  }, [open, onChange, signatureImg]);

  return (
    <div className={className}>
      {value && <img src={value} alt={label} />}
      <button
        type={"button"}
        className={"btn p-3"}
        onClick={() =>
          openModal({
            title: label,
            hasButtons: false,
            body: (
              <SignatureInput
                updateSignature={(signature) => {
                  setSignatureImg(signature);
                }}
              />
            ),
          })
        }
      >
        {label}
      </button>
    </div>
  );
};
