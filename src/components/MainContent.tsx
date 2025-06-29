import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import IdeaCard from './IdeaCard';
import FilterPanel from './FilterPanel';
import { IdeaData, FilterOptions } from '../types';
import { useIdeas, IdeaFilters, convertIdeaToIdeaData } from '../hooks/useIdeas';
import { useSubmissions } from '../hooks/useSubmissions';
import { Zap } from 'lucide-react';
import FullScreenLoader from './FullScreenLoader';

interface MainContentProps {
  filterOpen: boolean;
  onFilterToggle: () => void;
  onRegisterClick: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  filterOpen,
  onFilterToggle,
  onRegisterClick,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    industries: [],
    opportunityScore: [0, 100],
    license: [],
    isNew: false,
    isTrending: false,
    communityPick: false,
  });

  // Use the ideas hook for all data
  const {
    ideas,
    loading,
    hasMore,
    error,
    initialized,
    loadMore,
    applyFilters: applyIdeaFiltersFromHook,
  } = useIdeas();

  // Submissions hook to check if user has submitted repositories
  const { submissions } = useSubmissions();

  const lastIdeaElementRef = useRef<HTMLDivElement>(null);

  // Convert ideas to IdeaData format
  const convertedIdeas = useMemo(() => {
    return ideas.map(convertIdeaToIdeaData);
  }, [ideas]);

  // Convert FilterOptions to IdeaFilters format
  const convertToIdeaFilters = useCallback((filterOptions: FilterOptions, searchTerm: string): IdeaFilters => {
    return {
      min_score: filterOptions.opportunityScore[0],
      max_score: filterOptions.opportunityScore[1],
      is_premium: null, // We don't filter by premium status in the UI currently
      status: [], // We don't filter by status in the UI currently
      search_query: searchTerm,
      idea_categories: filterOptions.categories,
      idea_industries: filterOptions.industries,
      license_names: filterOptions.license,
    };
  }, []);

  // Apply filters when they change - use a ref to prevent infinite loops
  const lastAppliedFiltersRef = useRef<string>('');
  
  useEffect(() => {
    const ideaFilters = convertToIdeaFilters(filters, searchQuery);
    const filtersString = JSON.stringify(ideaFilters);
    
    // Only apply if filters actually changed
    if (filtersString !== lastAppliedFiltersRef.current) {
      lastAppliedFiltersRef.current = filtersString;
      applyIdeaFiltersFromHook(ideaFilters);
    }
  }, [filters, searchQuery, convertToIdeaFilters, applyIdeaFiltersFromHook]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || !initialized) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 1.0 },
    );

    if (lastIdeaElementRef.current) {
      observer.observe(lastIdeaElementRef.current);
    }

    return () => {
      if (lastIdeaElementRef.current) {
        observer.unobserve(lastIdeaElementRef.current);
      }
    };
  }, [loading, hasMore, loadMore, initialized]);

  // Find the top 4 ideas with highest teardown scores to mark as trending
  const topTrendingIdeasIds = useMemo(() => {
    // Sort all ideas by teardown score and get top 4 IDs
    return ideas
      .sort((a, b) => {
        const scoreA = a.overall_teardown_score || 0;
        const scoreB = b.overall_teardown_score || 0;
        return scoreB - scoreA;
      })
      .slice(0, 4)
      .map(idea => idea.id);
  }, [ideas]);

  // Filter ideas for different sections
  const trendingIdeas = useMemo(() => {
    // Get top 4 ideas with highest teardown scores for trending
    return [...convertedIdeas]
      .sort((a, b) => {
        // Get the original idea data to access overall_teardown_score
        const ideaA = ideas.find(idea => idea.id === a.id);
        const ideaB = ideas.find(idea => idea.id === b.id);
        const scoreA = ideaA?.overall_teardown_score || 0;
        const scoreB = ideaB?.overall_teardown_score || 0;
        return scoreB - scoreA;
      })
      .slice(0, 4); // Take top 4
  }, [convertedIdeas, ideas]);

  const communityPicks = useMemo(() => {
    let filtered = convertedIdeas.filter((idea) => idea.communityPick);
    
    // Sort by repository stars (highest first) and take top 4
    return filtered
      .sort((a, b) => (b.repositoryStargazersCount || 0) - (a.repositoryStargazersCount || 0))
      .slice(0, 4);
  }, [convertedIdeas]);

  // Discovery section - all ideas sorted by generated date (newest first)
  const discoveryIdeas = useMemo(() => {
    return [...convertedIdeas].sort((a, b) => {
      if (!a.generatedAt || !b.generatedAt) return 0;
      return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
    });
  }, [convertedIdeas]);

  // Handle idea selection - navigate to idea detail page
  const handleIdeaSelect = (idea: IdeaData) => {
    navigate(`/ideas/${idea.id}`);
  };

  // Helper function to get section description
  const getSectionDescription = (sectionId: string, currentCount: number) => {
    // Descriptive counts for sections
    switch (sectionId) {
      case 'trending':
        return `Top ${currentCount} ideas with highest teardown scores`;
      case 'community':
        return `${currentCount} community favorites with strong adoption`;
      case 'discovery':
        return `Curated startup opportunities from open source projects`;
      default:
        return `${currentCount} ${currentCount === 1 ? 'item' : 'items'}`;
    }
  };

  // Show full screen loader only during initial load
  if (!initialized && loading) {
    return <FullScreenLoader message="Loading amazing ideas for you..." />;
  }

  // Show error state if there's an error and no data
  if (error && convertedIdeas.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to load ideas
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
      {/* Filter Panel */}
      {filterOpen && (
        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          isOpen={filterOpen}
          onClose={onFilterToggle}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-4">
        {/* Built with bolt */}
        <div className="pb-3">
          <a
            href="https://bolt.new"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="flex items-center space-x-1 px-5">
              <Zap className="h-5 w-5 text-orange-100 group-hover:text-white transition-colors" />
              <span className="text-sm font-bold tracking-wide">
                BUILT WITH BOLT
              </span>
            </div>
          </a>
        </div>

        {/* Submit Repository Section - Only show if user has no submissions */}
        {submissions.length === 0 && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-2">
                    🚀 Submit Your Repository
                  </h2>
                  <p className="text-orange-100 mb-4 max-w-2xl">
                    Have an open-source project? Submit it and we'll generate
                    business ideas and monetization strategies for you.
                  </p>
                  <button
                    onClick={() => navigate('/submit')}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium">
                    <span>Submit Repository</span>
                    <svg
                      className="h-4 w-4"
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
                  </button>
                </div>
                <div className="hidden lg:block">
                  <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center">
                    <svg
                      className="h-12 w-12 text-white/80"
                      fill="currentColor"
                      viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Content Sections - Only show if initialized */}
        {initialized && (
          <>
            {/* Trending Ideas Section - Show 4 items with highest teardown scores */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    🔥 Trending Ideas
                  </h2>
                  <p className="text-gray-600">
                    {getSectionDescription('trending', trendingIdeas.length)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trendingIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={{
                      ...idea,
                      // Mark as trending if it's in the top 4 by teardown score
                      isTrending: topTrendingIdeasIds.includes(idea.id)
                    }}
                    onClick={() => handleIdeaSelect(idea)}
                    onRegisterClick={onRegisterClick}
                  />
                ))}
              </div>
            </section>

            {/* Community Picks Section - Show 4 items sorted by most stars */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    👥 Community Picks
                  </h2>
                  <p className="text-gray-600">
                    {getSectionDescription('community', communityPicks.length)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {communityPicks.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={{
                      ...idea,
                      // Mark as trending if it's in the top 4 by teardown score
                      isTrending: topTrendingIdeasIds.includes(idea.id)
                    }}
                    onClick={() => handleIdeaSelect(idea)}
                    onRegisterClick={onRegisterClick}
                  />
                ))}
              </div>
            </section>

            {/* Discovery Section with Infinite Scroll - Sorted by created date (newest first) */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    🔍 Discover Ideas
                  </h2>
                  <p className="text-gray-600">
                    {getSectionDescription('discovery', discoveryIdeas.length)}
                  </p>
                </div>
                {loading && convertedIdeas.length > 0 && (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {discoveryIdeas.map((idea, index) => {
                  if (discoveryIdeas.length === index + 1) {
                    return (
                      <div key={idea.id} ref={lastIdeaElementRef}>
                        <IdeaCard
                          idea={{
                            ...idea,
                            // Mark as trending if it's in the top 4 by teardown score
                            isTrending: topTrendingIdeasIds.includes(idea.id)
                          }}
                          onClick={() => handleIdeaSelect(idea)}
                          onRegisterClick={onRegisterClick}
                        />
                      </div>
                    );
                  } else {
                    return (
                      <IdeaCard
                        key={idea.id}
                        idea={{
                          ...idea,
                          // Mark as trending if it's in the top 4 by teardown score
                          isTrending: topTrendingIdeasIds.includes(idea.id)
                        }}
                        onClick={() => handleIdeaSelect(idea)}
                        onRegisterClick={onRegisterClick}
                      />
                    );
                  }
                })}
              </div>

              {error && (
                <div className="text-center mt-8">
                  <p className="text-red-600">Error loading ideas: {error}</p>
                </div>
              )}

              {/* Loading indicator for infinite scroll */}
              {loading && convertedIdeas.length > 0 && (
                <div className="text-center mt-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading more ideas...</p>
                </div>
              )}

              {/* End of results indicator */}
              {!loading && !hasMore && convertedIdeas.length > 0 && (
                <div className="text-center mt-8">
                  <p className="text-gray-600">You've reached the end! 🎉</p>
                </div>
              )}
            </section>
          </>
        )}

        {/* Empty state - only show if initialized and no data */}
        {initialized && convertedIdeas.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Zap className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No ideas found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or check back later for new ideas.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;