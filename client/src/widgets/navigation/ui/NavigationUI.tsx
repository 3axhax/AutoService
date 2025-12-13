import { Link, useLocation } from "react-router-dom";
import { JSX, useState } from "react";
import { Logo } from "@widgets/logo";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

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

export const NavigationUI = ({ navItems }: { navItems: NavItem[] }) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState<string>("");

  return (
    <header className="header">
      <div className={"container flex"}>
        <Logo />
        <nav className="navigation ml-auto">
          <ul className="inline-flex space-x-6 justify-center">
            {navItems.map((item) => (
              <li key={item.key} className={"inline-flex justify-center"}>
                {item.isDropdown ? (
                  <>
                    <div
                      className={`relative flex items-center flex-gap-2 px-4 py-2 rounded-full transition-colors duration-200 border-1 border-green-800 hover:cursor-pointer text-gray-600 dark:text-gray-300 group hover:text-green-800 hover:bg-green-600/10 hover:text-green-800 dark:hover:bg-gray-700`}
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
                      "cursor-pointer flex justify-center items-center rounded-full px-4 font-medium py-2 border-2 border-green-800 bg-green-800 text-white hover:bg-white hover:text-green-800 ml-20 transition-all"
                    }
                    key={item.key}
                    onClick={item.onClick}
                  >
                    {item.iconLink && item.iconLink}
                    {item.label}
                  </button>
                ) : (
                  <Link
                    to={item.key}
                    className={`flex items-center flex-gap-2 px-4 py-2 rounded-full transition-colors duration-200 border-1 border-white  ${
                      location.pathname === item.path
                        ? " bg-green-900 text-white"
                        : " text-gray-600 dark:text-gray-300 hover:text-green-800 hover:border-green-800 hover:bg-green-600/10 dark:hover:bg-gray-700"
                    }`}
                  >
                    {item.iconLink && item.iconLink}
                    {item.label}
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
    </header>
  );
};
