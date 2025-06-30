import React, { useState } from 'react';
import { Target, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { AnalysisResult, CompetitiveAnalysisData } from './AnalysisResults';

interface CompetitiveAnalysisCardProps {
  analysis: AnalysisResult;
}

const CompetitiveAnalysisCard: React.FC<CompetitiveAnalysisCardProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'direct' | 'indirect' | 'advantage'>('direct');

  // Parse the analysis payload if it's a string
  const getAnalysisData = (): CompetitiveAnalysisData => {
    if (typeof analysis.analysis_payload === 'string') {
      try {
        return JSON.parse(analysis.analysis_payload);
      } catch (e) {
        console.error('Error parsing competitive analysis data:', e);
        return {
          directCompetitors: [],
          indirectCompetitors: [],
          competitiveAdvantage: 'Error parsing data'
        };
      }
    }
    return analysis.analysis_payload as CompetitiveAnalysisData;
  };

  const data = getAnalysisData();

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      {/* Competitive Advantage */}
      <div className="mb-6">
        <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-teal-600" />
            Competitive Advantage
          </h4>
          <p className="text-gray-700">{data.competitiveAdvantage}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('direct')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'direct'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Direct Competitors ({data.directCompetitors.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('indirect')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'indirect'
              ? 'border-teal-500 text-teal-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Indirect Alternatives ({data.indirectCompetitors.length})</span>
          </div>
        </button>
      </div>

      {/* Direct Competitors Tab */}
      {activeTab === 'direct' && (
        <div className="space-y-6">
          {data.directCompetitors.map((competitor, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
                    <span className="text-sm text-gray-500">
                      Market Share: {competitor.marketShare}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                        Strengths
                      </div>
                      <ul className="space-y-1">
                        {competitor.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-green-600 mr-1">+</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Weaknesses */}
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                        Weaknesses
                      </div>
                      <ul className="space-y-1">
                        {competitor.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start">
                            <span className="text-red-600 mr-1">-</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Indirect Competitors Tab */}
      {activeTab === 'indirect' && (
        <div className="space-y-4">
          {data.indirectCompetitors.map((competitor, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getThreatColor(competitor.threat)}`}>
                      {competitor.threat} threat
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{competitor.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompetitiveAnalysisCard;