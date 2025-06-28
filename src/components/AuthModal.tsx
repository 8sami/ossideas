import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, MapPin, Eye, EyeOff, CheckCircle, AlertCircle, Phone, Building, Megaphone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { OnboardingData } from '../types/auth';

type AuthMode = 'login' | 'register' | 'onboarding';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

const MODAL_CONTENT = {
  login: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account'
  },
  register: {
    title: 'Create Account',
    subtitle: 'Start your journey with us'
  },
  onboarding: {
    title: 'Complete Your Profile',
    subtitle: 'Help us personalize your experience'
  }
} as const;

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });

  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    phoneNumber: '',
    location: '',
    usagePurpose: '',
    industries: [],
    referralSource: '',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  const { login, register, loginWithGoogle, authState, completeOnboarding } = useAuth();

  // Update mode when initialMode changes (for onboarding trigger)
  useEffect(() => {
    if (isOpen) {
      // Only update mode if we're not already in onboarding or if onboarding is required
      if (initialMode === 'onboarding' && authState.onboardingRequired) {
        setMode('onboarding');
      } else if (initialMode !== 'onboarding') {
        setMode(initialMode);
      }

      setValidationError(null);
      
      if (initialMode !== 'onboarding') {
        setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });
        setOnboardingData({ phoneNumber: '', location: '', usagePurpose: '', industries: [], referralSource: '' });
        setShowPassword(false);
        setShowConfirmPassword(false);
      }
    }
  }, [isOpen, initialMode, authState.onboardingRequired]);

  // Prevent showing onboarding if it's already completed
  useEffect(() => {
    if (mode === 'onboarding' && !authState.onboardingRequired) {
      onClose();
    }
  }, [mode, authState.onboardingRequired, onClose]);

  const validateForm = () => {
    if (mode === 'register') {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        return 'All fields are required';
      }
      
      if (formData.password !== formData.confirmPassword) {
        return 'Passwords do not match';
      }
      
      if (formData.password.length < 6) {
        return 'Password must be at least 6 characters long';
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return 'Please enter a valid email address';
      }
    }
    
    return null;
  };

  const validateOnboarding = () => {
    if (!onboardingData.phoneNumber || !onboardingData.location || !onboardingData.usagePurpose || 
        onboardingData.industries.length === 0 || !onboardingData.referralSource) {
      return 'All fields are required';
    }
    
    // Basic phone number validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(onboardingData.phoneNumber)) {
      return 'Please enter a valid phone number with country code (e.g., +1234567890)';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setValidationError(validationError);
      return;
    }
    
    setValidationError(null);
    
    try {
      if (mode === 'login') {
        const result = await login({
          email: formData.email,
          password: formData.password,
        });
        
        if (result.user && !result.emailVerificationRequired && !result.onboardingRequired) {
          onClose();
        } else if (result.onboardingRequired) {
          setMode('onboarding');
        }
      } else if (mode === 'register') {
        const result = await register({
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          fullName: formData.fullName,
        });
        
        if (result.user && !result.emailVerificationRequired) {
          setMode('onboarding');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setValidationError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateOnboarding();
    if (validationError) {
      setValidationError(validationError);
      return;
    }
    
    setValidationError(null);
    
    try {
      const result = await completeOnboarding(onboardingData);
      
      if (result.success) {
        // Reset form data
        setOnboardingData({
          phoneNumber: '',
          location: '',
          usagePurpose: '',
          industries: [],
          referralSource: '',
        });
        
        // Close the modal and redirect
        onClose();
        
        // Optional: Redirect to main application interface
        window.location.href = '/dashboard';
      } else {
        setValidationError(result.error || 'Failed to complete onboarding. Please try again.');
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      setValidationError('Failed to complete onboarding. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleOnboardingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'industries') {
      // Handle multi-select for industries
      const select = e.target as HTMLSelectElement;
      const selectedOptions = Array.from(select.selectedOptions, option => option.value);
      setOnboardingData(prev => ({
        ...prev,
        industries: selectedOptions,
      }));
    } else {
      setOnboardingData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleIndustryToggle = (industry: string) => {
    setOnboardingData(prev => ({
      ...prev,
      industries: prev.industries.includes(industry)
        ? prev.industries.filter(i => i !== industry)
        : [...prev.industries, industry]
    }));
  };

  const handleBackToForm = () => {
    setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });
  };

  const handleSwitchToLogin = () => {
    setMode('login');
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '', fullName: '' }));
  };

  if (!isOpen) return null;

  // Show email verification screen
  if (authState.emailVerificationRequired) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[55] p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Verify Your Email Address
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              We've sent a verification link to <strong>{formData.email}</strong>. 
              Please check your email and click the link to verify your account.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What's next?</p>
                  <ul className="space-y-1 text-left">
                    <li>• Check your email inbox (and spam folder)</li>
                    <li>• Click the verification link</li>
                    <li>• Return here to complete your profile</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleBackToForm}
                className="w-full px-4 py-2 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
              >
                Try Different Email
              </button>
              
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                I'll Check My Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding form
  if (mode === 'onboarding') {
    const usagePurposes = [
      { value: 'personal', label: 'Personal use' },
      { value: 'business', label: 'Business use' },
      { value: 'saas', label: 'Building SaaS / micro SaaS' },
    ];

    const industries = [
      'AI/ML', 'DevTools', 'SaaS', 'E-commerce', 'Data Analytics',
      'Security', 'Mobile', 'Web Dev', 'IoT', 'Blockchain',
      'FinTech', 'HealthTech', 'EdTech', 'Marketing', 'Design',
      'Gaming', 'Social Media', 'Productivity', 'Enterprise', 'Other'
    ];

    const referralSources = [
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'product-hunt', label: 'Product Hunt' },
      { value: 'indie-hackers', label: 'Indie Hackers' },
      { value: 'other', label: 'Other' },
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[55] p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {MODAL_CONTENT[mode].title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {MODAL_CONTENT[mode].subtitle}
              </p>
            </div>
          </div>

          <form onSubmit={handleOnboardingSubmit} className="p-6 space-y-6">
            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={onboardingData.phoneNumber}
                  onChange={handleOnboardingChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Include country code (e.g., +1 for US)"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Get <strong>exclusive updates & early access</strong> via SMS. Your number stays private.</p>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={onboardingData.location}
                  onChange={handleOnboardingChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="City, Country"
                  required
                />
              </div>
            </div>

            {/* Usage Purpose */}
            <div>
              <label htmlFor="usagePurpose" className="block text-sm font-medium text-gray-700 mb-2">
                What will you use OSSIdeas for? *
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="usagePurpose"
                  name="usagePurpose"
                  value={onboardingData.usagePurpose}
                  onChange={handleOnboardingChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                  required
                >
                  <option value="">Select your purpose</option>
                  {usagePurposes.map((purpose) => (
                    <option key={purpose.value} value={purpose.value}>
                      {purpose.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Industries */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Industries of Interest *
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-40 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  {industries.map((industry) => (
                    <label key={industry} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={onboardingData.industries.includes(industry)}
                        onChange={() => handleIndustryToggle(industry)}
                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 mr-2"
                      />
                      <span className="text-gray-700">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected: {onboardingData.industries.length} industries
              </p>
            </div>

            {/* Referral Source */}
            <div>
              <label htmlFor="referralSource" className="block text-sm font-medium text-gray-700 mb-2">
                Where did you hear about us? *
              </label>
              <div className="relative">
                <Megaphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="referralSource"
                  name="referralSource"
                  value={onboardingData.referralSource}
                  onChange={handleOnboardingChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors appearance-none bg-white"
                  required
                >
                  <option value="">Select source</option>
                  {referralSources.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(authState.error || validationError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-600">{authState.error || validationError}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authState.loading}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authState.loading ? 'Completing Setup...' : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show regular login/register form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[55] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {MODAL_CONTENT[mode].title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={authState.loading}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-gray-700">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
              )}
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {(authState.error || validationError) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-600">{authState.error || validationError}</p>
                    {(authState.error?.includes('already exists') || validationError?.includes('already exists')) && mode === 'register' && (
                      <button
                        type="button"
                        onClick={handleSwitchToLogin}
                        className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium underline"
                      >
                        Switch to Sign In
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={authState.loading}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authState.loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;