import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Github,
  SettingsIcon,
  Send,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import SignInRequired from './SignInRequired';
import AuthModal from './AuthModal';

interface SubmitRepositoryFormProps {
  onClose?: () => void;
}

const SubmitRepositoryForm: React.FC<SubmitRepositoryFormProps> = ({
  onClose,
}) => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { user } = authState;

  const [formData, setFormData] = useState({
    githubUrl: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleSignInClick = () => {
    setAuthModalOpen(true);
  };

  const handleGoBack = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateGithubUrl = (url: string): boolean => {
    // Basic validation for GitHub repository URLs
    const githubUrlPattern =
      /^https?:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9._-]+$/;
    return githubUrlPattern.test(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to submit a repository');
      return;
    }

    if (!formData.githubUrl.trim()) {
      setError('GitHub URL is required');
      return;
    }

    if (!validateGithubUrl(formData.githubUrl)) {
      setError(
        'Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)',
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase
        .from('submitted_repositories')
        .insert({
          user_id: user.id,
          github_url: formData.githubUrl.trim(),
          notes: formData.notes.trim() || null,
          status: 'pending',
        });

      if (submitError) {
        throw submitError;
      }

      setSuccess(true);
      setFormData({ githubUrl: '', notes: '' });

      // Redirect after 2 seconds or close modal if onClose is provided
      setTimeout(() => {
        if (onClose) {
          onClose();
        } else {
          navigate('/');
        }
      }, 2000);
    } catch (err) {
      console.error('Error submitting repository:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to submit repository',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <>
        <SignInRequired
          title="Sign In Required"
          description="You need to be signed in to submit a repository for idea generation."
          icon={SettingsIcon}
          onSignInClick={handleSignInClick}
          onGoBack={handleGoBack}
        />
        
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode="login"
        />
      </>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Repository Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your repository has been submitted successfully. We'll analyze it
              and generate business ideas for you.
            </p>
            <div className="animate-pulse">
              <p className="text-sm text-gray-500">Redirecting...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose ? onClose : () => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Submit Repository
            </h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Github className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Submit a Repository
            </h2>
            <p className="text-gray-600">
              Submit an open-source repository and we'll generate business ideas
              for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* GitHub URL */}
            <div>
              <label
                htmlFor="githubUrl"
                className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Repository URL *
              </label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                placeholder="https://github.com/username/repository"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter the full URL of the GitHub repository you want to analyze
              </p>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any specific aspects of the repository you'd like us to focus on..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              />
              <p className="mt-1 text-sm text-gray-500">
                Optional: Tell us what interests you about this repository
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit Repository</span>
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• We'll analyze the repository and its ecosystem</li>
              <li>
                • Generate business opportunities and monetization strategies
              </li>
              <li>• Provide market analysis and competitive insights</li>
              <li>• You'll receive an email when the analysis is complete</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitRepositoryForm;