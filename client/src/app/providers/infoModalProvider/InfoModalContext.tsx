import { createContext, JSX, useContext } from "react";

export type InfoModalType = "standard" | "warning" | "danger";

export interface InfoModalConstructor {
  onAccess?: () => void;
  title?: string;
  type?: InfoModalType;
  body?: JSX.Element | string;
  hasButtons?: boolean;
}

interface InfoModalContextType {
  open: boolean;
  openModal: (data: InfoModalConstructor) => void;
  closeModal: () => void;
  onAccess: (() => void) | null;
  title: string;
  type: InfoModalType;
  body: JSX.Element | string;
  hasButtons: boolean;
}

export const InfoModalContext = createContext<InfoModalContextType | undefined>(
  undefined,
);

export const useInfoModalData = () => {
  const context = useContext(InfoModalContext);
  if (context === undefined) {
    throw new Error("useInfoModalData must be used within a InfoModalProvider");
  }
  return context;
};
