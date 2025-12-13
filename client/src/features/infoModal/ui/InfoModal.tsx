import { Modal } from "@shared/ui/Modal";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { useEffect, useState } from "react";

type ModalButtons = {
  onClick?: () => void;
  label: string;
  type?: "standard" | "warning" | "danger";
}[];

export const InfoModal = () => {

  const { open, closeModal, onAccess, title, type, body, hasButtons } =
    useInfoModalData();

  const [buttons, setButtons] = useState<ModalButtons>([]);

  useEffect(() => {
    setButtons(
      onAccess
        ? [
            {
              label: "Подтвердить",
              type: type,
              onClick: () => {
                if (onAccess) {
                  onAccess();
                }
              },
            },
          ]
        : [],
    );
  }, [onAccess, type]);

  return (
    <Modal
      open={open}
      setOpen={closeModal}
      title={title}
      body={body}
      hasButtons={hasButtons}
      buttons={buttons}
    />
  );
};
