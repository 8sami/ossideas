import React, { useState } from 'react';
import { Heart, ExternalLink, Zap, Star, GitFork, Eye, AlertCircle, Calendar, Code, Github } from 'lucide-react';
import { IdeaData } from '../types';
import { Repository } from '../hooks/useRepositories';
import { useSavedIdeas } from '../hooks/useSavedIdeas';

interface UnifiedCardProps {
  data: IdeaData | Repository;
  type: 'idea' | 'repository';
  onClick: () => void;
}

const UnifiedCard: React.FC<UnifiedCardProps> = ({ data, type, onClick }) => {
  const { isIdeaSaved, toggleSaveIdea } = useSavedIdeas();
  const [isSaving, setIsSaving] = useState(false);

  // Type guards and data extraction
  const isIdea = type === 'idea';
  const isRepository = type === 'repository';
  
  const idea = isIdea ? (data as IdeaData) : null;
  const repository = isRepository ? (data as Repository) : null;

  // Common properties
  const id = data.id;
  const title = isIdea ? idea!.title : repository!.name;
  const description = isIdea ? idea!.tagline : repository!.description || 'No description available';
  const categories = isIdea ? idea!.categories : repository!.topics || [];
  const license = isIdea ? idea!.license : repository!.license_name || 'Unknown';

  // Idea-specific properties
  const opportunityScore = isIdea ? idea!.opportunityScore : null;
  const ossProject = isIdea ? idea!.ossProject : null;
  const isNew = isIdea ? idea!.isNew : isRepositoryNew();
  const isTrending = isIdea ? idea!.isTrending : isRepositoryTrending();
  const communityPick = isIdea ? idea!.communityPick : isRepositoryCommunityPick();

  // Repository-specific properties
  const owner = isRepository ? repository!.owner : null;
  const stargazersCount = isRepository ? repository!.stargazers_count : 0;
  const forksCount = isRepository ? repository!.forks_count : 0;
  const watchersCount = isRepository ? repository!.watchers_count : 0;
  const openIssuesCount = isRepository ? repository!.open_issues_count : 0;
  const dataQualityScore = isRepository ? repository!.data_quality_score : null;
  const isArchived = isRepository ? repository!.is_archived : false;
  const isAiAgent = isRepository ? repository!.is_ai_agent_project : false;
  const lastCommitAt = isRepository ? repository!.last_commit_at : null;

  const isSaved = isIdea ? isIdeaSaved(id) : false; // Only ideas can be saved for now

  function isRepositoryNew(): boolean {
    if (!repository?.created_at_github) return false;
    const createdDate = new Date(repository.created_at_github);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  }

  function isRepositoryTrending(): boolean {
    if (!repository) return false;
    return repository.stargazers_count > 1000 && repository.last_commit_at && 
           new Date(repository.last_commit_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  }

  function isRepositoryCommunityPick(): boolean {
    if (!repository) return false;
    const engagementRatio = (repository.forks_count + repository.watchers_count) / Math.max(repository.stargazers_count, 1);
    return engagementRatio > 0.1 && repository.stargazers_count > 500;
  }

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isIdea) return; // Only ideas can be saved

    setIsSaving(true);
    try {
      await toggleSaveIdea(id);
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getLastCommitText = () => {
    if (!lastCommitAt) return 'No recent commits';
    const lastCommit = new Date(lastCommitAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastCommit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Gradient colors based on type
  const gradientColors = isIdea 
    ? 'from-orange-100 via-orange-50 to-gray-50' 
    : 'from-blue-100 via-blue-50 to-gray-50';
  
  const gradientOverlay = isIdea 
    ? 'from-orange-500/10 to-transparent' 
    : 'from-blue-500/10 to-transparent';

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300 cursor-pointer h-[380px] flex flex-col">
      
      {/* Card Header with Type-specific Gradient */}
      <div className={`h-32 bg-gradient-to-br ${gradientColors} relative overflow-hidden flex-shrink-0`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientOverlay}`}></div>

        {/* Type Indicator */}
        <div className="absolute top-2 left-2">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isIdea 
              ? 'bg-orange-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}>
            {isIdea ? <Zap className="h-3 w-3 mr-1" /> : <Github className="h-3 w-3 mr-1" />}
            {isIdea ? 'Idea' : 'Repository'}
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 right-2 left-20 flex flex-wrap gap-1">
          {isNew && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
              New
            </span>
          )}
          {isTrending && (
            <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full flex items-center">
              🔥 Hot
            </span>
          )}
          {communityPick && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-500 text-white rounded-full">
              Community Pick
            </span>
          )}
          {isRepository && isAiAgent && (
            <span className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
              AI Agent
            </span>
          )}
          {isRepository && isArchived && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-500 text-white rounded-full">
              Archived
            </span>
          )}
        </div>

        {/* Save Button (Ideas only) */}
        {isIdea && (
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`absolute bottom-3 right-3 p-2 rounded-full transition-all ${
              isSaved
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-orange-500'
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Score Display */}
        <div className="absolute bottom-3 left-3">
          {isIdea && opportunityScore !== null && (
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium ${getScoreColor(opportunityScore)}`}>
              <Zap className="h-3 w-3 mr-1" />
              {opportunityScore}/100
            </div>
          )}
          {isRepository && dataQualityScore && (
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium ${getScoreColor(dataQualityScore)}`}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {dataQualityScore}/100
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title and Description */}
        <div className="mb-3 flex-shrink-0">
          <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-orange-600 transition-colors line-clamp-2">
            {title}
          </h3>
          {isRepository && owner && (
            <p className="text-sm text-gray-500 mb-1">{owner}</p>
          )}
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        </div>

        {/* OSS Project (Ideas only) */}
        {isIdea && ossProject && (
          <div className="mb-3 flex-shrink-0">
            <div className="flex items-center text-sm text-gray-500">
              <ExternalLink className="h-3 w-3 mr-1" />
              <span className="truncate">{ossProject}</span>
            </div>
          </div>
        )}

        {/* Repository Stats (Repositories only) */}
        {isRepository && (
          <div className="mb-3 grid grid-cols-2 gap-2 text-sm flex-shrink-0">
            <div className="flex items-center text-gray-600">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              <span>{formatNumber(stargazersCount)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <GitFork className="h-3 w-3 mr-1 text-blue-500" />
              <span>{formatNumber(forksCount)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Eye className="h-3 w-3 mr-1 text-green-500" />
              <span>{formatNumber(watchersCount)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
              <span>{openIssuesCount}</span>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="mb-4 flex-1">
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                {category}
              </span>
            ))}
            {categories.length > 2 && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                +{categories.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm flex-shrink-0">
          <div className="flex items-center text-gray-500">
            <Code className="h-3 w-3 mr-1" />
            <span className="truncate">License: {license}</span>
          </div>
          {isRepository && (
            <div className="flex items-center text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{getLastCommitText()}</span>
            </div>
          )}
        </div>

        {/* View Details Link */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-orange-500 group-hover:text-orange-600 transition-colors">
            <span className="text-xs font-medium text-nowrap">View Details</span>
            <svg
              className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
          {isRepository && (
            <a
              href={repository!.html_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center text-gray-400 hover:text-gray-600 transition-colors">
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnifiedCard;