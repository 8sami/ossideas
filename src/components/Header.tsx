import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, User, LogIn, Crown, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User as UserType } from '../types/auth';
import { supabase } from '../lib/supabase';

interface UserSubscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: string;
  is_active: boolean;
  created_at: string;
}

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterOpen: boolean;
  onFilterToggle: () => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  user: UserType | null;
}

const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  filterOpen,
  onFilterToggle,
  isLoggedIn,
  onLoginClick,
  onLogoutClick,
  user,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userSubscription, setUserSubscription] =
    useState<UserSubscription | null>(null);

  const fetchUserSubscription = useCallback(async () => {
    if (!user) {
      setUserSubscription(null);
      return;
    }

    try {
      // Get the most recent active subscription for this user
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle to handle 0 or 1 results

      if (error) {
        console.error('Error fetching subscription:', error);
        setUserSubscription(null);
        return;
      }

      setUserSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setUserSubscription(null);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchUserSubscription();
  }, [fetchUserSubscription]);

  // Set up real-time subscription updates
  useEffect(() => {
    if (!user) return;

    // Subscribe to subscription changes for this user
    const subscriptionChannel = supabase
      .channel('header-subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Header: Subscription changed:', payload);
          // Refresh subscription data when changes occur
          fetchUserSubscription();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscriptionChannel);
    };
  }, [user?.id, fetchUserSubscription]);

  const getSubscriptionStatus = () => {
    if (!userSubscription) return null;

    const status = userSubscription.status;
    if (status === 'active' || status === 'trialing') {
      return userSubscription.plan_name;
    }
    return null;
  };

  // Determine if we should show search and filter (only on home page)
  const showSearchAndFilter = location.pathname === '/';

  const handleProfileClick = () => {
    navigate('/profile');
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSavedIdeasClick = () => {
    navigate('/saved-ideas');
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSubmissionsClick = () => {
    navigate('/submissions');
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleHelpSupportClick = () => {
    navigate('/help-support');
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    onLogoutClick();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen) {
        const target = event.target as Element;
        if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Close mobile menu when filter panel opens
  useEffect(() => {
    if (filterOpen) {
      setMobileMenuOpen(false);
    }
  }, [filterOpen]);

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-xl sm:text-2xl font-bold text-gray-900 hover:text-orange-500 transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">OS</span>
                </div>
                <span className="hidden sm:block">OSSIdeas</span>
              </button>
            </div>

            {/* Desktop Search Bar - Only show on home page and on larger screens */}
            {showSearchAndFilter && (
              <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search ideas, OSS projects, or keywords..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Filter Button - Only show on home page */}
              {showSearchAndFilter && (
                <button
                  onClick={onFilterToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    filterOpen
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500'
                  }`}>
                  <Filter className="h-5 w-5" />
                </button>
              )}

              {/* Profile/Login */}
              {isLoggedIn && user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-orange-500 transition-colors">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName || user.email}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium">
                        {user.fullName || user.email.split('@')[0]}
                      </div>
                      {getSubscriptionStatus() && (
                        <div className="flex items-center text-xs text-orange-600">
                          <Crown className="h-3 w-3 mr-1" />
                          {getSubscriptionStatus()}
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.fullName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        {getSubscriptionStatus() && (
                          <div className="flex items-center text-xs text-orange-600 mt-1">
                            <Crown className="h-3 w-3 mr-1" />
                            {getSubscriptionStatus()} Plan
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleProfileClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </button>
                      <button
                        onClick={handleSavedIdeasClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Saved Ideas
                      </button>
                      <button
                        onClick={handleSubmissionsClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Submissions
                      </button>
                      <button
                        onClick={handleSettingsClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Settings
                      </button>
                      <button
                        onClick={handleHelpSupportClick}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Help & Support
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {/* Mobile Filter Button - Only show on home page */}
              {showSearchAndFilter && (
                <button
                  onClick={onFilterToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    filterOpen
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-orange-500'
                  }`}>
                  <Filter className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="mobile-menu-button p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-orange-500 transition-colors">
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar - Only show on home page */}
          {showSearchAndFilter && (
            <div className="md:hidden pb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search ideas, projects..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu - Positioned with proper z-index and positioning */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="mobile-menu absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="px-4 py-4 space-y-1">
              {isLoggedIn && user ? (
                <>
                  {/* User Info */}
                  <div className="px-3 py-3 border-b border-gray-200 mb-3">
                    <div className="flex items-center space-x-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName || user.email}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-900 truncate">
                          {user.fullName || user.email.split('@')[0]}
                        </p>
                        <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        {getSubscriptionStatus() && (
                          <div className="flex items-center text-sm text-orange-600 mt-1">
                            <Crown className="h-3 w-3 mr-1" />
                            {getSubscriptionStatus()} Plan
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    Profile
                  </button>
                  <button
                    onClick={handleSavedIdeasClick}
                    className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    Saved Ideas
                  </button>
                  <button
                    onClick={handleSubmissionsClick}
                    className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    My Submissions
                  </button>
                  <button
                    onClick={handleSettingsClick}
                    className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    Settings
                  </button>
                  <button
                    onClick={handleHelpSupportClick}
                    className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                    Help & Support
                  </button>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onLoginClick();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-3 text-base font-medium bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;