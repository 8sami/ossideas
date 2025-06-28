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
import {
  useRepositories,
  useNewRepositories,
  useTrendingRepositories,
  useCommunityPickRepositories,
  Repository,
} from '../hooks/useRepositories';
import { useSubmissions } from '../hooks/useSubmissions';
import { Zap } from 'lucide-react';
import FullScreenLoader from './FullScreenLoader';

interface MainContentProps {
  filterOpen: boolean;
  onFilterToggle: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  filterOpen,
  onFilterToggle,
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
    appliedSections: [
      'trending',
      'community',
      'newArrivals',
      'discovery',
    ],
  });

  // Main repositories hook for discovery section
  const { repositories, loading, hasMore, error, loadMore } = useRepositories();

  // Specialized hooks for different sections - ALL FROM REPOSITORIES
  const { newRepositories, loading: newLoading } = useNewRepositories();
  const { trendingRepositories, loading: trendingLoading } =
    useTrendingRepositories();
  const { communityRepositories, loading: communityLoading } =
    useCommunityPickRepositories();

  // Submissions hook to check if user has submitted repositories
  const { submissions } = useSubmissions();

  const lastRepositoryElementRef = useRef<HTMLDivElement>(null);

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
  const shouldFilterSection = useCallback((sectionId: string) => {
    return hasActiveFilters && filters.appliedSections.includes(sectionId);
  }, [hasActiveFilters, filters.appliedSections]);

  // Check if initial data is loading (show full screen loader)
  const isInitialLoading = useMemo(() => {
    const hasAnyData =
      repositories.length > 0 ||
      newRepositories.length > 0 ||
      trendingRepositories.length > 0 ||
      communityRepositories.length > 0;

    const isAnyLoading =
      loading || newLoading || trendingLoading || communityLoading;

    return isAnyLoading && !hasAnyData;
  }, [
    repositories.length,
    newRepositories.length,
    trendingRepositories.length,
    communityRepositories.length,
    loading,
    newLoading,
    trendingLoading,
    communityLoading,
  ]);

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

    if (lastRepositoryElementRef.current) {
      observer.observe(lastRepositoryElementRef.current);
    }

    return () => {
      if (lastRepositoryElementRef.current) {
        observer.unobserve(lastRepositoryElementRef.current);
      }
    };
  }, [loading, hasMore, loadMore]);

  // Apply search and filters to repositories
  const applyFilters = useCallback(
    (items: Repository[]) => {
      let filtered = items;

      // Apply search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (repo) =>
            repo.full_name.toLowerCase().includes(query) ||
            (repo.description &&
              repo.description.toLowerCase().includes(query)),
        );
      }

      // Apply category filters
      if (filters.categories.length > 0) {
        filtered = filtered.filter((repo) =>
          repo.topics?.some((topic) => filters.categories.includes(topic)),
        );
      }

      // Apply license filters
      if (filters.license.length > 0) {
        filtered = filtered.filter(
          (repo) =>
            repo.license_name && filters.license.includes(repo.license_name),
        );
      }

      // Apply opportunity score filters (using stargazers as proxy)
      const [minScore, maxScore] = filters.opportunityScore;
      if (minScore > 0 || maxScore < 100) {
        filtered = filtered.filter((repo) => {
          const score = Math.min((repo.stargazers_count / 1000) * 100, 100);
          return score >= minScore && score <= maxScore;
        });
      }

      // Apply boolean filters
      if (filters.isNew) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(
          (repo) =>
            repo.created_at_github &&
            new Date(repo.created_at_github) > thirtyDaysAgo,
        );
      }

      if (filters.isTrending) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filtered = filtered.filter(
          (repo) =>
            repo.last_commit_at &&
            new Date(repo.last_commit_at) > sevenDaysAgo &&
            repo.stargazers_count > 1000,
        );
      }

      if (filters.communityPick) {
        filtered = filtered.filter(
          (repo) =>
            repo.stargazers_count > 500 &&
            (repo.forks_count + repo.watchers_count) /
              Math.max(repo.stargazers_count, 1) >
              0.1,
        );
      }

      return filtered;
    },
    [searchQuery, filters],
  );

  // Convert repositories to idea format for display - ONLY REPOSITORIES
  const convertRepositoryToIdea = useCallback(
    (repo: Repository): IdeaData => ({
      id: repo.id,
      title: `${repo.full_name} Business Opportunity`,
      tagline: repo.description || `Build a business around ${repo.full_name}`,
      description:
        repo.description ||
        `This open source project has ${repo.stargazers_count} stars and ${repo.forks_count} forks, making it a great foundation for building a business.`,
      ossProject: repo.full_name,
      categories: repo.topics || ['Open Source'],
      opportunityScore: Math.min((repo.stargazers_count / 1000) * 100, 100),
      license: repo.license_name || 'Unknown',
      marketSize: '$1.2B (Estimated)',
      targetAudience: 'Developers, Tech Companies',
      monetizationStrategy: 'SaaS platform, Enterprise licensing',
      techStack: repo.languages
        ? Object.keys(repo.languages)
        : ['JavaScript', 'TypeScript'],
      competitiveAdvantage: `Open source foundation with ${repo.stargazers_count} stars`,
      risks: [
        'Open source competition',
        'Technology adoption challenges',
        'Market saturation',
      ],
      isSaved: false,
      isNew: repo.created_at_github
        ? new Date(repo.created_at_github) >
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        : false,
      isTrending: Boolean(
        repo.last_commit_at &&
          new Date(repo.last_commit_at) >
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
          repo.stargazers_count > 1000,
      ),
      communityPick: Boolean(
        repo.stargazers_count > 500 &&
          (repo.forks_count + repo.watchers_count) /
            Math.max(repo.stargazers_count, 1) >
            0.1,
      ),
      isFromDatabase: false, // These are repository-based ideas, not from ideas table
    }),
    [],
  );

  // Apply filtering based on section settings - ALL FROM REPOSITORIES ONLY
  const trendingIdeas = useMemo(() => {
    const filteredRepos = shouldFilterSection('trending')
      ? applyFilters(trendingRepositories)
      : trendingRepositories;
    return filteredRepos.map(convertRepositoryToIdea);
  }, [searchQuery, filters, trendingRepositories, convertRepositoryToIdea, applyFilters, shouldFilterSection]);

  const communityPicks = useMemo(() => {
    const filteredRepos = shouldFilterSection('community')
      ? applyFilters(communityRepositories)
      : communityRepositories;
    return filteredRepos.map(convertRepositoryToIdea);
  }, [searchQuery, filters, communityRepositories, convertRepositoryToIdea, applyFilters, shouldFilterSection]);

  const newArrivals = useMemo(() => {
    const filteredRepos = shouldFilterSection('newArrivals')
      ? applyFilters(newRepositories)
      : newRepositories;
    return filteredRepos.map(convertRepositoryToIdea);
  }, [searchQuery, filters, newRepositories, convertRepositoryToIdea, applyFilters, shouldFilterSection]);

  // Discovery section - also from repositories only
  const discoveryIdeas = useMemo(() => {
    const filteredRepos = shouldFilterSection('discovery')
      ? applyFilters(repositories)
      : repositories;
    return filteredRepos.map(convertRepositoryToIdea);
  }, [searchQuery, filters, repositories, convertRepositoryToIdea, applyFilters, shouldFilterSection]);

  // Handle idea selection - navigate to repository detail page since all are repository-based
  const handleIdeaSelect = (idea: IdeaData) => {
    // Since all ideas are now repository-based, find the repository ID
    const repo = repositories.find((r) => r.full_name === idea.ossProject) ||
                 trendingRepositories.find((r) => r.full_name === idea.ossProject) ||
                 communityRepositories.find((r) => r.full_name === idea.ossProject) ||
                 newRepositories.find((r) => r.full_name === idea.ossProject);
    
    if (repo) {
      // Navigate to repository detail page
      navigate(`/repositories/${repo.id}`);
    } else {
      // Fallback - shouldn't happen since all ideas are repository-based
      console.warn('Repository not found for idea:', idea.ossProject);
      navigate(`/ideas/${idea.id}`);
    }
  };

  // Show full screen loader during initial load
  if (isInitialLoading) {
    return <FullScreenLoader message="Loading amazing ideas for you..." />;
  }

  // Helper function to get section description with static counts
  const getSectionDescription = (
    sectionId: string,
    currentCount: number,
  ) => {
    const isFiltered = shouldFilterSection(sectionId);
    
    if (hasActiveFilters && isFiltered) {
      return `${currentCount} ${currentCount === 1 ? 'result' : 'results'} match your filters`;
    }
    
    // Descriptive counts for sections
    switch (sectionId) {
      case 'trending':
        return `${currentCount} trending repositories with high engagement`;
      case 'community':
        return `${currentCount} community favorites with strong adoption`;
      case 'newArrivals':
        return `${currentCount} repositories created in the last 30 days`;
      case 'discovery':
        return `Curated startup opportunities from open source projects`;
      default:
        return `${currentCount} ${currentCount === 1 ? 'item' : 'items'}`;
    }
  };

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
        {/*Built with bolt */}
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

        {/* Trending Ideas Section - FROM REPOSITORIES ONLY */}
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
            {trendingLoading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trendingIdeas.slice(0, 8).map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => handleIdeaSelect(idea)}
              />
            ))}
          </div>
        </section>

        {/* Community Picks Section - FROM REPOSITORIES ONLY */}
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
            {communityLoading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {communityPicks.slice(0, 8).map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => handleIdeaSelect(idea)}
              />
            ))}
          </div>
        </section>

        {/* New Arrivals Section - FROM REPOSITORIES ONLY */}
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
            {newLoading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {newArrivals.slice(0, 8).map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                onClick={() => handleIdeaSelect(idea)}
              />
            ))}
          </div>
        </section>

        {/* Discovery Section with Infinite Scroll - FROM REPOSITORIES ONLY */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🔍 Discover Repositories
              </h2>
              <p className="text-gray-600">
                {getSectionDescription('discovery', discoveryIdeas.length)}
              </p>
            </div>
            {loading && repositories.length === 0 && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {discoveryIdeas.map((idea, index) => {
              if (repositories.length === index + 1) {
                return (
                  <div key={idea.id} ref={lastRepositoryElementRef}>
                    <IdeaCard
                      idea={idea}
                      onClick={() => handleIdeaSelect(idea)}
                    />
                  </div>
                );
              } else {
                return (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onClick={() => handleIdeaSelect(idea)}
                  />
                );
              }
            })}
          </div>

          {error && (
            <div className="text-center mt-8">
              <p className="text-red-600">
                Error loading repositories: {error}
              </p>
            </div>
          )}

          {/* Loading indicator for infinite scroll */}
          {loading && repositories.length > 0 && (
            <div className="text-center mt-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading more repositories...</p>
            </div>
          )}

          {/* End of results indicator */}
          {!loading && !hasMore && repositories.length > 0 && (
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