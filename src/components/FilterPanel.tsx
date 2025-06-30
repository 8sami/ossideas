import React from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { FilterOptions } from '../types';
import { useCategories } from '../hooks/useCategories';
import { useLicenses } from '../hooks/useLicenses';
import { useIndustries } from '../hooks/useIndustries';

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  isOpen: boolean;
  onClose: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange, isOpen, onClose }) => {
  const { categories, loading: categoriesLoading } = useCategories();
  const { licenses, loading: licensesLoading } = useLicenses();
  const { industries, loading: industriesLoading } = useIndustries();

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFilterChange({ ...filters, categories: newCategories });
  };

  const handleIndustryToggle = (industry: string) => {
    const newIndustries = filters.industries.includes(industry)
      ? filters.industries.filter(i => i !== industry)
      : [...filters.industries, industry];
    
    onFilterChange({ ...filters, industries: newIndustries });
  };

  const handleLicenseToggle = (license: string) => {
    const newLicenses = filters.license.includes(license)
      ? filters.license.filter(l => l !== license)
      : [...filters.license, license];
    
    onFilterChange({ ...filters, license: newLicenses });
  };

  const clearAllFilters = () => {
    onFilterChange({
      categories: [],
      industries: [],
      opportunityScore: [0, 100],
      license: [],
      isNew: false,
      isTrending: false,
      communityPick: false
    });
  };

  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.industries.length > 0 ||
    filters.license.length > 0 ||
    filters.isNew ||
    filters.isTrending ||
    filters.communityPick ||
    filters.opportunityScore[0] > 0 ||
    filters.opportunityScore[1] < 100;

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 left-16 right-0 bg-white border-b border-gray-200 shadow-lg z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="mx-auto px-4 sm:px-6 py-4">
        {/* Header Section */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-lg flex-shrink-0">
              <Sliders className="h-4 w-4 text-orange-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
              <div className="flex items-center space-x-2 mt-0.5">
                <div className="flex items-center space-x-1">
                  <Check className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Live</span>
                </div>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 truncate">
                  {hasActiveFilters ? `${filters.categories.length + filters.industries.length + filters.license.length + (filters.isNew ? 1 : 0) + (filters.isTrending ? 1 : 0) + (filters.communityPick ? 1 : 0)} filters active` : 'No filters applied'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-9 gap-4 lg:gap-8">
            {/* Categories */}
            <div className="md:col-span-1 lg:col-span-3">
              <div className="border border-orange-200 rounded-xl p-4 bg-white">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">📂</span>
                  Categories & Topics
                </h4>
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {categories.map((category) => (
                      <label key={category.category_name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors duration-150">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.categories.includes(category.category_name)}
                            onChange={() => handleCategoryToggle(category.category_name)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 w-4 h-4 mr-3 flex-shrink-0"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{category.category_name}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {category.idea_count}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Industries */}
            <div className="md:col-span-1 lg:col-span-3">
              <div className="border border-orange-200 rounded-xl p-4 bg-white">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">🏭</span>
                  Industries
                </h4>
                {industriesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {industries.map((industry) => (
                      <label key={industry.industry_name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors duration-150">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.industries.includes(industry.industry_name)}
                            onChange={() => handleIndustryToggle(industry.industry_name)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 w-4 h-4 mr-3 flex-shrink-0"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{industry.industry_name}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {industry.idea_count}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Opportunity Score & License */}
            <div className="md:col-span-2 lg:col-span-3 space-y-4">
              {/* Opportunity Score */}
              <div className="border border-orange-200 rounded-xl p-4 bg-white">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">⚡</span>
                  Opportunity Score
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded">{filters.opportunityScore[0]}</span>
                    <span className="text-xs text-gray-500">to</span>
                    <span className="text-sm font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded">{filters.opportunityScore[1]}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.opportunityScore[0]}
                      onChange={(e) => onFilterChange({
                        ...filters,
                        opportunityScore: [parseInt(e.target.value), filters.opportunityScore[1]]
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb-orange"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.opportunityScore[1]}
                      onChange={(e) => onFilterChange({
                        ...filters,
                        opportunityScore: [filters.opportunityScore[0], parseInt(e.target.value)]
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb-orange"
                    />
                  </div>
                </div>
              </div>

              {/* License */}
              <div className="border border-orange-200 rounded-xl p-4 bg-white">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="text-lg mr-2">📄</span>
                  License Type
                </h4>
                {licensesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {licenses.slice(0, 10).map((license) => (
                      <label key={license.license_name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors duration-150">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.license.includes(license.license_name)}
                            onChange={() => handleLicenseToggle(license.license_name)}
                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2 w-4 h-4 mr-2 flex-shrink-0"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{license.license_name}</span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {license.idea_count}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;