import React from 'react';
import { DollarSign } from 'lucide-react';
import { AnalysisResult, MonetizationStrategyData } from './AnalysisResults';

interface MonetizationStrategyCardProps {
  analysis: AnalysisResult;
}

const MonetizationStrategyCard: React.FC<MonetizationStrategyCardProps> = ({ analysis }) => {
  // Parse the analysis payload if it's a string
  const getAnalysisData = (): MonetizationStrategyData => {
    if (typeof analysis.analysis_payload === 'string') {
      try {
        return JSON.parse(analysis.analysis_payload);
      } catch (e) {
        console.error('Error parsing monetization strategy data:', e);
        return {
          pricingModel: 'Unknown',
          pricingTiers: [],
          valueMetric: 'Unknown',
          revenueStreams: []
        };
      }
    }
    return analysis.analysis_payload as MonetizationStrategyData;
  };

  const data = getAnalysisData();

  const getPricingModelIcon = (model: string) => {
    switch (model) {
      case 'Subscription':
        return '🔄';
      case 'Freemium':
        return '🆓';
      case 'Usage-Based':
        return '📊';
      case 'One-Time':
        return '💰';
      case 'Open Core':
        return '🔓';
      case 'Marketplace':
        return '🏪';
      default:
        return '💲';
    }
  };

  const getPricingTierColor = (tierName: string) => {
    const name = tierName.toLowerCase();
    if (name.includes('free')) return 'bg-gray-100 border-gray-200 text-gray-800';
    if (name.includes('basic')) return 'bg-blue-50 border-blue-200 text-blue-800';
    if (name.includes('pro')) return 'bg-orange-50 border-orange-200 text-orange-800';
    if (name.includes('team')) return 'bg-purple-50 border-purple-200 text-purple-800';
    if (name.includes('enterprise')) return 'bg-indigo-50 border-indigo-200 text-indigo-800';
    return 'bg-green-50 border-green-200 text-green-800';
  };

  return (
    <div className="bg-white overflow-hidden">
      <div>
        {/* Pricing Model */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">{getPricingModelIcon(data.pricingModel)}</span>
            <h4 className="text-md font-semibold text-gray-900">Pricing Model</h4>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{data.pricingModel}</span>
              <span className="text-sm text-gray-600">Value Metric: {data.valueMetric}</span>
            </div>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">🏷️</span>
            <h4 className="text-md font-semibold text-gray-900">Pricing Tiers</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.pricingTiers.map((tier, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-4 ${getPricingTierColor(tier.name)}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-bold">{tier.name}</h5>
                  <span className="font-semibold">{tier.price}</span>
                </div>
                <ul className="space-y-1">
                  {tier.keyFeatures.map((feature, featureIndex) => (
                    <li key={featureIndex} className="text-sm flex items-start">
                      <span className="text-green-600 mr-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Revenue Streams */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-xl">💸</span>
            <h4 className="text-md font-semibold text-gray-900">Additional Revenue Streams</h4>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-2">
              {data.revenueStreams.map((stream, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  <span className="text-gray-700">{stream}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonetizationStrategyCard;