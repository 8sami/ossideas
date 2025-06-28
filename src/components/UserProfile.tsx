import React, { useState } from 'react';
import { Heart, User, Settings, TrendingUp, Plus } from 'lucide-react';
import IdeaCard from './IdeaCard';
import { IdeaData } from '../types';
import { User as UserType } from '../types/auth';
import { mockIdeas } from '../data/mockData';
import FullScreenLoader from './FullScreenLoader';

interface UserProfileProps {
  onIdeaSelect: (idea: IdeaData) => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
  user: UserType | null;
}

const UserProfile: React.FC<UserProfileProps> = ({
  onIdeaSelect,
  isLoggedIn,
  onLoginClick,
  user,
}) => {
  const [activeTab, setActiveTab] = useState<
    'saved' | 'preferences' | 'activity'
  >('saved');
  const [loading] = useState(false);
  const [savedIdeas] = useState(mockIdeas.slice(0, 4));

  const userCategories = ['AI/ML', 'DevTools', 'SaaS', 'Data Analytics'];

  const stats = [
    { label: 'Saved Ideas', value: '12', icon: Heart, color: 'text-red-500' },
    {
      label: 'Categories',
      value: '4',
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    { label: 'Submissions', value: '3', icon: Plus, color: 'text-green-500' },
  ];

  if (loading) {
    return <FullScreenLoader message="Loading profile..." />;
  }

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Sign in to view your profile
          </h2>
          <p className="text-gray-600 mb-4">
            Access your saved ideas and preferences
          </p>
          <button
            onClick={onLoginClick}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {getInitials(user.fullName, user.email)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.fullName || 'User'}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="grid grid-cols-3 gap-6 mb-4">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {stat.value}
                      </div>
                      <span className="text-sm text-gray-600">
                        {stat.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Settings className="h-4 w-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'saved', label: 'Saved Ideas', icon: Heart },
                { id: 'preferences', label: 'Preferences', icon: Settings },
                { id: 'activity', label: 'Activity', icon: TrendingUp },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(
                        tab.id as 'saved' | 'preferences' | 'activity',
                      )
                    }
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}>
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-8">
            {/* Saved Ideas Tab */}
            {activeTab === 'saved' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Saved Ideas
                  </h2>
                  <span className="text-sm text-gray-600">
                    {savedIdeas.length} ideas saved
                  </span>
                </div>

                {savedIdeas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedIdeas.map((idea) => (
                      <IdeaCard
                        key={idea.id}
                        idea={idea}
                        onClick={() => onIdeaSelect(idea)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No saved ideas yet
                    </h3>
                    <p className="text-gray-600">
                      Start exploring and save ideas that interest you!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Preferred Categories
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      'AI/ML',
                      'DevTools',
                      'SaaS',
                      'E-commerce',
                      'Data Analytics',
                      'Security',
                      'Mobile',
                      'Web Dev',
                    ].map((category) => (
                      <label
                        key={category}
                        className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={userCategories.includes(category)}
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Notification Preferences
                  </h3>
                  <div className="space-y-3">
                    {[
                      'New ideas in preferred categories',
                      'Weekly trending ideas digest',
                      'Community updates and picks',
                      'New features and announcements',
                    ].map((pref) => (
                      <label key={pref} className="flex items-center">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-3"
                        />
                        <span className="text-sm text-gray-700">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button className="px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      action: 'Saved idea',
                      title: 'AI-Powered Documentation Generator',
                      time: '2 hours ago',
                    },
                    {
                      action: 'Viewed idea',
                      title: 'Real-time Collaboration Platform',
                      time: '5 hours ago',
                    },
                    {
                      action: 'Saved idea',
                      title: 'Smart Contract Testing Suite',
                      time: '1 day ago',
                    },
                    {
                      action: 'Submitted idea',
                      title: 'GraphQL Schema Validator',
                      time: '3 days ago',
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm text-gray-600">
                          {activity.action}
                        </span>
                        <h4 className="font-medium text-gray-900">
                          {activity.title}
                        </h4>
                      </div>
                      <span className="text-sm text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
