import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid3X3, 
  Search, 
  TrendingUp, 
  ArrowUpRight, 
  BarChart2, 
  Zap, 
  Filter, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCategorizedIdeasSummary } from '../hooks/useCategorizedIdeasSummary';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, loading, error } = useCategorizedIdeasSummary();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'ideas' | 'name' | 'growth'>('ideas');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter categories based on search query
  const filteredCategories = categories.filter(category => 
    category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort categories based on selected criteria
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'ideas') {
      comparison = a.idea_count - b.idea_count;
    } else if (sortBy === 'name') {
      comparison = a.category_name.localeCompare(b.category_name);
    } else if (sortBy === 'growth') {
      const growthA = a.growth_rate || 0;
      const growthB = b.growth_rate || 0;
      comparison = growthA - growthB;
    }
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });

  const handleSortChange = (criteria: 'ideas' | 'name' | 'growth') => {
    if (sortBy === criteria) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(criteria);
      setSortDirection('desc');
    }
  };

  const handleCategoryClick = (category: string) => {
    // Navigate to ideas page with category filter
    navigate(`/ideas?category=${encodeURIComponent(category)}`);
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('ai') || name.includes('ml') || name.includes('machine learning')) return '🤖';
    if (name.includes('web') || name.includes('frontend')) return '🌐';
    if (name.includes('mobile') || name.includes('app')) return '📱';
    if (name.includes('data') || name.includes('analytics')) return '📊';
    if (name.includes('cloud') || name.includes('saas')) return '☁️';
    if (name.includes('security') || name.includes('crypto')) return '🔒';
    if (name.includes('dev') || name.includes('tool')) return '🛠️';
    if (name.includes('game')) return '🎮';
    if (name.includes('blockchain') || name.includes('web3')) return '⛓️';
    if (name.includes('iot') || name.includes('hardware')) return '🔌';
    return '💡';
  };

  const getGrowthRateDisplay = (rate: number | null) => {
    if (rate === null) return 'N/A';
    
    const formattedRate = rate.toFixed(1);
    if (rate > 0) {
      return (
        <span className="flex items-center text-green-600">
          <TrendingUp className="h-3 w-3 mr-1" />
          {formattedRate}%
        </span>
      );
    } else if (rate < 0) {
      return (
        <span className="flex items-center text-red-600">
          <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
          {Math.abs(parseFloat(formattedRate))}%
        </span>
      );
    } else {
      return <span className="text-gray-600">0%</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Grid3X3 className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading categories
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Grid3X3 className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Categories & Topics
            </h1>
          </div>
          <p className="text-gray-600">
            Explore startup ideas by category and discover trending topics
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center space-x-2 hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Filters</span>
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                )}
              </button>
              <div className="relative">
                <button
                  onClick={() => handleSortChange('ideas')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    sortBy === 'ideas'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                  <BarChart2 className="h-4 w-4" />
                  <span>Ideas</span>
                  {sortBy === 'ideas' && (
                    sortDirection === 'desc' ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )
                  )}
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => handleSortChange('name')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    sortBy === 'name'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                  <Grid3X3 className="h-4 w-4" />
                  <span>Name</span>
                  {sortBy === 'name' && (
                    sortDirection === 'desc' ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )
                  )}
                </button>
              </div>
              <div className="relative">
                <button
                  onClick={() => handleSortChange('growth')}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    sortBy === 'growth'
                      ? 'bg-orange-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                  <TrendingUp className="h-4 w-4" />
                  <span>Growth</span>
                  {sortBy === 'growth' && (
                    sortDirection === 'desc' ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronUp className="h-4 w-4" />
                    )
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Filters - Shown when showFilters is true */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Ideas
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="0"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb-orange"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100+</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Growth Rate
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    defaultValue="any">
                    <option value="any">Any Growth Rate</option>
                    <option value="positive">Positive Growth Only</option>
                    <option value="high">High Growth (10%+)</option>
                    <option value="very-high">Very High Growth (20%+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Market Size
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    defaultValue="any">
                    <option value="any">Any Market Size</option>
                    <option value="small">Small ($1M - $10M)</option>
                    <option value="medium">Medium ($10M - $100M)</option>
                    <option value="large">Large ($100M - $1B)</option>
                    <option value="very-large">Very Large ($1B+)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCategories.length > 0 ? (
            sortedCategories.map((category) => (
              <div
                key={category.category_name}
                onClick={() => handleCategoryClick(category.category_name)}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 cursor-pointer group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{getCategoryIcon(category.category_name)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                          {category.category_name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <BarChart2 className="h-3 w-3 mr-1" />
                          <span>{category.idea_count} ideas</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-full p-2 group-hover:bg-orange-100 transition-colors">
                      <ArrowUpRight className="h-4 w-4 text-gray-600 group-hover:text-orange-600 transition-colors" />
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {category.description || `Explore startup opportunities in ${category.category_name} technology and solutions.`}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Zap className="h-3 w-3" />
                      <span>
                        Score: {category.avg_business_score ? category.avg_business_score.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <div className="text-gray-600">
                      Growth: {getGrowthRateDisplay(category.growth_rate)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Grid3X3 className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No categories found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? `No categories matching "${searchQuery}"`
                  : 'No categories available'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Category Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Total Categories</h3>
                <div className="p-2 bg-orange-100 rounded-full">
                  <Grid3X3 className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Total Ideas</h3>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {categories.reduce((sum, cat) => sum + cat.idea_count, 0)}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Avg. Growth Rate</h3>
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(() => {
                  const categoriesWithGrowth = categories.filter(c => c.growth_rate !== null);
                  if (categoriesWithGrowth.length === 0) return 'N/A';
                  const avgGrowth = categoriesWithGrowth.reduce((sum, cat) => sum + (cat.growth_rate || 0), 0) / categoriesWithGrowth.length;
                  return `${avgGrowth.toFixed(1)}%`;
                })()}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Avg. Business Score</h3>
                <div className="p-2 bg-purple-100 rounded-full">
                  <BarChart2 className="h-4 w-4 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(() => {
                  const categoriesWithScore = categories.filter(c => c.avg_business_score !== null);
                  if (categoriesWithScore.length === 0) return 'N/A';
                  const avgScore = categoriesWithScore.reduce((sum, cat) => sum + (cat.avg_business_score || 0), 0) / categoriesWithScore.length;
                  return avgScore.toFixed(1);
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;