import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavbarDesktopNav = ({ navItems, isActive, handleItemClick, isDarkMode }) => {
  const location = useLocation();

  return (
    <div className="hidden lg:flex lg:items-center lg:space-x-8 xl:space-x-10">
      {navItems.map((item) => (
        <div key={item.path} className="relative group">
          {item.submenu ? (
            <div
              className={`relative py-2 text-lg font-medium transition-all duration-300 cursor-pointer
                ${isActive(item.path)
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
                }
                before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:origin-left before:scale-x-0 before:bg-primary-600 before:transition-transform before:duration-300 before:ease-in-out
                ${isActive(item.path) ? 'before:scale-x-100' : 'hover:before:scale-x-100'}
              `}
            >
              {item.label}
              {isActive(item.path) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>
              )}
            </div>
          ) : (
            <Link
              to={item.path}
              onClick={() => handleItemClick(item.path)}
              className={`relative py-2 text-lg font-medium transition-all duration-300
                ${isActive(item.path)
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
                }
                before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:origin-left before:scale-x-0 before:bg-primary-600 before:transition-transform before:duration-300 before:ease-in-out
                ${isActive(item.path) ? 'before:scale-x-100' : 'hover:before:scale-x-100'}
              `}
            >
              {item.label}
              {isActive(item.path) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"></span>
              )}
            </Link>
          )}
          {item.submenu && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg z-50 overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="p-2 space-y-1">
                {item.submenu.map((subItem) => (
                  <Link
                    key={subItem.path}
                    to={subItem.path}
                    onClick={() => handleItemClick(subItem.path)}
                    className={`flex items-center space-x-3 p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                      location.pathname === subItem.path
                        ? 'text-primary-600 dark:text-primary-400 font-semibold'
                        : ''
                    }`}
                  >
                    <span className="text-base">{subItem.icon}</span>
                    <span>{subItem.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NavbarDesktopNav;