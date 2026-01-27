import { SignatureInput } from "./SignatureInput";
import { useMemo, useState } from "react";
import { Modal } from "@shared/ui/Modal.tsx";

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
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const [signatureImg, setSignatureImg] = useState<string>("");

  const modalBody = useMemo(
    () => (
      <SignatureInput
        updateSignature={(signature) => {
          setSignatureImg(signature);
        }}
      />
    ),
    [],
  );

  return (
    <>
      <div className={className}>
        <p className={"text-lg font-medium text-gray-800 mb-2"}>
          Добавьте подпись
        </p>
        {value && <img src={value} alt={label} />}
        <button
          type={"button"}
          className={"btn btn-purple w-full"}
          onClick={() => setModalOpen(true)}
        >
          {label}
        </button>
      </div>
      {modalOpen ? (
        <Modal
          open={modalOpen}
          setOpen={() => setModalOpen(false)}
          title={label}
          body={modalBody}
          className={"test"}
          buttons={[
            {
              label: "Применить",
              onClick: () => {
                onChange(signatureImg);
              },
            },
          ]}
        />
      ) : null}
    </>
  );
};
