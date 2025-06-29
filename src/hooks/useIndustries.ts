import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Industry {
  industry_name: string;
  idea_count: number;
}

export const useIndustries = () => {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIndustries = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('auto_industries')
        .select('*')
        .order('idea_count', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setIndustries(data || []);
    } catch (err) {
      console.error('Error fetching industries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch industries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndustries();
  }, []);

  return {
    industries,
    loading,
    error,
    refetch: fetchIndustries,
  };
};