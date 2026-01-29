import { Link, useLocation } from "react-router-dom";
import { JSX, useState } from "react";
import { Logo } from "@widgets/logo";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Bars3Icon } from "@heroicons/react/24/solid";
import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { useAppDispatch, useAppSelector } from "@shared/store/hooks.ts";
import { SelectHideNavigation, setHideNavigation } from "@entities/app";

export interface NavItem {
  key: string;
  path: string;
  label: string;
  iconLink?: JSX.Element;
  isDropdown?: boolean;
  isButton?: boolean;
  onClick?: () => void;
  items?: { path: string; label?: string }[];
}

interface NavigationUIProps {
  navItems: NavItem[];
  canCollapsed: boolean;
}

export const NavigationUI = ({
  navItems,
  canCollapsed = false,
}: NavigationUIProps) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState<string>("");

  const dispatch = useAppDispatch();

  const collapsed = useAppSelector(SelectHideNavigation);

  return (
    <header className={`w-full h-full lg:h-auto fixed lg:sticky top-0 opacity-95 flex justify-end lg:items-center lg:justify-center z-11 lg:shadow-lg ${canCollapsed && collapsed ? "translate-x-full" : "translate-x-0"}`}>
      <div
        className={`w-6/8 lg:w-full h-full relative bg-blue-dark z-11 overflow-hidden lg:transition-max-height duration-300 ease-linear ${canCollapsed && collapsed ? "lg:max-h-0" : "lg:max-h-18"}`}
      >
        <div className={"container px-4 lg:px-8 flex flex-col lg:flex-row py-2 lg:mx-auto"}>
          <Logo />
          <nav className="navigation lg:ml-auto">
            <ul className="flex flex-col lg:flex-row lg:inline-flex space-x-6 lg:justify-center">
              {navItems.map((item) => (
                <li key={item.key} className={"inline-flex lg:justify-center"}>
                  {item.isDropdown ? (
                    <>
                      <div
                        className={`relative flex items-center flex-gap-2 lg:px-4 py-2 rounded-full transition-colors duration-200 border-1 border-green-800 hover:cursor-pointer text-gray-600 dark:text-gray-300 group hover:text-green-800 hover:bg-green-600/10 dark:hover:bg-gray-700`}
                        onClick={() => setIsDropdownOpen(item.key)}
                      >
                        {item.iconLink && item.iconLink}
                        <span
                          className={
                            "max-w-50 overflow-ellipsis text-nowrap overflow-hidden"
                          }
                        >
                          {item.label}
                        </span>
                        <ChevronDownIcon
                          className={`inline-flex h-4 w-4 ml-2 text-gray-600 transition-transform group-hover:text-green-800 duration-200 ${isDropdownOpen === item.key ? "rotate-180" : ""}`}
                        />
                        {isDropdownOpen === item.key && (
                          <div className="absolute top-full left-0 mt-4 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 border border-gray-200 dark:border-gray-700">
                            {item.items?.map((dropdownItem) =>
                              dropdownItem.label ? (
                                <Link
                                  key={dropdownItem.path}
                                  to={dropdownItem.path}
                                  onClick={() => setIsDropdownOpen("")}
                                  className={`block text-left px-4 py-2 text-sm transition-colors${
                                    location.pathname === dropdownItem.path
                                      ? " bg-green-900 text-white"
                                      : " text-gray-700 dark:text-gray-300 hover:bg-green-800/10 dark:hover:bg-gray-700"
                                  }`}
                                >
                                  {dropdownItem.label}
                                </Link>
                              ) : (
                                <hr
                                  key={dropdownItem.path}
                                  className="text-gray-300"
                                />
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  ) : item.isButton ? (
                    <button
                      className={
                        "cursor-pointer flex justify-center items-center lg:px-4 py-2 text-white"
                      }
                      key={item.key}
                      onClick={item.onClick}
                    >
                      {item.iconLink && item.iconLink}
                      <span className={"bg-underline"}>{item.label}</span>
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center flex-gap-2 lg:px-4 py-2 ${
                        location.pathname === item.path
                          ? "text-white"
                          : " text-white"
                      }`}
                    >
                      {item.iconLink && item.iconLink}
                      <span className={"bg-underline"}>{item.label}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            {isDropdownOpen !== "" && (
              <div
                className="fixed inset-0 z-0"
                onClick={() => setIsDropdownOpen("")}
              />
            )}
          </nav>
        </div>
      </div>
      {canCollapsed && (
        <button
          className={`bg-blue-dark w-12 h-8 text-white dark:text-white cursor-pointer shadow-lg group absolute lg:right-3 top-0 lg:-bottom-8 flex justify-center items-center rounded-b-md z-12 ${!collapsed ? "right-0" : "-left-12"}`}
          onClick={() => dispatch(setHideNavigation(!collapsed))}
        >
          <span className={"relative"}>
          <Bars3Icon className={"inline-flex h-5 w-5"} />
          <ArrowDownIcon
            className={`rounded-full bg-blue-dark h-3 w-3 absolute right-2.5 duration-200 transition-all ${!collapsed ? "rotate-180 bottom-1.5 group-hover:bottom-3" : "bottom-3 group-hover:bottom-1.5"}`}
          />
            </span>
        </button>
      )}
    </header>
  );
};
