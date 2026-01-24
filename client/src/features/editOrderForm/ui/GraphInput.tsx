import { SignatureInput } from "./SignatureInput";
import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    if (!modalOpen && signatureImg) {
      onChange(signatureImg);
    }
  }, [modalOpen, onChange, signatureImg]);

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
        {value && <img src={value} alt={label} />}
        <button
          type={"button"}
          className={"btn p-3"}
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
        />
      ) : null}
    </>
  );
};
