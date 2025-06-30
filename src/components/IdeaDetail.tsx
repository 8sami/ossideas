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
  Zap,
  Layers,
  Target,
  TrendingUp,
  DollarSign,
  ListChecks,
  Rocket,
} from 'lucide-react';
import { useIdeaById } from '../hooks/useIdeaById';
import { useSavedIdeas } from '../hooks/useSavedIdeas';
import { useAuth } from '../hooks/useAuth';
import FullScreenLoader from './FullScreenLoader';
import ShareModal from './ShareModal';
import AuthModal from './AuthModal';
import CompetitiveAnalysisCard from './CompetitiveAnalysisCard';
import TechStackCard from './TechStackCard';
import MVPFeaturesCard from './MVPFeaturesCard';
import RiskAnalysisCard from './RiskAnalysisCard';
import MetricsCard from './MetricsCard';
import MonetizationStrategyCard from './MonetizationStrategyCard';
import ActionItemsCard from './ActionItemsCard';
import GoToMarketCard from './GoToMarketCard';

const IdeaDetail: React.FC = () => {
  const { id, owner, repo } = useParams<{ id?: string; owner?: string; repo?: string }>();
  const navigate = useNavigate();
  const repositoryFullName = owner && repo ? `${owner}/${repo}` : undefined;
  const { idea, loading, error } = useIdeaById(id, repositoryFullName);
  const { isIdeaSaved, toggleSaveIdea } = useSavedIdeas();
  const { authState } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const isSaved = idea ? isIdeaSaved(idea.id) : false;

  const handleSaveClick = async () => {
    if (!authState.user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!idea) return;

    setIsSaving(true);
    try {
      await toggleSaveIdea(idea.id);
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
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
    return <FullScreenLoader message="Loading idea details..." />;
  }

  if (error || !idea) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Idea Not Found
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error || 'The idea you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/ideas')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
            Back to Ideas
          </button>
        </div>
      </div>
    );
  }

  // Find analysis results by type
  const findAnalysisByType = (typeId: number) => {
    return idea.analysisResults?.find(ar => ar.analysis_type_id === typeId);
  };

  // Get all analysis results
  const competitiveAnalysis = findAnalysisByType(5);
  const techStackAnalysis = findAnalysisByType(7);
  const mvpFeaturesAnalysis = findAnalysisByType(3);
  const riskAnalysis = findAnalysisByType(9);
  const metricsAnalysis = findAnalysisByType(8);
  const monetizationAnalysis = findAnalysisByType(6);
  const actionItemsAnalysis = findAnalysisByType(4);
  const goToMarketAnalysis = findAnalysisByType(10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <button
              onClick={() => navigate('/ideas')}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors group">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Ideas</span>
            </button>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  isSaving
                    ? 'bg-orange-500 text-white opacity-50 cursor-not-allowed'
                    : isSaved
                    ? 'bg-orange-500 text-white shadow-lg hover:shadow-xl hover:bg-orange-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                }`}>
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''} transition-all`} />
                <span>
                  {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                </span>
              </button>

              <button
                onClick={handleShareClick}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all duration-200 font-medium">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {idea.repository?.html_url && (
                <a
                  href={idea.repository.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 hover:shadow-lg transition-all duration-200 font-medium">
                  <Github className="h-4 w-4" />
                  <span className="hidden sm:inline">View on GitHub</span>
                  <span className="sm:hidden">GitHub</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-100 via-orange-50 to-gray-50 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 break-words">
              {idea.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-4xl mx-auto leading-relaxed">
              {idea.tagline}
            </p>

            {/* Opportunity Score */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
                <Zap className="h-5 w-5 text-orange-500 mr-2" />
                <span className="font-semibold text-gray-900">Opportunity Score:</span>
                <span className="ml-2 text-lg font-bold text-orange-600">{idea.opportunityScore}/100</span>
              </div>
            </div>

            {/* Repository Stats */}
            {idea.repository && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(idea.repository.stargazers_count)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Stars</div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <GitFork className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(idea.repository.forks_count)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Forks</div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Eye className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(idea.repository.watchers_count)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Watchers</div>
                </div>

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                    {formatNumber(idea.repository.open_issues_count)}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Issues</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Analysis Results */}
        <div className="space-y-8">
          {/* Analysis Cards */}
          <div className="grid grid-cols-1 gap-8">
            {/* Monetization Strategy Card */}
            {monetizationAnalysis && (
              <MonetizationStrategyCard analysis={monetizationAnalysis} />
            )}

            {/* MVP Features Card */}
            {mvpFeaturesAnalysis && (
              <MVPFeaturesCard analysis={mvpFeaturesAnalysis} />
            )}

            {/* Competitive Analysis Card */}
            {competitiveAnalysis && (
              <CompetitiveAnalysisCard analysis={competitiveAnalysis} />
            )}

            {/* Tech Stack Card */}
            {techStackAnalysis && (
              <TechStackCard analysis={techStackAnalysis} />
            )}

            {/* Metrics Card */}
            {metricsAnalysis && (
              <MetricsCard analysis={metricsAnalysis} />
            )}

            {/* Risk Analysis Card */}
            {riskAnalysis && (
              <RiskAnalysisCard analysis={riskAnalysis} />
            )}

            {/* Action Items Card */}
            {actionItemsAnalysis && (
              <ActionItemsCard analysis={actionItemsAnalysis} />
            )}

            {/* Go-to-Market Card */}
            {goToMarketAnalysis && (
              <GoToMarketCard analysis={goToMarketAnalysis} />
            )}

            {/* No Analysis Results */}
            {!idea.analysisResults || idea.analysisResults.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Layers className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Analysis Results Available
                </h3>
                <p className="text-gray-600 mb-6">
                  This idea doesn't have any detailed analysis results yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        url={window.location.href}
        title={idea?.title}
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

export default IdeaDetail;