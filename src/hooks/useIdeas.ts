import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { IdeaData } from '../types';

export interface Idea {
  id: string;
  repository_id: string;
  title: string;
  summary: string | null;
  overall_teardown_score: number | null;
  likes_count: number;
  is_premium: boolean;
  status: string;
  generated_at: string;
  last_updated_at: string;
  generated_by_ai_model: string | null;
  repository?: {
    id: string;
    full_name: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
    topics: string[] | null;
    license_name: string | null;
    readme_content: string | null;
    languages: Record<string, number>;
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
  repository_topics: string[];
}

const ITEMS_PER_PAGE = 12;

export const useIdeas = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState<IdeaFilters>({
    min_score: 0,
    max_score: 100,
    is_premium: null,
    status: [],
    search_query: '',
    repository_topics: [],
  });

  const buildQuery = useCallback(
    (page: number, currentFilters: IdeaFilters) => {
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
          topics,
          license_name,
          readme_content,
          languages
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
        .order('overall_teardown_score', { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      // Apply filters
      if (currentFilters.min_score > 0) {
        query = query.gte('overall_teardown_score', currentFilters.min_score);
      }

      if (currentFilters.max_score < 100) {
        query = query.lte('overall_teardown_score', currentFilters.max_score);
      }

      if (currentFilters.is_premium !== null) {
        query = query.eq('is_premium', currentFilters.is_premium);
      }

      if (currentFilters.status.length > 0) {
        query = query.in('status', currentFilters.status);
      }

      if (currentFilters.search_query) {
        query = query.or(
          `title.ilike.%${currentFilters.search_query}%,summary.ilike.%${currentFilters.search_query}%`,
        );
      }

      return query;
    },
    [],
  );

  const fetchIdeas = useCallback(
    async (page: number = 0, reset: boolean = false) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await buildQuery(page, filters);

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
      }
    },
    [buildQuery, filters, loading],
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchIdeas(currentPage + 1, false);
    }
  }, [fetchIdeas, currentPage, loading, hasMore]);

  const applyFilters = useCallback((newFilters: IdeaFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
    setIdeas([]);
    setHasMore(true);
  }, []);

  const resetFilters = useCallback(() => {
    const defaultFilters: IdeaFilters = {
      min_score: 0,
      max_score: 100,
      is_premium: null,
      status: [],
      search_query: '',
      repository_topics: [],
    };
    applyFilters(defaultFilters);
  }, [applyFilters]);

  // Initial fetch
  useEffect(() => {
    fetchIdeas(0, true);
  }, [filters]);

  return {
    ideas,
    loading,
    hasMore,
    error,
    filters,
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

  return {
    id: idea.id,
    title: idea.title,
    tagline: idea.summary || idea.title,
    description:
      idea.summary || 'No detailed description available for this idea.',
    ossProject: idea.repository?.full_name || 'Unknown Repository',
    categories: idea.repository?.topics || ['Open Source'],
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
    isNew: false, // Ideas are not "new" in the same sense as repositories
    isTrending: false, // Ideas are not "trending" in the same sense as repositories
    communityPick: false, // Ideas are not "community picks" in the same sense as repositories
    isFromDatabase: true, // These ideas come from the ideas table
  };
};
