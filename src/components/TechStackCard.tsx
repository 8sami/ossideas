import React, { useState } from 'react';
import { Code, Workflow } from 'lucide-react';
import { AnalysisResult, TechStackData } from './AnalysisResults';

interface TechStackCardProps {
  analysis: AnalysisResult;
}

const TechStackCard: React.FC<TechStackCardProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'components' | 'workflow'>('components');

  // Parse the analysis payload if it's a string
  const getAnalysisData = (): TechStackData => {
    if (typeof analysis.analysis_payload === 'string') {
      try {
        return JSON.parse(analysis.analysis_payload);
      } catch (e) {
        console.error('Error parsing tech stack data:', e);
        return {
          coreComponents: [],
          workflow: { steps: [] },
          implementationComplexity: 'medium'
        };
      }
    }
    return analysis.analysis_payload as TechStackData;
  };

  const data = getAnalysisData();

  const getComplexityColor = (complexity: string) => {
    switch (complexity.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComponentIcon = (componentName: string) => {
    const name = componentName.toLowerCase();
    if (name.includes('frontend') || name.includes('ui')) return '🖥️';
    if (name.includes('backend') || name.includes('api')) return '⚙️';
    if (name.includes('database') || name.includes('storage')) return '💾';
    if (name.includes('auth')) return '🔒';
    if (name.includes('deploy') || name.includes('infrastructure')) return '🚀';
    if (name.includes('analytics')) return '📊';
    if (name.includes('payment')) return '💳';
    if (name.includes('notification')) return '🔔';
    if (name.includes('search')) return '🔍';
    if (name.includes('cache')) return '⚡';
    return '🧩';
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Code className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Technical Stack & Workflow</h3>
            <p className="text-sm text-gray-600">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getComplexityColor(data.implementationComplexity)}`}>
                {data.implementationComplexity.charAt(0).toUpperCase() + data.implementationComplexity.slice(1)} Complexity
              </span>
              <span className="mx-2">•</span>
              <span>{data.coreComponents.length} components</span>
              <span className="mx-2">•</span>
              <span>{data.workflow.steps.length} implementation steps</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('components')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'components'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Code className="h-4 w-4" />
            <span>Core Components</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('workflow')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'workflow'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Workflow className="h-4 w-4" />
            <span>Implementation Workflow</span>
          </div>
        </button>
      </div>

      {/* Components Tab */}
      {activeTab === 'components' && (
        <div className="space-y-6">
          {data.coreComponents.map((component, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 text-2xl mr-3">
                  {getComponentIcon(component.name)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{component.name}</h4>
                  <p className="text-sm text-gray-700 mb-3">{component.purpose}</p>
                  
                  <div className="space-y-2">
                    <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended Technologies</h5>
                    <div className="flex flex-wrap gap-2">
                      {component.alternatives.map((tech, techIndex) => (
                        <span 
                          key={techIndex} 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            techIndex === 0 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                        >
                          {tech}
                          {techIndex === 0 && <span className="ml-1 text-xs">★</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workflow Tab */}
      {activeTab === 'workflow' && (
        <div className="space-y-4">
          <div className="relative">
            {data.workflow.steps.map((step, index) => (
              <div key={index} className="mb-8 relative">
                {/* Timeline connector */}
                {index < data.workflow.steps.length - 1 && (
                  <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-gray-200"></div>
                )}
                
                <div className="flex items-start">
                  {/* Step number */}
                  <div className="flex-shrink-0 bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg z-10">
                    {index + 1}
                  </div>
                  
                  {/* Step content */}
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg mb-1">{step.name}</h4>
                    <p className="text-gray-700">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechStackCard;