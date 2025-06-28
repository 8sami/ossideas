import React, { useState, useMemo, useRef, useCallback } from 'react';
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
import { useIdeas, convertIdeaToIdeaData } from '../hooks/useIdeas';
import { useSubmissions } from '../hooks/useSubmissions';
import { Zap } from 'lucide-react';
import FullScreenLoader from './FullScreenLoader';

interface MainContentProps {
  searchQuery: string;
  filterOpen: boolean;
  onIdeaSelect: (idea: IdeaData) => void;
  isLoggedIn: boolean;
  onRegisterClick: () => void;
  onFilterToggle: () => void;
}

const MainContent: React.FC<MainContentProps> = ({
  searchQuery,
  filterOpen,
  onFilterToggle,
}) => {
  const navigate = useNavigate();
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
      'personalized',
      'discovery',
    ],
  });

  // Main repositories hook for discovery section
  const { repositories, loading, hasMore, error, loadMore } = useRepositories();

  // Specialized hooks for different sections
  const { newRepositories, loading: newLoading } = useNewRepositories();
  const { trendingRepositories, loading: trendingLoading } =
    useTrendingRepositories();
  const { communityRepositories, loading: communityLoading } =
    useCommunityPickRepositories();

  // Ideas hook for AI-generated business ideas
  const {
    ideas,
    loading: ideasLoading,
    hasMore: ideasHasMore,
    loadMore: loadMoreIdeas,
  } = useIdeas();

  // Submissions hook to check if user has submitted repositories
  const { submissions } = useSubmissions();

  const lastRepositoryElementRef = useRef<HTMLDivElement>(null);

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

  // Convert repositories to idea format for display
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
      isFromDatabase: false,
    }),
    [],
  );

  // Helper function to check if a section should be filtered
  const shouldFilterSection = (sectionId: string) => {
    return (filters.appliedSections || []).includes(sectionId);
  };

  // Apply filtering based on section settings - NOW ONLY USING BACKEND DATA
  const trendingIdeas = useMemo(() => {
    // Apply filters to original repositories first, then convert to ideas
    const filteredRepos = shouldFilterSection('trending')
      ? applyFilters(trendingRepositories)
      : trendingRepositories;
    return filteredRepos.map(convertRepositoryToIdea);
  }, [searchQuery, filters, trendingRepositories, convertRepositoryToIdea]);

  const communityPicks = useMemo(() => {
    // Apply filters to original repositories first, then convert to ideas
    const filteredRepos = shouldFilterSection('community')
      ? applyFilters(communityRepositories)
      : communityRepositories;
    return filteredRepos.map(convertRepositoryToIdea);
  }, [searchQuery, filters, communityRepositories, convertRepositoryToIdea]);

  const newArrivals = useMemo(() => {
    // Apply filters to original repositories first, then convert to ideas
    const filteredRepos = shouldFilterSection('newArrivals')
      ? applyFilters(newRepositories)
      : newRepositories;
    return filteredRepos.map(convertRepositoryToIdea);
  }, [searchQuery, filters, newRepositories, convertRepositoryToIdea]);

  // Handle idea selection - navigate to appropriate detail page
  const handleIdeaSelect = (idea: IdeaData) => {
    // Check if this is a repository idea (has ossProject) or an AI idea
    if (
      idea.ossProject &&
      idea.ossProject !== 'Unknown Repository' &&
      idea.ossProject !== null
    ) {
      // Find the repository ID from the repositories array
      const repo = repositories.find((r) => r.full_name === idea.ossProject);
      if (repo) {
        // Use the actual repository table ID to navigate to repository detail
        navigate(`/repositories/${repo.id}`);
      } else {
        // If repository not found, treat as AI idea
        navigate(`/ideas/${idea.id}`);
      }
    } else {
      // This is an AI-generated idea, use the idea table ID
      navigate(`/ideas/${idea.id}`);
    }
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    filters.categories.length > 0 ||
    filters.license.length > 0 ||
    filters.isNew ||
    filters.isTrending ||
    filters.communityPick ||
    filters.opportunityScore[0] > 0 ||
    filters.opportunityScore[1] < 100;

  // Helper function to get section description
  const getSectionDescription = (
    sectionId: string,
    count: number,
    baseCount?: number,
  ) => {
    const isFiltered = shouldFilterSection(sectionId);
    if (hasActiveFilters && isFiltered) {
      return `${count} ideas match your filters`;
    }
    if (baseCount && count < baseCount) {
      return `${count} of ${baseCount} ideas shown`;
    }
    return `${count} ideas`;
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
            className="group inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center space-x-1 px-5">
              <Zap className="h-5 w-5 text-orange-100 group-hover:text-white transition-colors" />
              <span className="text-sm font-bold tracking-wide">BUILT WITH BOLT</span>
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

        {/* AI-Generated Business Ideas Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-900 mr-3">
                🤖 AI-Generated Ideas
              </h2>
            </div>
            {ideasLoading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ideas.slice(0, 8).map((idea) => {
              const ideaData = convertIdeaToIdeaData(idea);
              return (
                <IdeaCard
                  key={idea.id}
                  idea={ideaData}
                  onClick={() => navigate(`/ideas/${idea.id}`)}
                />
              );
            })}
          </div>

          {ideasHasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMoreIdeas}
                disabled={ideasLoading}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {ideasLoading ? 'Loading...' : 'Load More Ideas'}
              </button>
            </div>
          )}
        </section>

        {/* Discovery Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🔍 Discover Repositories
              </h2>
              <p className="text-gray-600">
                {getSectionDescription('discovery', repositories.length)}
              </p>
            </div>
            {loading && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {repositories.map((repo, index) => {
              if (repositories.length === index + 1) {
                return (
                  <div key={repo.id} ref={lastRepositoryElementRef}>
                    <IdeaCard
                      idea={convertRepositoryToIdea(repo)}
                      onClick={() =>
                        handleIdeaSelect(convertRepositoryToIdea(repo))
                      }
                    />
                  </div>
                );
              } else {
                return (
                  <IdeaCard
                    key={repo.id}
                    idea={convertRepositoryToIdea(repo)}
                    onClick={() =>
                      handleIdeaSelect(convertRepositoryToIdea(repo))
                    }
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

          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MainContent;
