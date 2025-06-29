import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { IdeaData } from '../types';

export interface Idea {
  id: string;
  repository_id: string;
  title: string;
  overview: any; // JSON field containing overview data
  overall_teardown_score: number | null;
  likes_count: number;
  is_premium: boolean;
  status: string;
  generated_at: string;
  last_updated_at: string;
  generated_by_ai_model: string | null;
  categories: any; // JSON field containing categories array
  industries: any; // JSON field containing industries array
  repository?: {
    id: string;
    full_name: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    watchers_count: number;
    topics: string[] | null;
    license_name: string | null;
    readme_content: string | null;
    languages: Record<string, number>;
    created_at_github: string | null;
    last_commit_at: string | null;
  };
  analysis_results?: Array<{
    id: string;
    analysis_type_id: number;
    title: string;
    summary_description: string | null;
    overall_score: number | null;
    analysis_payload: Record<string, unknown>;
    analysis_type?: {
      name: string;
      slug: string;
    };
  }>;
}

export interface IdeaFilters {
  min_score: number;
  max_score: number;
  is_premium: boolean | null;
  status: string[];
  search_query: string;
  idea_categories: string[]; // Categories filter
  idea_industries: string[]; // Industries filter
  license_names: string[]; // License filter
}

const ITEMS_PER_PAGE = 12;

export const useIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true); // Start with true for initial load
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [filters, setFilters] = useState<IdeaFilters>({
    min_score: 0,
    max_score: 100,
    is_premium: null,
    status: [],
    search_query: '',
    idea_categories: [],
    idea_industries: [],
    license_names: [],
  });

  const buildQuery = useCallback(
    (page: number, currentFilters: IdeaFilters, filteredIdeaIds: string[] | null = null) => {
      let query = supabase
        .from('ideas')
        .select(
          `
        *,
        repository:repositories(
          id,
          full_name,
          description,
          stargazers_count,
          forks_count,
          watchers_count,
          topics,
          license_name,
          readme_content,
          languages,
          created_at_github,
          last_commit_at
        ),
        analysis_results(
          id,
          analysis_type_id,
          title,
          summary_description,
          overall_score,
          analysis_payload,
          analysis_type:analysis_types(
            name,
            slug
          )
        )
      `,
        )
        .order('generated_at', { ascending: false });

      // Apply idea ID filter if provided (from category/industry filtering)
      if (filteredIdeaIds && filteredIdeaIds.length > 0) {
        query = query.in('id', filteredIdeaIds);
      }

      // Apply score filters
      if (currentFilters.min_score > 0) {
        query = query.gte('overall_teardown_score', currentFilters.min_score);
      }

      if (currentFilters.max_score < 100) {
        query = query.lte('overall_teardown_score', currentFilters.max_score);
      }

      // Apply premium filter
      if (currentFilters.is_premium !== null) {
        query = query.eq('is_premium', currentFilters.is_premium);
      }

      // Apply status filter
      if (currentFilters.status.length > 0) {
        query = query.in('status', currentFilters.status);
      }

      // Apply search query
      if (currentFilters.search_query) {
        query = query.or(
          `title.ilike.%${currentFilters.search_query}%,repository.description.ilike.%${currentFilters.search_query}%`,
        );
      }

      // Apply license filter directly (no need for subquery)
      if (currentFilters.license_names.length > 0) {
        query = query.in('repository.license_name', currentFilters.license_names);
      }

      // Apply pagination
      return query.range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);
    },
    [],
  );

  const fetchIdeas = useCallback(
    async (page: number = 0, reset: boolean = false) => {
      // Prevent multiple simultaneous requests
      if (loading && initialized) return;

      setLoading(true);
      setError(null);

      try {
        // Pre-filter by categories and industries if needed
        let filteredIdeaIds: string[] | null = null;

        // If we have category or industry filters, we need to pre-fetch the idea IDs
        if (filters.idea_categories.length > 0 || filters.idea_industries.length > 0) {
          // Get idea IDs that match category filters
          let categoryIdeaIds: string[] | null = null;
          if (filters.idea_categories.length > 0) {
            const { data: categoryData, error: categoryError } = await supabase
              .from('auto_idea_category')
              .select('idea_id')
              .in('category_name', filters.idea_categories);

            if (categoryError) {
              console.error('Error fetching category idea IDs:', categoryError);
              throw new Error('Failed to filter by categories');
            }

            if (categoryData && categoryData.length > 0) {
              categoryIdeaIds = [...new Set(categoryData.map(item => item.idea_id))];
            } else {
              // No ideas match the category filter, return empty result
              setIdeas([]);
              setHasMore(false);
              setLoading(false);
              if (!initialized) {
                setInitialized(true);
              }
              return;
            }
          }

          // Get idea IDs that match industry filters
          let industryIdeaIds: string[] | null = null;
          if (filters.idea_industries.length > 0) {
            const { data: industryData, error: industryError } = await supabase
              .from('auto_idea_industry')
              .select('idea_id')
              .in('industry_name', filters.idea_industries);

            if (industryError) {
              console.error('Error fetching industry idea IDs:', industryError);
              throw new Error('Failed to filter by industries');
            }

            if (industryData && industryData.length > 0) {
              industryIdeaIds = [...new Set(industryData.map(item => item.idea_id))];
            } else {
              // No ideas match the industry filter, return empty result
              setIdeas([]);
              setHasMore(false);
              setLoading(false);
              if (!initialized) {
                setInitialized(true);
              }
              return;
            }
          }

          // If both category and industry filters are active, find the intersection
          if (categoryIdeaIds && industryIdeaIds) {
            filteredIdeaIds = categoryIdeaIds.filter(id => industryIdeaIds!.includes(id));
            
            // If intersection is empty, return empty result
            if (filteredIdeaIds.length === 0) {
              setIdeas([]);
              setHasMore(false);
              setLoading(false);
              if (!initialized) {
                setInitialized(true);
              }
              return;
            }
          } else {
            // Use whichever filter is active
            filteredIdeaIds = categoryIdeaIds || industryIdeaIds;
          }
        }

        // Now fetch the ideas with all filters applied
        const { data, error: fetchError } = await buildQuery(page, filters, filteredIdeaIds);

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          if (reset) {
            setIdeas(data);
          } else {
            setIdeas((prev) => [...prev, ...data]);
          }

          setHasMore(data.length === ITEMS_PER_PAGE);
          setCurrentPage(page);
        }
      } catch (err) {
        console.error('Error fetching ideas:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch ideas');
      } finally {
        setLoading(false);
        if (!initialized) {
          setInitialized(true);
        }
      }
    },
    [buildQuery, filters, loading, initialized],
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore && initialized) {
      fetchIdeas(currentPage + 1, false);
    }
  }, [fetchIdeas, currentPage, loading, hasMore, initialized]);

  const applyFilters = useCallback((newFilters: IdeaFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
    setIdeas([]);
    setHasMore(true);
    setInitialized(false); // Reset initialization for new filter
  }, []);

  const resetFilters = useCallback(() => {
    const defaultFilters: IdeaFilters = {
      min_score: 0,
      max_score: 100,
      is_premium: null,
      status: [],
      search_query: '',
      idea_categories: [],
      idea_industries: [],
      license_names: [],
    };
    applyFilters(defaultFilters);
  }, [applyFilters]);

  // Initial fetch - only run once on mount
  useEffect(() => {
    if (!initialized) {
      fetchIdeas(0, true);
    }
  }, [filters, initialized, fetchIdeas]);

  return {
    ideas,
    loading,
    hasMore,
    error,
    filters,
    initialized,
    loadMore,
    applyFilters,
    resetFilters,
    refetch: () => fetchIdeas(0, true),
  };
};

// Convert Idea to IdeaData for compatibility with existing components
export const convertIdeaToIdeaData = (idea: Idea): IdeaData => {
  // Extract market analysis from analysis_results
  const marketAnalysis = idea.analysis_results?.find(
    (ar) =>
      ar.analysis_type?.slug === 'market-analysis' ||
      ar.title.toLowerCase().includes('market'),
  );

  // Extract monetization strategy from analysis_results
  const monetizationAnalysis = idea.analysis_results?.find(
    (ar) =>
      ar.analysis_type?.slug === 'monetization-strategy' ||
      ar.title.toLowerCase().includes('monetization') ||
      ar.title.toLowerCase().includes('revenue'),
  );

  // Extract competitive analysis from analysis_results
  const competitiveAnalysis = idea.analysis_results?.find(
    (ar) =>
      ar.analysis_type?.slug === 'competitive-analysis' ||
      ar.title.toLowerCase().includes('competitive') ||
      ar.title.toLowerCase().includes('competition'),
  );

  // Extract risk analysis from analysis_results
  const riskAnalysis = idea.analysis_results?.find(
    (ar) =>
      ar.analysis_type?.slug === 'risk-analysis' ||
      ar.title.toLowerCase().includes('risk'),
  );

  // Safely extract values from analysis_payload
  const marketSize =
    typeof marketAnalysis?.analysis_payload?.market_size === 'string'
      ? marketAnalysis.analysis_payload.market_size
      : '$1.2B (Estimated)';

  const targetAudience =
    typeof marketAnalysis?.analysis_payload?.target_audience === 'string'
      ? marketAnalysis.analysis_payload.target_audience
      : 'Developers, Tech Companies';

  const monetizationStrategies = Array.isArray(
    monetizationAnalysis?.analysis_payload?.strategies,
  )
    ? monetizationAnalysis.analysis_payload.strategies.join(', ')
    : 'SaaS platform, Enterprise licensing';

  const competitiveAdvantages = Array.isArray(
    competitiveAnalysis?.analysis_payload?.advantages,
  )
    ? competitiveAnalysis.analysis_payload.advantages.join(', ')
    : `Open source foundation with ${
        idea.repository?.stargazers_count || 0
      } stars`;

  const risks = Array.isArray(riskAnalysis?.analysis_payload?.risks)
    ? riskAnalysis.analysis_payload.risks
    : [
        'Open source competition',
        'Technology adoption challenges',
        'Market saturation',
      ];

  // Extract categories from the idea's categories JSON field
  let categories: string[] = [];
  if (idea.categories) {
    try {
      if (Array.isArray(idea.categories)) {
        categories = idea.categories;
      } else if (typeof idea.categories === 'string') {
        categories = JSON.parse(idea.categories);
      }
    } catch (e) {
      console.warn('Failed to parse idea categories:', e);
      categories = idea.repository?.topics || ['Open Source'];
    }
  } else {
    categories = idea.repository?.topics || ['Open Source'];
  }

  // Extract industries from the idea's industries JSON field
  let industries: string[] = [];
  if (idea.industries) {
    try {
      if (Array.isArray(idea.industries)) {
        industries = idea.industries;
      } else if (typeof idea.industries === 'string') {
        industries = JSON.parse(idea.industries);
      }
    } catch (e) {
      console.warn('Failed to parse idea industries:', e);
      industries = [];
    }
  }

  // Extract tagline from the idea's overview JSON field
  let tagline = '';
  if (idea.overview) {
    try {
      if (typeof idea.overview === 'object' && idea.overview.tagline) {
        tagline = idea.overview.tagline;
      } else if (typeof idea.overview === 'string') {
        const overviewObj = JSON.parse(idea.overview);
        tagline = overviewObj.tagline || '';
      }
    } catch (e) {
      console.warn('Failed to parse idea overview:', e);
      tagline = '';
    }
  }

  // Fallback to repository description if no tagline found
  if (!tagline) {
    tagline = idea.repository?.description || 'No description available';
  }

  // Determine if repository is new (created within last 30 days)
  const isNew = idea.repository?.created_at_github
    ? new Date(idea.repository.created_at_github) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    : false;

  // Determine if repository is trending (1000+ stars and recent activity within 7 days)
  const isTrending = idea.repository
    ? idea.repository.stargazers_count >= 1000 &&
      idea.repository.last_commit_at &&
      new Date(idea.repository.last_commit_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    : false;

  // Determine if repository is community pick (500+ stars and high engagement ratio)
  const communityPick = idea.repository
    ? idea.repository.stargazers_count >= 500 &&
      (idea.repository.forks_count + idea.repository.watchers_count) / 
      Math.max(idea.repository.stargazers_count, 1) > 0.1
    : false;

  return {
    id: idea.id,
    title: idea.title,
    tagline: tagline, // Now using the idea's tagline instead of repository description
    description:
      tagline || 'No detailed description available for this idea.',
    ossProject: idea.repository?.full_name || 'Unknown Repository',
    categories,
    industries,
    opportunityScore: idea.overall_teardown_score || 0,
    license: idea.repository?.license_name || 'Unknown',
    marketSize,
    targetAudience,
    monetizationStrategy: monetizationStrategies,
    techStack: idea.repository?.languages
      ? Object.keys(idea.repository.languages)
      : ['JavaScript', 'TypeScript'],
    competitiveAdvantage: competitiveAdvantages,
    risks,
    isSaved: false,
    isNew,
    isTrending,
    communityPick,
    isFromDatabase: true, // These ideas come from the ideas table
    generatedAt: idea.generated_at,
    repositoryStargazersCount: idea.repository?.stargazers_count || 0,
  };
};