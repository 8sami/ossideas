import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FilterOptions } from '../types';

export const useFilterOptions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    industries: [],
    opportunityScore: [0, 100],
    license: [],
    isNew: false,
    isTrending: false,
    communityPick: false,
  });

  // Parse URL query parameters on mount and when location changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    
    // Extract category from URL if present
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        categories: [decodeURIComponent(categoryParam)]
      }));
    }
    
    // You can add more parameters here as needed
    // For example:
    // const industryParam = searchParams.get('industry');
    // if (industryParam) {
    //   setFilters(prev => ({
    //     ...prev,
    //     industries: [decodeURIComponent(industryParam)]
    //   }));
    // }
    
  }, [location.search]);

  // Update URL when filters change
  const updateFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    // Update URL query parameters
    const searchParams = new URLSearchParams();
    
    if (newFilters.categories.length > 0) {
      newFilters.categories.forEach(category => {
        searchParams.append('category', category);
      });
    }
    
    if (newFilters.industries.length > 0) {
      newFilters.industries.forEach(industry => {
        searchParams.append('industry', industry);
      });
    }
    
    if (newFilters.license.length > 0) {
      newFilters.license.forEach(license => {
        searchParams.append('license', license);
      });
    }
    
    if (newFilters.isNew) {
      searchParams.set('isNew', 'true');
    }
    
    if (newFilters.isTrending) {
      searchParams.set('isTrending', 'true');
    }
    
    if (newFilters.communityPick) {
      searchParams.set('communityPick', 'true');
    }
    
    if (newFilters.opportunityScore[0] > 0 || newFilters.opportunityScore[1] < 100) {
      searchParams.set('minScore', newFilters.opportunityScore[0].toString());
      searchParams.set('maxScore', newFilters.opportunityScore[1].toString());
    }
    
    // Update URL without reloading the page
    const newSearch = searchParams.toString();
    navigate({
      pathname: location.pathname,
      search: newSearch ? `?${newSearch}` : ''
    }, { replace: true });
  };

  return {
    filters,
    setFilters: updateFilters
  };
};