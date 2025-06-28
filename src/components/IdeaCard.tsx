import React, { useState } from 'react';
import { Heart, ExternalLink, Zap } from 'lucide-react';
import { IdeaData } from '../types';
import { useSavedIdeas } from '../hooks/useSavedIdeas';
import { useAuth } from '../hooks/useAuth';

interface IdeaCardProps {
  idea: IdeaData;
  onClick: () => void;
  onLoginRequired?: () => void;
}

const IdeaCard: React.FC<IdeaCardProps> = ({ idea, onClick, onLoginRequired }) => {
  const { isIdeaSaved, toggleSaveIdea } = useSavedIdeas();
  const { authState } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const isSaved = isIdeaSaved(idea.id);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!authState.user) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    setIsSaving(true);

    try {
      await toggleSaveIdea(idea.id);
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

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-orange-200 transition-all duration-300 cursor-pointer h-[380px] flex flex-col">
      {/* Card Header with Gradient Background */}
      <div className="h-32 bg-gradient-to-br from-orange-100 via-orange-50 to-gray-50 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {idea.isNew && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded-full">
              New
            </span>
          )}
          {idea.isTrending && (
            <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full flex items-center">
              🔥 Hot
            </span>
          )}
          {idea.communityPick && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-500 text-white rounded-full">
              Community Pick
            </span>
          )}
        </div>

        {/* Save Button */}
        {idea.isFromDatabase && (
          <button
            onClick={handleSaveClick}
            disabled={isSaving}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all ${
              isSaved
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-orange-500'
            } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Opportunity Score */}
        <div className="absolute bottom-3 left-3">
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium ${getScoreColor(
              idea.opportunityScore,
            )}`}>
            <Zap className="h-3 w-3 mr-1" />
            {idea.opportunityScore}/100
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title and Tagline */}
        <div className="mb-3 flex-shrink-0">
          <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-orange-600 transition-colors line-clamp-2">
            {idea.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{idea.tagline}</p>
        </div>

        {/* OSS Project */}
        <div className="mb-3 flex-shrink-0">
          <div className="flex items-center text-sm text-gray-500">
            <ExternalLink className="h-3 w-3 mr-1" />
            <span className="truncate">{idea.ossProject}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-4 flex-1">
          <div className="flex flex-wrap gap-1">
            {idea.categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                {category}
              </span>
            ))}
            {idea.categories.length > 2 && (
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                +{idea.categories.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* License */}
        <div className="flex items-center justify-between text-sm flex-shrink-0">
          <span className="text-gray-500 truncate">License: {idea.license}</span>
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
        </div>
      </div>
    </div>
  );
};

export default IdeaCard;