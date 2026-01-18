import { useState, ReactNode, JSX } from "react";
import {
  InfoModalConstructor,
  InfoModalContext,
  InfoModalType,
} from "./InfoModalContext";

export const InfoModalProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [onAccess, setOnAccess] = useState<(() => void) | null>(null);
  const [title, setTitle] = useState<string>("");
  const [type, setType] = useState<InfoModalType>("standard");
  const [body, setBody] = useState<JSX.Element | string>("");
  const [hasButtons, setHasButtons] = useState<boolean>(true);
  const [className, setClassName] = useState<string>("");

  const openModal = ({
    onAccess: onAccessProps,
    title: titleProps,
    type: typeProps,
    body: bodyProps,
    hasButtons: hasButtonsProps,
    className: classNameProps,
  }: InfoModalConstructor) => {
    setOnAccess(() => onAccessProps || null);
    setTitle(titleProps || "");
    setType(typeProps || "standard");
    setBody(bodyProps || "");
    setHasButtons(hasButtonsProps !== false);
    setClassName(classNameProps || "");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setOnAccess(null);
  };

  return (
    <InfoModalContext.Provider
      value={{
        open,
        openModal,
        closeModal,
        onAccess,
        title,
        type,
        body,
        hasButtons,
        className,
      }}
    >
      {children}
    </InfoModalContext.Provider>
  );
};
