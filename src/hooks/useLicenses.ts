import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface License {
  license_name: string;
  idea_count: number;
}

export const useLicenses = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLicenses = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get unique licenses from repositories that have associated ideas
      const { data, error: fetchError } = await supabase
        .from('repositories')
        .select(`
          license_name,
          ideas!inner(id)
        `)
        .not('license_name', 'is', null)
        .not('license_name', 'eq', '');

      if (fetchError) {
        throw fetchError;
      }

      // Count ideas per license
      const licenseMap = new Map<string, number>();
      
      data?.forEach((repo: any) => {
        const licenseName = repo.license_name;
        const ideaCount = repo.ideas?.length || 0;
        
        if (licenseName && ideaCount > 0) {
          licenseMap.set(licenseName, (licenseMap.get(licenseName) || 0) + ideaCount);
        }
      });

      // Convert to array and sort by count
      const licenseArray = Array.from(licenseMap.entries())
        .map(([license_name, idea_count]) => ({ license_name, idea_count }))
        .sort((a, b) => b.idea_count - a.idea_count);

      setLicenses(licenseArray);
    } catch (err) {
      console.error('Error fetching licenses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch licenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  return {
    licenses,
    loading,
    error,
    refetch: fetchLicenses,
  };
};