import React, { useState } from 'react';
import { Zap, CheckCircle } from 'lucide-react';
import { AnalysisResult, MVPFeaturesData } from './AnalysisResults';

interface MVPFeaturesCardProps {
  analysis: AnalysisResult;
}

const MVPFeaturesCard: React.FC<MVPFeaturesCardProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'future'>('current');

  // Parse the analysis payload if it's a string
  const getAnalysisData = (): MVPFeaturesData => {
    if (typeof analysis.analysis_payload === 'string') {
      try {
        return JSON.parse(analysis.analysis_payload);
      } catch (e) {
        console.error('Error parsing MVP features data:', e);
        return {
          features: [],
          mvpScope: 'Error parsing data',
          futureFeatures: []
        };
      }
    }
    return analysis.analysis_payload as MVPFeaturesData;
  };

  const data = getAnalysisData();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Zap className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">MVP Core Features</h3>
            <p className="text-sm text-gray-600">
              Minimum viable product features to validate the idea
            </p>
          </div>
        </div>
      </div>

      {/* MVP Scope */}
      <div className="mb-6">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">MVP Scope</h4>
          <p className="text-gray-700">{data.mvpScope}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'current'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Core Features ({data.features.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('future')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'future'
              ? 'border-yellow-500 text-yellow-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Future Features ({data.futureFeatures.length})</span>
          </div>
        </button>
      </div>

      {/* Core Features Tab */}
      {activeTab === 'current' && (
        <div className="space-y-4">
          {data.features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{feature.name}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(feature.priority)}`}>
                      {feature.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{feature.description}</p>
                  
                  <div className="bg-white rounded p-3 border border-gray-200">
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">User Value</div>
                    <p className="text-sm text-gray-700">{feature.userValue}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Future Features Tab */}
      {activeTab === 'future' && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Features for Future Development</h4>
          <ul className="space-y-2">
            {data.futureFeatures.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-medium text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">{feature}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MVPFeaturesCard;