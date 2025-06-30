import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, Lightbulb } from 'lucide-react';
import { AnalysisResult, RiskAnalysisData } from './AnalysisResults';

interface RiskAnalysisCardProps {
  analysis: AnalysisResult;
}

const RiskAnalysisCard: React.FC<RiskAnalysisCardProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'risks' | 'critical' | 'contingency'>('risks');

  // Parse the analysis payload if it's a string
  const getAnalysisData = (): RiskAnalysisData => {
    if (typeof analysis.analysis_payload === 'string') {
      try {
        return JSON.parse(analysis.analysis_payload);
      } catch (e) {
        console.error('Error parsing risk analysis data:', e);
        return {
          risks: [],
          criticalRisks: [],
          contingencyPlans: []
        };
      }
    }
    return analysis.analysis_payload as RiskAnalysisData;
  };

  const data = getAnalysisData();

  const getImpactColor = (impact: string) => {
    switch (impact) {
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

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
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

  const getRiskSeverity = (impact: string, probability: string) => {
    if (impact === 'high' && probability === 'high') return 'Critical';
    if (impact === 'high' && probability === 'medium') return 'Severe';
    if (impact === 'medium' && probability === 'high') return 'Severe';
    if (impact === 'high' && probability === 'low') return 'Moderate';
    if (impact === 'medium' && probability === 'medium') return 'Moderate';
    if (impact === 'low' && probability === 'high') return 'Moderate';
    if (impact === 'medium' && probability === 'low') return 'Low';
    if (impact === 'low' && probability === 'medium') return 'Low';
    if (impact === 'low' && probability === 'low') return 'Minimal';
    return 'Unknown';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Severe':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Minimal':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Risks & Mitigations</h3>
            <p className="text-sm text-gray-600">
              {data.risks.length} identified risks, {data.criticalRisks.length} critical
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('risks')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'risks'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>All Risks ({data.risks.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('critical')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'critical'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>Critical Risks ({data.criticalRisks.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('contingency')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'contingency'
              ? 'border-red-500 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4" />
            <span>Contingency Plans ({data.contingencyPlans.length})</span>
          </div>
        </button>
      </div>

      {/* All Risks Tab */}
      {activeTab === 'risks' && (
        <div className="space-y-6">
          {data.risks.map((risk, index) => {
            const severity = getRiskSeverity(risk.impact, risk.probability);
            
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h4 className="font-semibold text-gray-900">{risk.description}</h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(severity)}`}>
                        {severity}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getImpactColor(risk.impact)}`}>
                        Impact: {risk.impact}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getProbabilityColor(risk.probability)}`}>
                        Probability: {risk.probability}
                      </span>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-blue-600" />
                        <h5 className="text-sm font-medium text-gray-900">Mitigation Strategy</h5>
                      </div>
                      <p className="text-sm text-gray-700 pl-6">{risk.mitigation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Risk Matrix */}
          {data.risks.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Risk Matrix</h4>
              <div className="relative overflow-hidden">
                <div className="grid grid-cols-4 gap-1">
                  {/* Header */}
                  <div className="bg-gray-100 p-2 text-center font-medium text-gray-700 rounded-tl-lg">
                    Impact ↓ Probability →
                  </div>
                  <div className="bg-blue-100 p-2 text-center font-medium text-blue-700">
                    Low
                  </div>
                  <div className="bg-orange-100 p-2 text-center font-medium text-orange-700">
                    Medium
                  </div>
                  <div className="bg-red-100 p-2 text-center font-medium text-red-700 rounded-tr-lg">
                    High
                  </div>
                  
                  {/* High Impact Row */}
                  <div className="bg-red-100 p-2 text-center font-medium text-red-700">
                    High
                  </div>
                  <div className="bg-yellow-50 p-2 text-xs text-center border border-gray-200">
                    {data.risks.filter(r => r.impact === 'high' && r.probability === 'low').length > 0 ? (
                      <span className="font-bold">{data.risks.filter(r => r.impact === 'high' && r.probability === 'low').length}</span>
                    ) : '-'}
                  </div>
                  <div className="bg-orange-50 p-2 text-xs text-center border border-gray-200">
                    {data.risks.filter(r => r.impact === 'high' && r.probability === 'medium').length > 0 ? (
                      <span className="font-bold">{data.risks.filter(r => r.impact === 'high' && r.probability === 'medium').length}</span>
                    ) : '-'}
                  </div>
                  <div className="bg-red-50 p-2 text-xs text-center border border-gray-200">
                    {data.risks.filter(r => r.impact === 'high' && r.probability === 'high').length > 0 ? (
                      <span className="font-bold">{data.risks.filter(r => r.impact === 'high' && r.probability === 'high').length}</span>
                    ) : '-'}
                  </div>
                  
                  {/* Medium Impact Row */}
                  <div className="bg-orange-100 p-2 text-center font-medium text-orange-700">
                    Medium
                  </div>
                  <div className="bg-green-50 p-2 text-xs text-center border border-gray-200">
                    {data.risks.filter(r => r.impact === 'medium' && r.probability === 'low').length > 0 ? (
                      <span className="font-bold">{data.risks.filter(r => r.impact === 'medium' && r.probability === 'low').length}</span>
                    ) : '-'}
                  </div>
                  <div className="bg-yellow-50 p-2 text-xs text-center border border-gray-200">
                    {data.risks.filter(r => r.impact === 'medium' && r.probability === 'medium').length > 0 ? (
                      <span className="font-bold">{data.risks.filter(r => r.impact === 'medium' && r.probability === 'medium').length}</span>
                    ) : '-'}
                  </div>
                  <div className="bg-orange-50 p-2 text-xs text-center border border-gray-200">
                    {data.risks.filter(r => r.impact === 'medium' && r.probability === 'high').length > 0 ? (
                      <span className="font-bold">{data.risks.filter(r => r.impact === 'medium' && r.probability === 'high').length}</span>
                    ) : '-'}
                  </div>
                  
                  {/* Low Impact Row */}
                  <div className="bg-blue-100 p-2 text-center font-medium text-blue-700 rounded-bl-lg">
                    Low
                  </div>
                  <div className="bg-green-50 p-2 text-xs text-center border border-gray-200 rounded-bl-lg">
                    {data.risks.filter(r => r.impact === 'low' && r.probability === 'low').length > 0 ? (
                      <span className="font-bold">{data.risks.filter(r => r.impact === 'low' && r.probability === 'low').length}</span>
                    ) : '-'}
                  </div>
                  <div className="bg-green-50 p-2 text-xs text-center border border-gray-200">
                    {data.risks.filter(r => r.impact === 'low' && r.probability === 'medium').length > 0 ? (
                      <span className="font-bold">{data.risks.filter(r => r.impact === 'low' && r.probability === 'medium').length}</span>
                    ) : '-'}
                  </div>
                  <div className="bg-yellow-50 p-2 text-xs text-center border border-gray-200 rounded-br-lg">
                    {data.risks.filter(r => r.impact === 'low' && r.probability === 'high').length > 0 ? (
                      <span className="font-bold">{data.risks.filter(r => r.impact === 'low' && r.probability === 'high').length}</span>
                    ) : '-'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Critical Risks Tab */}
      {activeTab === 'critical' && (
        <div className="space-y-4">
          {data.criticalRisks.length > 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-1">Critical Risks Requiring Immediate Attention</h3>
                  <p className="text-sm text-red-700">
                    These risks have both high impact and high probability and should be addressed as a priority.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800 mb-1">No Critical Risks Identified</h3>
                  <p className="text-sm text-yellow-700">
                    While there are risks to consider, none are currently classified as critical (high impact + high probability).
                  </p>
                </div>
              </div>
            </div>
          )}

          <ul className="space-y-3">
            {data.criticalRisks.map((risk, index) => (
              <li key={index} className="bg-white border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-gray-800">{risk}</p>
                    
                    {/* Find the corresponding full risk to show mitigation */}
                    {data.risks.find(r => r.description.includes(risk.substring(0, 20)))?.mitigation && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                          <h5 className="text-xs font-medium text-gray-700">Recommended Mitigation</h5>
                        </div>
                        <p className="text-xs text-gray-600 pl-6">
                          {data.risks.find(r => r.description.includes(risk.substring(0, 20)))?.mitigation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contingency Plans Tab */}
      {activeTab === 'contingency' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-800 mb-1">Contingency Planning</h3>
                <p className="text-sm text-blue-700">
                  These plans outline what to do if key risks materialize, including pivot options and exit strategies.
                </p>
              </div>
            </div>
          </div>

          <ul className="space-y-4">
            {data.contingencyPlans.map((plan, index) => (
              <li key={index} className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 rounded-full p-1 mt-0.5 flex-shrink-0">
                    <span className="font-bold text-blue-700 text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-800">{plan}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RiskAnalysisCard;