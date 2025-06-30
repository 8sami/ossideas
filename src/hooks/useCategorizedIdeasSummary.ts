import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface CategorySummary {
  category_name: string;
  idea_count: number;
  category_id: number | null;
  description: string | null;
  slug: string | null;
  market_size: string | null;
  growth_rate: number | null;
  avg_business_score: number | null;
  top_repository_id: string | null;
}

export const useCategorizedIdeasSummary = () => {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('categorized_ideas_summary')
        .select('*')
        .order('idea_count', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categorized ideas summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};