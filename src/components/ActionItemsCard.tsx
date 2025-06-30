import React, { useState } from 'react';
import { ListChecks, Clock, Flag, Calendar } from 'lucide-react';
import { ActionItemsData, AnalysisResult } from './AnalysisResults';

interface ActionItemsCardProps {
  analysis: AnalysisResult;
}

const ActionItemsCard: React.FC<ActionItemsCardProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'actions' | 'immediate' | 'milestones'>('actions');

  // Parse the analysis payload if it's a string
  const getAnalysisData = (): ActionItemsData => {
    if (typeof analysis.analysis_payload === 'string') {
      try {
        return JSON.parse(analysis.analysis_payload);
      } catch (e) {
        console.error('Error parsing action items data:', e);
        return {
          actionItems: [],
          immediateNextSteps: [],
          milestones: []
        };
      }
    }
    return analysis.analysis_payload as ActionItemsData;
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
          <div className="p-2 bg-indigo-100 rounded-lg">
            <ListChecks className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Next Steps & Action Items</h3>
            <p className="text-sm text-gray-600">
              Practical steps to move from concept to implementation
            </p>
          </div>
        </div>
      </div>

      {/* Immediate Next Steps */}
      <div className="mb-6">
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-indigo-600" />
            Do These First
          </h4>
          <ul className="space-y-2">
            {data.immediateNextSteps.map((step, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-100 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                  <span className="text-indigo-700 font-medium text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800">{step}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'actions'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <ListChecks className="h-4 w-4" />
            <span>Action Items ({data.actionItems.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'milestones'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Flag className="h-4 w-4" />
            <span>Milestones ({data.milestones.length})</span>
          </div>
        </button>
      </div>

      {/* Action Items Tab */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          {data.actionItems.map((item, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900">{item.task}</h4>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        <Clock className="h-3 w-3 mr-1" />
                        Timeframe
                      </div>
                      <p className="text-sm text-gray-700">{item.timeframe}</p>
                    </div>
                    
                    <div className="bg-white rounded p-3 border border-gray-200">
                      <div className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                        <Flag className="h-3 w-3 mr-1" />
                        Resources
                      </div>
                      <p className="text-sm text-gray-700">{item.resources}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Milestones Tab */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          {data.milestones.map((milestone, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-indigo-100 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                  <span className="text-indigo-700 font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{milestone.targetDate}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">{milestone.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionItemsCard;