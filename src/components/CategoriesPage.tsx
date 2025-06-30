import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Grid3X3, 
  Search, 
  BarChart2, 
  Zap, 
  X
} from 'lucide-react';
import { useCategorizedIdeasSummary } from '../hooks/useCategorizedIdeasSummary';

const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { categories, loading, error } = useCategorizedIdeasSummary();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'ideas' | 'name'>('ideas');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

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
    }
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });

  const handleSortChange = (criteria: 'ideas' | 'name') => {
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

        {/* Search and Sorting */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSortChange('ideas')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  sortBy === 'ideas'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                <BarChart2 className="h-4 w-4" />
                <span>Sort by Ideas {sortBy === 'ideas' && (sortDirection === 'desc' ? '↓' : '↑')}</span>
              </button>
              <button
                onClick={() => handleSortChange('name')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  sortBy === 'name'
                    ? 'bg-orange-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}>
                <Grid3X3 className="h-4 w-4" />
                <span>Sort by Name {sortBy === 'name' && (sortDirection === 'desc' ? '↓' : '↑')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {category.description || `Explore startup opportunities in ${category.category_name} technology and solutions.`}
                  </p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;