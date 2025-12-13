import { useAppSelector } from "@shared/store/hooks.ts";
import {
  selectIsUserAuthorized,
  selectUserName,
  selectIsUserAdmin, selectIsUserWorker,
} from "@entities/user";
import { useInfoModalData } from "@app/providers/infoModalProvider";
import { LoginForm } from "@features/loginForm";
import { UserIcon } from "@heroicons/react/16/solid";
import { NavigationUI, NavItem } from "./NavigationUI.tsx";
import {ArchiveBoxIcon, ArrowRightEndOnRectangleIcon, HomeModernIcon} from "@heroicons/react/24/outline";

export const Navigation = () => {

  const isUserAuthorized = useAppSelector(selectIsUserAuthorized);
  const isUserAdmin = useAppSelector(selectIsUserAdmin);
  const isUserWorker = useAppSelector(selectIsUserWorker);
  const userName = useAppSelector(selectUserName);
  const { openModal } = useInfoModalData();

  const navItems: NavItem[] = [];

  if (isUserAdmin) {
    navItems.push({ key: "facility", path: "/facility", label: "Объекты", iconLink: <HomeModernIcon className="inline-flex h-5 w-5 mr-1" />});
  }
  if (isUserWorker) {
    navItems.push({ key: "facility", path: "/work_history", label: "История работ", iconLink: <ArchiveBoxIcon className="inline-flex h-5 w-5 mr-1" />});
  }

  if (isUserAuthorized) {
    navItems.push({
      key: "userMenu",
      path: "#",
      label: `${userName}`,
      isDropdown: true,
      iconLink: <UserIcon className="h-5 w-5 text-green-800 mr-2" />,
      items: [
        { path: "/logout", label: "Выход" },
      ],
    });
  }
  else {
    navItems.push({
      key: "login",
      path: "#",
      label: "Вход",
      isButton: true,
      iconLink: <ArrowRightEndOnRectangleIcon className="inline-flex h-5 w-5 mr-1" />,
      onClick: () => {
        openModal({
          title: "Войти",
          type: "standard",
          hasButtons: false,
          body: <LoginForm />,
        });
      },
    });
  }

  return <NavigationUI navItems={navItems} />;
};
