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
import { useRepositoryById } from '../hooks/useRepositoryById';
import { useIdeas, convertIdeaToIdeaData } from '../hooks/useIdeas';
import { useSavedIdeas } from '../hooks/useSavedIdeas';
import UnifiedCard from './UnifiedCard';
import FullScreenLoader from './FullScreenLoader';
import ShareModal from './ShareModal';

interface UnifiedDetailProps {
  type: 'idea' | 'repository';
}

const UnifiedDetail: React.FC<UnifiedDetailProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isIdeaSaved, toggleSaveIdea } = useSavedIdeas();
  const { ideas } = useIdeas();
  const [isSaving, setIsSaving] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Fetch data based on type
  const { idea, loading: ideaLoading, error: ideaError } = useIdeaById(type === 'idea' ? id : undefined);
  const { repository, loading: repoLoading, error: repoError } = useRepositoryById(type === 'repository' ? id : undefined);

  const loading = type === 'idea' ? ideaLoading : repoLoading;
  const error = type === 'idea' ? ideaError : repoError;
  const data = type === 'idea' ? idea : repository;

  const isSaved = id && type === 'idea' ? isIdeaSaved(id) : false;

  // Filter related ideas for repositories
  const relatedIdeas = useMemo(() => {
    if (type !== 'repository' || !id) return [];
    return ideas
      .filter((idea) => idea.repository_id === id)
      .map(convertIdeaToIdeaData);
  }, [type, id, ideas]);

  const handleSaveClick = async () => {
    if (!id || type !== 'idea') return;

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
    return <FullScreenLoader message={`Loading ${type}...`} />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {type === 'idea' ? 'Idea' : 'Repository'} Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            {error || `The ${type} you are looking for does not exist.`}
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

  // Type-specific data extraction
  const isIdea = type === 'idea';
  const isRepository = type === 'repository';
  
  const title = isIdea ? (data as any).title : (data as any).full_name;
  const description = isIdea ? (data as any).tagline : (data as any).description || 'No description available';

  // Render idea-specific sections
  const renderIdeaSections = () => {
    if (!isIdea) return null;
    
    const ideaData = data as any;
    const sections = [
      {
        id: 'overview',
        title: 'Executive Summary',
        icon: Target,
        content: ideaData.description,
      },
      {
        id: 'market',
        title: 'Market & Target Audience',
        icon: Users,
        content: `Market Size: ${ideaData.marketSize}\n\nTarget Audience: ${ideaData.targetAudience}`,
      },
      {
        id: 'monetization',
        title: 'Monetization Strategy',
        icon: DollarSign,
        content: ideaData.monetizationStrategy,
      },
      {
        id: 'tech',
        title: 'Recommended Tech Stack',
        icon: Code,
        content: Array.isArray(ideaData.techStack)
          ? ideaData.techStack.join(', ')
          : ideaData.techStack,
      },
      {
        id: 'advantage',
        title: 'Key Differentiators & Value Add',
        icon: TrendingUp,
        content: ideaData.competitiveAdvantage,
      },
      {
        id: 'risks',
        title: 'Risks & Considerations',
        icon: AlertTriangle,
        content: Array.isArray(ideaData.risks) ? ideaData.risks.join('\n• ') : ideaData.risks,
      },
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <section.icon className="h-5 w-5 text-orange-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                {section.title}
              </h3>
            </div>
            <div className="text-gray-700 whitespace-pre-line">
              {section.content}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render repository-specific content
  const renderRepositoryContent = () => {
    if (!isRepository) return null;
    
    const repoData = data as any;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Topics */}
          {repoData.topics && repoData.topics.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {repoData.topics.map((topic: string, index: number) => (
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
          {repoData.languages && Object.keys(repoData.languages).length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Languages
              </h3>
              <div className="space-y-2">
                {Object.entries(repoData.languages).map(([language, percentage]) => (
                  <div key={language} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {language}
                    </span>
                    <span className="text-sm text-gray-500">
                      {String(percentage)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Ideas */}
          {relatedIdeas.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Business Ideas from this Repository ({relatedIdeas.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedIdeas.slice(0, 4).map((idea) => (
                  <UnifiedCard
                    key={idea.id}
                    data={idea}
                    type="idea"
                    onClick={() => navigate(`/ideas/${idea.id}`)}
                  />
                ))}
              </div>
              {relatedIdeas.length > 4 && (
                <div className="text-center mt-4">
                  <button className="text-orange-500 hover:text-orange-600 font-medium">
                    View all {relatedIdeas.length} ideas
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
                  Created: {formatDate(repoData.created_at_github)}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-600">
                  Updated: {formatDate(repoData.last_commit_at)}
                </span>
              </div>
              {repoData.license_name && (
                <div className="flex items-center text-sm">
                  <Code className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    License: {repoData.license_name}
                  </span>
                </div>
              )}
              {repoData.is_archived && (
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
                  {repoData.data_quality_score
                    ? `${repoData.data_quality_score}/100`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">AI Agent Project</span>
                <span className="font-medium">
                  {repoData.is_ai_agent_project ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              {isIdea && (
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
              )}

              <button
                onClick={handleShareClick}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>

              {isRepository && (
                <a
                  href={(data as any).html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  <Github className="h-4 w-4" />
                  <span>View on GitHub</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-100 via-orange-50 to-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              {description}
            </p>

            {/* Key Metrics */}
            {isIdea && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className={`h-6 w-6 ${getScoreColor((data as any).opportunityScore)}`} />
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor((data as any).opportunityScore)}`}>
                    {(data as any).opportunityScore}/100
                  </div>
                  <div className="text-sm text-gray-600">Opportunity Score</div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <ExternalLink className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-lg font-bold text-gray-900 truncate">
                    {(data as any).ossProject}
                  </div>
                  <div className="text-sm text-gray-600">OSS Project</div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-6 w-6 text-gray-500" />
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {(data as any).license}
                  </div>
                  <div className="text-sm text-gray-600">License</div>
                </div>
              </div>
            )}

            {isRepository && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber((data as any).stargazers_count)}
                  </div>
                  <div className="text-sm text-gray-600">Stars</div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <GitFork className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber((data as any).forks_count)}
                  </div>
                  <div className="text-sm text-gray-600">Forks</div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <Eye className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber((data as any).watchers_count)}
                  </div>
                  <div className="text-sm text-gray-600">Watchers</div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber((data as any).open_issues_count)}
                  </div>
                  <div className="text-sm text-gray-600">Issues</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {renderIdeaSections()}
        {renderRepositoryContent()}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={window.location.href}
        title={title}
      />
    </div>
  );
};

export default UnifiedDetail;