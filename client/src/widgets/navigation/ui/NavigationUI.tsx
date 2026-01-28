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
    <>
    <header className={`w-6/8 lg:w-full fixed h-full lg:sticky top-0 opacity-95 flex items-center justify-center z-12 lg:shadow-lg`}>
      <div
        className={`h-full lg:h-auto w-full relative bg-blue-dark z-11 overflow-hidden transition-transform lg:transition-all duration-300 ease-linear right-0 lg:translate-x-0 ${canCollapsed && collapsed ? "translate-x-full lg:max-h-0" : "translate-x-0 lg:max-h-18"}`}
      >
        <div className={"container px-4 lg:px-8 flex flex-col lg:flex-row py-4 lg:py-2 ml-auto mr-auto"}>
          <Logo />
          <nav className="navigation border-t-1 border-white/55 lg:border-t-0 py-3 lg:py-0 m-0 mt-3 lg:ml-auto lg:mt-0">
            <ul className="flex flex-col lg:inline-flex lg:flex-row space-x-6 justify-center">
              {navItems.map((item) => (
                <li key={item.key} className={"flex lg:inline-flex justify-start lg:justify-center m-0"}>
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
                        "cursor-pointer flex justify-start lg:justify-center items-center lg:px-4 py-2 text-white"
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
              className={`bg-blue-dark w-9 h-10 z-12 lg:w-12 lg:h-8 text-white dark:text-white cursor-pointer shadow-lg group fixed top-4 right-0 lg:absolute lg:right-3 lg:top-8 flex justify-center items-center rounded-l-md lg:rounded-t-0 lg:rounded-b-md`}
              onClick={() => dispatch(setHideNavigation(!collapsed))}
          >
            <span className={"relative"}></span>
            <Bars3Icon className={"inline-flex h-5 w-5"} />
            <ArrowDownIcon
                className={`rounded-full bg-blue-dark h-3 w-3 absolute right-1.5 lg:right-2.5 duration-200 transition-all ${!collapsed ? "-rotate-90 lg:rotate-180 bottom-1.5 group-hover:lg:bottom-3" : "rotate-90 lg:bottom-3 group-hover:lg:bottom-1.5"}`}
            />
          </button>
      )}
    </header>
    <div className={`header-shadow fixed right-0 w-full h-full bg-gray-900 transition-opacity duration-200 z-11 lg:hidden ${!collapsed ? "opacity-60 visible" : "opacity-0 invisible"}`}></div>
    </>
  );
};
