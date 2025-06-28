import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Share2,
  Star,
  GitFork,
  Eye,
  Calendar,
  Github,
  Code,
  AlertTriangle,
} from 'lucide-react';
import { useRepositoryById } from '../hooks/useRepositoryById';
import { useIdeas, convertIdeaToIdeaData } from '../hooks/useIdeas';
import { useSavedIdeas } from '../hooks/useSavedIdeas';
import { useAuth } from '../hooks/useAuth';
import IdeaCard from './IdeaCard';
import FullScreenLoader from './FullScreenLoader';
import ShareModal from './ShareModal';
import AuthModal from './AuthModal';

const RepositoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { repository, loading, error } = useRepositoryById(id);
  const { ideas } = useIdeas();
  const { isIdeaSaved, toggleSaveIdea } = useSavedIdeas();
  const { authState } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isSaved = id ? isIdeaSaved(id) : false;

  const handleSaveClick = async () => {
    if (!authState.user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!id) return;

    setIsSaving(true);
    try {
      await toggleSaveIdea(id);
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  // Filter ideas that belong to this repository
  const repositoryIdeas = ideas
    .filter((idea) => idea.repository_id === id)
    .map(convertIdeaToIdeaData);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <FullScreenLoader message="Loading..." />;
  }

  if (error || !repository) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Repository Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'The repository you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isSaving
                    ? 'bg-orange-500 text-white opacity-50 cursor-not-allowed'
                    : isSaved
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>
                  {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                </span>
              </button>

              <button
                onClick={handleShareClick}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>

              <a
                href={repository.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                <Github className="h-4 w-4" />
                <span>View on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-100 via-orange-50 to-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {repository.full_name}
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              {repository.description || 'No description available'}
            </p>

            {/* Repository Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(repository.stargazers_count)}
                </div>
                <div className="text-sm text-gray-600">Stars</div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <GitFork className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(repository.forks_count)}
                </div>
                <div className="text-sm text-gray-600">Forks</div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Eye className="h-6 w-6 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(repository.watchers_count)}
                </div>
                <div className="text-sm text-gray-600">Watchers</div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(repository.open_issues_count)}
                </div>
                <div className="text-sm text-gray-600">Issues</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Repository Details */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Topics */}
            {repository.topics && repository.topics.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Topics
                </h3>
                <div className="flex flex-wrap gap-2">
                  {repository.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {repository.languages &&
              Object.keys(repository.languages).length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Languages
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(repository.languages).map(
                      ([language, percentage]) => (
                        <div
                          key={language}
                          className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {language}
                          </span>
                          <span className="text-sm text-gray-500">
                            {String(percentage)}%
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Related Ideas */}
            {repositoryIdeas.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Business Ideas from this Repository ({repositoryIdeas.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {repositoryIdeas.slice(0, 4).map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onClick={() => navigate(`/ideas/${idea.id}`)}
                    />
                  ))}
                </div>
                {repositoryIdeas.length > 4 && (
                  <div className="text-center mt-4">
                    <button className="text-orange-500 hover:text-orange-600 font-medium">
                      View all {repositoryIdeas.length} ideas
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Repository Info */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Repository Info
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    Created: {formatDate(repository.created_at_github)}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    Updated: {formatDate(repository.last_commit_at)}
                  </span>
                </div>
                {repository.license_name && (
                  <div className="flex items-center text-sm">
                    <Code className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      License: {repository.license_name}
                    </span>
                  </div>
                )}
                {repository.is_archived && (
                  <div className="flex items-center text-sm">
                    <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                    <span className="text-red-600">Archived</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Data Quality Score</span>
                  <span className="font-medium">
                    {repository.data_quality_score
                      ? `${repository.data_quality_score}/100`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">AI Agent Project</span>
                  <span className="font-medium">
                    {repository.is_ai_agent_project ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={window.location.href}
        title={repository?.full_name}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode="login"
      />
    </div>
  );
};

export default RepositoryDetail;