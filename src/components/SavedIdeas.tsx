import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Heart } from 'lucide-react';
import IdeaCard from './IdeaCard';
import { useSavedIdeas } from '../hooks/useSavedIdeas';
import { IdeaData } from '../types';
import FullScreenLoader from './FullScreenLoader';

const SavedIdeas: React.FC = () => {
  const navigate = useNavigate();
  const { savedIdeas, loading, error } = useSavedIdeas();

  const handleIdeaSelect = (idea: IdeaData) => {
    // All saved ideas come from the ideas table, so navigate to idea detail
    navigate(`/ideas/${idea.id}`);
  };

  if (loading) {
    return <FullScreenLoader message="Loading saved ideas..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading saved ideas
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bookmark className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">My Saved Ideas</h1>
          </div>
          <p className="text-gray-600">
            Your collection of saved business ideas and opportunities
          </p>
        </div>

        {/* Content */}
        {savedIdeas.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No saved ideas yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start exploring ideas and save the ones that interest you
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Explore Ideas
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => handleIdeaSelect(idea)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedIdeas;
