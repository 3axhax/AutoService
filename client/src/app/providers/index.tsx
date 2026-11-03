import { ReactNode, useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { userSlice } from "@entities/user";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks";
import { store } from "@shared/store";
import { InfoModalProvider } from "@app/providers/infoModalProvider";

interface AppProviderProps {
  children: ReactNode;
}

// This component survives the session subtree remount caused by a successful login.
const AuthNavigation = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const pending = useAppSelector((state) => state.user.authRedirectPending);
  useEffect(() => {
    if (pending) {
      navigate("/", { replace: true });
      dispatch(userSlice.actions.authRedirected());
    }
  }, [pending, navigate, dispatch]);
  return null;
};

const SessionScope = ({ children }: AppProviderProps) => {
  const token = useAppSelector((state) => state.user.token);
  return <InfoModalProvider key={token}>{children}</InfoModalProvider>;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  return (
    <Provider store={store}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthNavigation />
        <SessionScope>{children}</SessionScope>
      </BrowserRouter>
    </Provider>
  );
};
