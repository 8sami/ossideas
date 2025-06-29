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
import { useIdeas, IdeaFilters } from '../hooks/useIdeas';
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
    opportunityScore: [0, 100],
    license: [],
    isNew: false,
    isTrending: false,
    communityPick: false,
    appliedSections: ['trending', 'community', 'newArrivals', 'discovery'],
  });

  // Use the ideas hook for all data
  const {
    ideas,
    loading,
    hasMore,
    error,
    loadMore,
    applyFilters: applyIdeaFiltersFromHook,
  } = useIdeas();

  // Submissions hook to check if user has submitted repositories
  const { submissions } = useSubmissions();

  const lastIdeaElementRef = useRef<HTMLDivElement>(null);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim() !== '' ||
      filters.categories.length > 0 ||
      filters.license.length > 0 ||
      filters.opportunityScore[0] > 0 ||
      filters.opportunityScore[1] < 100 ||
      filters.isNew ||
      filters.isTrending ||
      filters.communityPick
    );
  }, [searchQuery, filters]);

  // Helper function to check if a section should be filtered
  const shouldFilterSection = useCallback(
    (sectionId: string) => {
      return hasActiveFilters && filters.appliedSections.includes(sectionId);
    },
    [hasActiveFilters, filters.appliedSections],
  );

  // Check if initial data is loading (show full screen loader)
  const isInitialLoading = useMemo(() => {
    return loading && ideas.length === 0;
  }, [loading, ideas.length]);

  // Sync MainContent filters with useIdeas hook
  useEffect(() => {
    const ideaFilters: IdeaFilters = {
      min_score: filters.opportunityScore[0],
      max_score: filters.opportunityScore[1],
      is_premium: null, // We don't filter by premium status in the UI currently
      status: [], // We don't filter by status in the UI currently
      search_query: searchQuery,
      repository_topics: filters.categories,
    };

    applyIdeaFiltersFromHook(ideaFilters);
  }, [searchQuery, filters, applyIdeaFiltersFromHook]);

  // Infinite scroll observer
  useEffect(() => {
    if (loading) return;

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
  }, [loading, hasMore, loadMore]);

  // Filter ideas for different sections
  const trendingIdeas = useMemo(() => {
    if (shouldFilterSection('trending')) {
      return ideas.filter((idea) => idea.isTrending);
    }
    return ideas.filter((idea) => idea.isTrending);
  }, [ideas, shouldFilterSection]);

  const communityPicks = useMemo(() => {
    if (shouldFilterSection('community')) {
      return ideas.filter((idea) => idea.communityPick);
    }
    return ideas.filter((idea) => idea.communityPick);
  }, [ideas, shouldFilterSection]);

  const newArrivals = useMemo(() => {
    if (shouldFilterSection('newArrivals')) {
      return ideas.filter((idea) => idea.isNew);
    }
    return ideas.filter((idea) => idea.isNew);
  }, [ideas, shouldFilterSection]);

  // Discovery section - all ideas
  const discoveryIdeas = useMemo(() => {
    return ideas;
  }, [ideas]);

  // Handle idea selection - navigate to idea detail page
  const handleIdeaSelect = (idea: IdeaData) => {
    navigate(`/ideas/${idea.id}`);
  };

  // Helper function to get section description
  const getSectionDescription = (sectionId: string, currentCount: number) => {
    const isFiltered = shouldFilterSection(sectionId);

    if (hasActiveFilters && isFiltered) {
      return `${currentCount} ${
        currentCount === 1 ? 'result' : 'results'
      } match your filters`;
    }

    // Descriptive counts for sections
    switch (sectionId) {
      case 'trending':
        return `${currentCount} trending ideas with high engagement`;
      case 'community':
        return `${currentCount} community favorites with strong adoption`;
      case 'newArrivals':
        return `${currentCount} ideas created in the last 30 days`;
      case 'discovery':
        return `Curated startup opportunities from open source projects`;
      default:
        return `${currentCount} ${currentCount === 1 ? 'item' : 'items'}`;
    }
  };

  // Show full screen loader during initial load
  if (isInitialLoading) {
    return <FullScreenLoader message="Loading amazing ideas for you..." />;
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

        {/* Trending Ideas Section */}
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
            {trendingIdeas.slice(0, 8).map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => handleIdeaSelect(idea)}
                onRegisterClick={onRegisterClick}
              />
            ))}
          </div>
        </section>

        {/* Community Picks Section */}
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
            {communityPicks.slice(0, 8).map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => handleIdeaSelect(idea)}
                onRegisterClick={onRegisterClick}
              />
            ))}
          </div>
        </section>

        {/* New Arrivals Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ✨ New Arrivals
              </h2>
              <p className="text-gray-600">
                {getSectionDescription('newArrivals', newArrivals.length)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newArrivals.slice(0, 8).map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => handleIdeaSelect(idea)}
                onRegisterClick={onRegisterClick}
              />
            ))}
          </div>
        </section>

        {/* Discovery Section with Infinite Scroll */}
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
            {loading && ideas.length === 0 && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {discoveryIdeas.map((idea, index) => {
              if (discoveryIdeas.length === index + 1) {
                return (
                  <div key={idea.id} ref={lastIdeaElementRef}>
                    <IdeaCard
                      idea={idea}
                      onClick={() => handleIdeaSelect(idea)}
                      onRegisterClick={onRegisterClick}
                    />
                  </div>
                );
              } else {
                return (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
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
          {loading && ideas.length > 0 && (
            <div className="text-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading more ideas...</p>
            </div>
          )}

          {/* End of results indicator */}
          {!loading && !hasMore && ideas.length > 0 && (
            <div className="text-center mt-8">
              <p className="text-gray-600">You've reached the end! 🎉</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MainContent;