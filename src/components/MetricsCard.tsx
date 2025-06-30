import React, { useState } from 'react';
import { TrendingUp, BarChart2, Users, RefreshCw, DollarSign } from 'lucide-react';
import { AnalysisResult, MetricsData, Metric } from './AnalysisResults';

interface MetricsCardProps {
  analysis: AnalysisResult;
}

const MetricsCard: React.FC<MetricsCardProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'acquisition' | 'activation' | 'retention' | 'revenue'>('acquisition');

  // Parse the analysis payload if it's a string
  const getAnalysisData = (): MetricsData => {
    if (typeof analysis.analysis_payload === 'string') {
      try {
        return JSON.parse(analysis.analysis_payload);
      } catch (e) {
        console.error('Error parsing metrics data:', e);
        return {
          acquisitionMetrics: [],
          activationMetrics: [],
          retentionMetrics: [],
          revenueMetrics: []
        };
      }
    }
    return analysis.analysis_payload as MetricsData;
  };

  const data = getAnalysisData();

  const getImportanceColor = (importance: string) => {
    switch (importance) {
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

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'acquisition':
        return <Users className="h-4 w-4" />;
      case 'activation':
        return <BarChart2 className="h-4 w-4" />;
      case 'retention':
        return <RefreshCw className="h-4 w-4" />;
      case 'revenue':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  const getActiveMetrics = () => {
    switch (activeTab) {
      case 'acquisition':
        return data.acquisitionMetrics;
      case 'activation':
        return data.activationMetrics;
      case 'retention':
        return data.retentionMetrics;
      case 'revenue':
        return data.revenueMetrics;
      default:
        return [];
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'acquisition':
        return 'Acquisition';
      case 'activation':
        return 'Activation';
      case 'retention':
        return 'Retention';
      case 'revenue':
        return 'Revenue';
      default:
        return tab.charAt(0).toUpperCase() + tab.slice(1);
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Success Metrics & KPIs</h3>
            <p className="text-sm text-gray-600">
              Key metrics to track across the customer journey
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {['acquisition', 'activation', 'retention', 'revenue'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${
              activeTab === tab
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              {getTabIcon(tab)}
              <span>{getTabLabel(tab)}</span>
              <span className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded-full">
                {data[`${tab}Metrics` as keyof MetricsData]?.length || 0}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Metrics List */}
      <div className="space-y-4">
        {getActiveMetrics().map((metric, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{metric.name}</h4>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getImportanceColor(metric.importance)}`}>
                    {metric.importance}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Target:</span> {metric.target}
                </p>
              </div>
            </div>
          </div>
        ))}

        {getActiveMetrics().length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No {activeTab} metrics defined
          </div>
        )}
      </div>

      {/* Metrics Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['acquisition', 'activation', 'retention', 'revenue'].map((category) => {
            const metrics = data[`${category}Metrics` as keyof MetricsData] as Metric[];
            const highPriorityCount = metrics.filter(m => m.importance === 'high').length;
            
            return (
              <div key={category} className="text-center">
                <div className="text-sm text-gray-500">{getTabLabel(category)}</div>
                <div className="text-2xl font-bold text-gray-900">{metrics.length}</div>
                <div className="text-xs text-gray-500">
                  {highPriorityCount} high priority
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;