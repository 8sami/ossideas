import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Grid3X3,
  Heart,
  Users,
  Plus,
  Menu,
  X,
  CreditCard,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onClose }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      id: 'home',
      icon: Home,
      label: 'Home',
      path: '/ideas',
      onClick: () => navigate('/ideas'),
    },
    {
      id: 'categories',
      icon: Grid3X3,
      label: 'Categories',
      path: '/categories',
      onClick: () => navigate('/categories'),
    },
    {
      id: 'saved-ideas',
      icon: Heart,
      label: 'Saved Ideas',
      path: '/saved-ideas',
      onClick: () => navigate('/saved-ideas'),
    },
    {
      id: 'community',
      icon: Users,
      label: 'Community',
      path: '/community',
      onClick: () => navigate('/community'),
    },
    {
      id: 'pricing',
      icon: CreditCard,
      label: 'Pricing',
      path: '/pricing',
      onClick: () => navigate('/pricing'),
    },
    {
      id: 'submit',
      icon: Plus,
      label: 'Submit Idea',
      path: '/submit',
      onClick: () => navigate('/submit'),
      premium: true,
    },
  ];

  // Handle click outside to close sidebar when open
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Function to determine if a menu item is active
  const isMenuItemActive = (itemPath: string) => {
    if (itemPath === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(itemPath);
  };

  // Dynamic tooltip positioning function
  const getTooltipPosition = (buttonElement: HTMLElement) => {
    const rect = buttonElement.getBoundingClientRect();
    const sidebarWidth = 64; // 16 * 4 = 64px (w-16)
    const tooltipGap = 8; // 8px gap between sidebar and tooltip

    return {
      left: sidebarWidth + tooltipGap, // Position to the right of the sidebar
      top: rect.top + rect.height / 2, // Center vertically with the button
    };
  };

  return (
    <>
      {/* Overlay - covers everything including sticky headers */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[51]"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed left-0 top-0 transition-all duration-300 ease-in-out z-[52] bg-white border-r border-gray-200 ${
          isOpen ? 'w-64 h-full' : 'w-16 h-full'
        }`}>
        {/* Header spacer to account for fixed header */}
        <div className="h-16 border-b border-gray-200 flex items-center">
          <div className="px-2">
            <button
              onClick={onToggle}
              className="p-3 rounded-lg flex items-center text-gray-600 hover:bg-gray-100 hover:text-orange-500 transition-colors"
              title={isOpen ? 'Close sidebar' : 'Open sidebar'}>
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 py-4 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = isMenuItemActive(item.path);

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={item.onClick}
                    className={`w-full h-12 flex items-center rounded-lg transition-colors relative overflow-hidden ${
                      isActive
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500'
                    }`}
                    onMouseEnter={(e) => {
                      if (!isOpen) {
                        const tooltip = e.currentTarget.querySelector(
                          '.tooltip',
                        ) as HTMLElement;
                        if (tooltip) {
                          const position = getTooltipPosition(e.currentTarget);
                          tooltip.style.left = `${position.left}px`;
                          tooltip.style.top = `${position.top}px`;
                          tooltip.style.transform = 'translateY(-50%)';
                        }
                      }
                    }}>
                    {/* Icon container - fixed position and size */}
                    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
                      <Icon
                        className={`h-5 w-5 ${
                          isActive ? 'text-orange-500' : ''
                        }`}
                      />
                    </div>

                    {/* Label container - only visible when open, positioned absolutely to not affect icon */}
                    <div
                      className={`absolute left-12 right-3 flex items-center justify-between transition-opacity duration-300 ${
                        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                      }`}>
                      <span className="font-medium truncate">{item.label}</span>

                      {/* Pro Badge */}
                      {item.premium && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-600 rounded-full flex-shrink-0">
                          Pro
                        </span>
                      )}
                    </div>

                    {/* Tooltip for closed state - Dynamic positioning with higher z-index */}
                    {!isOpen && (
                      <div className="tooltip fixed px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-[52]">
                        {item.label}
                        {item.premium && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-500 text-white rounded">
                            Pro
                          </span>
                        )}
                        {/* Tooltip arrow */}
                        <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900" />
                      </div>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;