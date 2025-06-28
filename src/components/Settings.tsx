import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, Palette, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Settings: React.FC = () => {
  const { authState } = useAuth();

  // Show sign-in prompt if user is not authenticated
  if (!authState.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
              <SettingsIcon className="h-8 w-8 text-orange-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sign In Required
            </h2>
            
            <p className="text-gray-600 mb-8 leading-relaxed">
              You need to be signed in to access your account settings and preferences.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => window.history.back()}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                <LogIn className="h-5 w-5" />
                <span>Sign In to Continue</span>
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Go Back
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Don't have an account?{' '}
                <button className="text-orange-600 hover:text-orange-700 font-medium">
                  Sign up for free
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">
            Manage your account preferences and settings
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Account Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email</h3>
                  <p className="text-sm text-gray-500">
                    {authState.user?.email}
                  </p>
                </div>
                <button className="text-sm text-orange-600 hover:text-orange-700">
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Password
                  </h3>
                  <p className="text-sm text-gray-500">
                    Last changed 30 days ago
                  </p>
                </div>
                <button className="text-sm text-orange-600 hover:text-orange-700">
                  Update
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Notifications
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive updates about new ideas and features
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Weekly Digest
                  </h3>
                  <p className="text-sm text-gray-500">
                    Get a weekly summary of trending ideas
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          </div> */}

          {/* Privacy Settings */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Privacy</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Profile Visibility
                  </h3>
                  <p className="text-sm text-gray-500">
                    Control who can see your profile and activity
                  </p>
                </div>
                <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
                  <option>Public</option>
                  <option>Private</option>
                </select>
              </div>
            </div>
          </div> */}

          {/* Theme Settings */}
          {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="h-5 w-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Appearance
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Theme</h3>
                  <p className="text-sm text-gray-500">
                    Choose your preferred theme
                  </p>
                </div>
                <select className="text-sm border border-gray-300 rounded-md px-3 py-1">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Settings;