
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  Share2,
  ExternalLink,
  Zap,
  Users,
  DollarSign,
  Code,
  Target,
  TrendingUp,
  AlertTriangle,
  Star,
  GitFork,
  Eye,
  Calendar,
  Github,
} from 'lucide-react';
import { useIdeaById } from '../hooks/useIdeaById';
import { useSavedIdeas } from '../hooks/useSavedIdeas';
import FullScreenLoader from './FullScreenLoader';
import ShareModal from './ShareModal';

const IdeaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { idea, loading, error } = useIdeaById(id);
  const { isIdeaSaved, toggleSaveIdea } = useSavedIdeas();
  const [isSaving, setIsSaving] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const isSaved = id ? isIdeaSaved(id) : false;

  const handleSaveClick = async () => {
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // Check if this is a repository-based idea (has GitHub-style project name)
  const isRepositoryBased = useMemo(() => {
    return (
      idea?.ossProject.includes('/') && !idea.ossProject.startsWith('http')
    );
  }, [idea?.ossProject]);

  // Extract repository stats from the idea if it's repository-based
  const repositoryStats = useMemo(() => {
    if (!isRepositoryBased || !idea) return null;

    // Extract stats from the competitive advantage or generate mock stats
    const starsMatch = idea.competitiveAdvantage.match(
      /(\d+(?:,\d+)*)\s*stars?/i,
    );
    const stars = starsMatch
      ? parseInt(starsMatch[1].replace(/,/g, ''))
      : Math.floor(Math.random() * 10000) + 100;

    return {
      stars,
      forks: Math.floor(stars * 0.1),
      watchers: Math.floor(stars * 0.05),
      issues: Math.floor(stars * 0.02),
      lastCommit: 'Updated 2 days ago',
    };
  }, [idea?.competitiveAdvantage, isRepositoryBased, idea]);

  if (loading) {
    return <FullScreenLoader message="Loading idea..." />;
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Idea Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'The idea you are looking for does not exist.'}
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

  const sections = [
    {
      id: 'overview',
      title: 'Executive Summary',
      icon: Target,
      content: idea.description,
    },
    {
      id: 'market',
      title: 'Market & Target Audience',
      icon: Users,
      content: `Market Size: ${idea.marketSize}\n\nTarget Audience: ${idea.targetAudience}`,
    },
    {
      id: 'monetization',
      title: 'Monetization Strategy',
      icon: DollarSign,
      content: idea.monetizationStrategy,
    },
    {
      id: 'tech',
      title: 'Recommended Tech Stack',
      icon: Code,
      content: Array.isArray(idea.techStack)
        ? idea.techStack.join(', ')
        : idea.techStack,
    },
    {
      id: 'advantage',
      title: 'Key Differentiators & Value Add',
      icon: TrendingUp,
      content: idea.competitiveAdvantage,
    },
    {
      id: 'risks',
      title: 'Risks & Considerations',
      icon: AlertTriangle,
      content: Array.isArray(idea.risks) ? idea.risks.join('\n• ') : idea.risks,
    },
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile-first responsive design */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Layout - Stacked */}
          <div className="flex flex-col space-y-3 sm:hidden">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors self-start">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to Ideas</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm flex-1 justify-center ${
                  isSaving
                    ? 'bg-orange-500 text-white opacity-50 cursor-not-allowed'
                    : isSaved
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                }`}>
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>
                  {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                </span>
              </button>

              <button
                onClick={handleShareClick}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg active:bg-gray-200 transition-colors text-sm flex-1 justify-center">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Desktop Layout - Side by side */}
          <div className="hidden sm:flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Ideas</span>
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
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section - Responsive */}
      <div className="bg-gradient-to-br from-orange-100 via-orange-50 to-gray-50 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-8">
            {/* Badges - Responsive */}
            <div className="flex justify-center flex-wrap gap-2 mb-4">
              {idea.isNew && (
                <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-blue-500 text-white rounded-full">
                  New
                </span>
              )}
              {idea.isTrending && (
                <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-red-500 text-white rounded-full">
                  🔥 Trending
                </span>
              )}
              {idea.communityPick && (
                <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium bg-purple-500 text-white rounded-full">
                  Community Pick
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              {idea.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl mx-auto px-2">
              {idea.tagline}
            </p>

            {/* Key Metrics - Responsive Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Zap
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${getScoreColor(
                      idea.opportunityScore,
                    )}`}
                  />
                </div>
                <div
                  className={`text-xl sm:text-2xl font-bold ${getScoreColor(
                    idea.opportunityScore,
                  )}`}>
                  {idea.opportunityScore}/100
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Opportunity Score</div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  {isRepositoryBased ? (
                    <Github className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                  ) : (
                    <ExternalLink className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  )}
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-900 truncate px-1">
                  {idea.ossProject}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {isRepositoryBased ? 'Repository' : 'OSS Project'}
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                </div>
                <div className="text-sm sm:text-lg font-bold text-gray-900">
                  {idea.license}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">License</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Repository Stats - Responsive */}
      {isRepositoryBased && repositoryStats && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Repository Stats
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  {formatNumber(repositoryStats.stars)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Stars</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <GitFork className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  {formatNumber(repositoryStats.forks)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Forks</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  {formatNumber(repositoryStats.watchers)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Watchers</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                </div>
                <div className="text-lg sm:text-xl font-bold text-gray-900">
                  {formatNumber(repositoryStats.issues)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Issues</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content Sections - Responsive Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-8 sm:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {sections.map((section) => (
            <div key={section.id} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex items-center mb-3 sm:mb-4">
                <section.icon className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mr-2 flex-shrink-0" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {section.title}
                </h3>
              </div>
              <div className="text-sm sm:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                {section.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={window.location.href}
        title={idea?.title}
      />
    </div>
  );
};

export default IdeaDetail;
