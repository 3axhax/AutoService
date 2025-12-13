import { ReactNode } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { store } from "@shared/store";
import { InfoModalProvider } from "@app/providers/infoModalProvider";

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <InfoModalProvider>{children}</InfoModalProvider>
      </BrowserRouter>
    </Provider>
  );
};
