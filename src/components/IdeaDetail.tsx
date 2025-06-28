    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile optimized */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 transition-colors min-h-[44px]">
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Back to Ideas</span>
              <span className="sm:hidden">Back</span>
            </button>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-colors min-h-[44px] ${
                  isSaving
                    ? 'bg-orange-500 text-white opacity-50 cursor-not-allowed'
                    : isSaved
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                <span className="text-sm sm:text-base">
                  {isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                </span>
              </button>

              <button
                onClick={handleShareClick}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors min-h-[44px]">
                <Share2 className="h-4 w-4" />
                <span className="text-sm sm:text-base">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>