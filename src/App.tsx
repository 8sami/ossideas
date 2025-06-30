import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Header from './components/Header';
import { AuthProvider } from './components/AuthProvider';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RepositoryDetail from './components/RepositoryDetail';
import UserProfile from './components/UserProfile';
import SavedIdeas from './components/SavedIdeas';
import MySubmissions from './components/MySubmissions';
import EditSubmissionForm from './components/EditSubmissionForm';
import HelpSupport from './components/HelpSupport';
import PricingPage from './components/PricingPage';
import SuccessPage from './components/SuccessPage';
import AuthCallback from './components/AuthCallback';
import AuthModal from './components/AuthModal';
import ScrollToTop from './components/ScrollToTop';
import SubmitRepositoryForm from './components/SubmitRepositoryForm';
import PrivacyPolicy from './components/PrivacyPolicy';
import { useAuth } from './hooks/useAuth';
import GoogleTag from './components/GoogleAnalytics';
import LandingPage from './components/LandingPage';
import boltBadge from './assets/black_circle_360x360.png';
import IdeaDetail from './components/IdeaDetail';

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<
    'login' | 'register' | 'onboarding'
  >('login');

  const { authState, logout } = useAuth();
  const isLoggedIn = !!authState.user;

  // Check for onboarding requirement after login
  useEffect(() => {
    if (authState.onboardingRequired && !authState.loading && isLoggedIn) {
      setAuthModalMode('onboarding');
      setAuthModalOpen(true);
    }
  }, [authState.onboardingRequired, authState.loading, isLoggedIn]);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleFilterToggle = () => {
    setFilterOpen(!filterOpen);
  };

  const handleLoginClick = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const handleRegisterClick = () => {
    setAuthModalMode('register');
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterOpen={filterOpen}
        onFilterToggle={handleFilterToggle}
        isLoggedIn={isLoggedIn}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogout}
        user={authState.user}
      />

      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
          onClose={handleCloseSidebar}
        />

        {/* Main content with constant left margin for closed sidebar width */}
        <main className="flex-1 ml-16">
          <Routes>
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route
              path="/ideas"
              element={
                <MainContent
                  filterOpen={filterOpen}
                  onFilterToggle={handleFilterToggle}
                  onRegisterClick={handleRegisterClick}
                />
              }
            />
            <Route path="/repositories/:id" element={<RepositoryDetail />} />
            <Route path="/ideas/:id" element={<IdeaDetail />} />
            <Route path="/:owner/:repo" element={<IdeaDetail />} />
            <Route
              path="/profile"
              element={
                <UserProfile
                  onIdeaSelect={() => {}}
                  isLoggedIn={isLoggedIn}
                  onLoginClick={handleLoginClick}
                  user={authState.user}
                />
              }
            />
            <Route path="/saved-ideas" element={<SavedIdeas />} />
            <Route path="/submissions" element={<MySubmissions />} />
            <Route path="/submissions/:id" element={<EditSubmissionForm />} />
            <Route path="/help-support" element={<HelpSupport />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route
              path="/categories"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Categories</h1>
                  <p className="text-gray-600">
                    Categories page coming soon...
                  </p>
                </div>
              }
            />
            <Route
              path="/community"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Community</h1>
                  <p className="text-gray-600">Community page coming soon...</p>
                </div>
              }
            />
            <Route path="/submit" element={<SubmitRepositoryForm />} />
          </Routes>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={handleCloseAuthModal}
        initialMode={authModalMode}
      />
      {/* Bolt.new Badge */}
      <a
        href="https://bolt.new/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-50 transition-transform hover:scale-105">
        <img
          src={boltBadge}
          alt="Powered by Bolt.new"
          className="w-20 h-20 md:w-24 md:h-24"
        />
      </a>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <GoogleTag />
        <ScrollToTop />
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;