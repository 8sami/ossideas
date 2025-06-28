import React, { useState } from 'react';
import { Heart, Star, ExternalLink, GitFork, Eye, AlertCircle, Calendar, Code } from 'lucide-react';
import { Repository } from '../hooks/useRepositories';

interface RepositoryCardProps {
  repository: Repository;
  onClick: () => void;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository, onClick }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  const getQualityColor = (score: number | null) => {
    if (!score) return 'text-gray-600 bg-gray-50 border-gray-200';
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const isNew = () => {
    if (!repository.created_at_github) return false;
    const createdDate = new Date(repository.created_at_github);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  };

  const isTrending = () => {
    // Consider trending if high stars and recent activity
    return repository.stargazers_count > 1000 && repository.last_commit_at && 
           new Date(repository.last_commit_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  };

  const isCommunityPick = () => {
    // Consider community pick if high engagement ratio
    const engagementRatio = (repository.forks_count + repository.watchers_count) / Math.max(repository.stargazers_count, 1);
    return engagementRatio > 0.1 && repository.stargazers_count > 500;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getLastCommitText = () => {
    if (!repository.last_commit_at) return 'No recent commits';
    const lastCommit = new Date(repository.last_commit_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastCommit.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300 cursor-pointer"
    >
      {/* Card Header with Gradient Background */}
      <div className="h-32 bg-gradient-to-br from-blue-100 via-blue-50 to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent"></div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {isNew() && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
              New
            </span>
          )}
          {isTrending() && (
            <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full flex items-center">
              🔥 Hot
            </span>
          )}
          {isCommunityPick() && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-500 text-white rounded-full">
              Community Pick
            </span>
          )}
          {repository.is_ai_agent_project && (
            <span className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded-full">
              AI Agent
            </span>
          )}
          {repository.is_archived && (
            <span className="px-2 py-1 text-xs font-medium bg-gray-500 text-white rounded-full">
              Archived
            </span>
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveClick}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
            isSaved 
              ? 'bg-orange-500 text-white shadow-lg' 
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-orange-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Quality Score */}
        {repository.data_quality_score && (
          <div className="absolute bottom-3 left-3">
            <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium ${getQualityColor(repository.data_quality_score)}`}>
              <AlertCircle className="h-3 w-3 mr-1" />
              {repository.data_quality_score}/100
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Title and Description */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
            {repository.name}
          </h3>
          <p className="text-sm text-gray-500 mb-1">{repository.owner}</p>
          <p className="text-sm text-gray-600 line-clamp-2">
            {repository.description || 'No description available'}
          </p>
        </div>

        {/* Repository Stats */}
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-gray-600">
            <Star className="h-3 w-3 mr-1 text-yellow-500" />
            <span>{formatNumber(repository.stargazers_count)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <GitFork className="h-3 w-3 mr-1 text-blue-500" />
            <span>{formatNumber(repository.forks_count)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Eye className="h-3 w-3 mr-1 text-green-500" />
            <span>{formatNumber(repository.watchers_count)}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <AlertCircle className="h-3 w-3 mr-1 text-red-500" />
            <span>{repository.open_issues_count}</span>
          </div>
        </div>

        {/* Topics */}
        {repository.topics && repository.topics.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {repository.topics.slice(0, 3).map((topic, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full"
                >
                  {topic}
                </span>
              ))}
              {repository.topics.length > 3 && (
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                  +{repository.topics.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-500">
            {repository.license_name ? (
              <>
                <Code className="h-3 w-3 mr-1" />
                <span>{repository.license_name}</span>
              </>
            ) : (
              <span>No license</span>
            )}
          </div>
          <div className="flex items-center text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{getLastCommitText()}</span>
          </div>
        </div>

        {/* View Details Link */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center text-orange-500 group-hover:text-orange-600 transition-colors">
            <span className="text-xs font-medium">View Details</span>
            <svg className="h-3 w-3 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <a
            href={repository.html_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default RepositoryCard;