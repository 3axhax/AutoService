import { useAppSelector } from "@shared/store/hooks.ts";
import { selectIsUserAuthorized, selectUserName } from "@entities/user";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { NavigationUI, NavItem } from "./NavigationUI";
import {
  ArchiveBoxArrowDownIcon,
  ArrowRightEndOnRectangleIcon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useUserType } from "@shared/hooks/useUserType";
import { LoginRegistration } from "./LoginRegistration";

export const Navigation = () => {
  const isUserAuthorized = useAppSelector(selectIsUserAuthorized);
  const userName = useAppSelector(selectUserName);
  const { isAdmin: isUserAdmin, isWorker: isUserWorker } = useUserType();
  const { openModal } = useInfoModalData();

  const navItems: NavItem[] = [];

  if (isUserAdmin) {
    navItems.push({
      key: "facility",
      path: "/facility",
      label: "Объекты",
      iconLink: <HomeModernIcon className="inline-flex h-5 w-5 mr-1" />,
    });
  }
  if (isUserWorker) {
    navItems.push({
      key: "shiftsHistory",
      path: "/shiftsHistory",
      label: "История смен",
      iconLink: (
        <ArchiveBoxArrowDownIcon className="inline-flex h-5 w-5 mr-1" />
      ),
    });
  }

  if (isUserAuthorized) {
    navItems.push({
      key: "userMenu",
      path: "/logout",
      label: `${userName} (Выход)`,
      iconLink: <UserCircleIcon className="h-5 w-5 inline-flex mr-1" />,
    });
  } else {
    navItems.push({
      key: "login",
      path: "#",
      label: "Вход/Регистрация",
      isButton: true,
      iconLink: (
        <ArrowRightEndOnRectangleIcon className="inline-flex h-5 w-5 mr-1" />
      ),
      onClick: () => {
        openModal({
          type: "standard",
          hasButtons: false,
          body: <LoginRegistration />,
        });
      },
    });
  }

  return <NavigationUI navItems={navItems} canCollapsed={isUserWorker} />;
};
