import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Category {
  category_name: string;
  idea_count: number;
  sample_idea_id: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchCategories = async () => {
    if (initialized) return; // Don't fetch if already initialized
    
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('auto_categories')
        .select('*')
        .order('idea_count', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setCategories(data || []);
      setInitialized(true);
    } catch (err) {
      console.error('Error fetching categories:', err);
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
    refetch: () => {
      setInitialized(false);
      fetchCategories();
    },
  };
};