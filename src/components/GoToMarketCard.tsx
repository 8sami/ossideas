import React, { useState } from 'react';
import { Rocket, Users, Zap, Calendar, Target, Megaphone } from 'lucide-react';
import { AnalysisResult, GoToMarketData } from './AnalysisResults';

interface GoToMarketCardProps {
  analysis: AnalysisResult;
}

const GoToMarketCard: React.FC<GoToMarketCardProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'tactics' | 'timeline' | 'criteria'>('channels');

  // Parse the analysis payload if it's a string
  const getAnalysisData = (): GoToMarketData => {
    if (typeof analysis.analysis_payload === 'string') {
      try {
        return JSON.parse(analysis.analysis_payload);
      } catch (e) {
        console.error('Error parsing go-to-market data:', e);
        return {
          launchChannels: [],
          launchHook: 'Error parsing data',
          targetAudience: 'Error parsing data',
          marketingTactics: [],
          timelineToLaunch: 'Error parsing data',
          successCriteria: []
        };
      }
    }
    return analysis.analysis_payload as GoToMarketData;
  };

  const data = getAnalysisData();

  const getChannelIcon = (channel: string) => {
    const channelLower = channel.toLowerCase();
    if (channelLower.includes('reddit') || channelLower.includes('forum')) return '💬';
    if (channelLower.includes('discord') || channelLower.includes('slack')) return '🔊';
    if (channelLower.includes('twitter') || channelLower.includes('linkedin')) return '📱';
    if (channelLower.includes('product hunt') || channelLower.includes('hacker news')) return '🚀';
    if (channelLower.includes('github') || channelLower.includes('gitlab')) return '🧑‍💻';
    if (channelLower.includes('blog') || channelLower.includes('medium')) return '📝';
    if (channelLower.includes('conference') || channelLower.includes('meetup')) return '🎪';
    if (channelLower.includes('email') || channelLower.includes('newsletter')) return '📧';
    if (channelLower.includes('youtube') || channelLower.includes('video')) return '🎥';
    if (channelLower.includes('podcast')) return '🎙️';
    return '🌐';
  };

  const getTacticIcon = (tactic: string) => {
    const tacticLower = tactic.toLowerCase();
    if (tacticLower.includes('content') || tacticLower.includes('blog')) return '📝';
    if (tacticLower.includes('social media') || tacticLower.includes('post')) return '📱';
    if (tacticLower.includes('email') || tacticLower.includes('newsletter')) return '📧';
    if (tacticLower.includes('webinar') || tacticLower.includes('demo')) return '🎥';
    if (tacticLower.includes('partnership') || tacticLower.includes('collaboration')) return '🤝';
    if (tacticLower.includes('influencer') || tacticLower.includes('ambassador')) return '👑';
    if (tacticLower.includes('seo') || tacticLower.includes('search')) return '🔍';
    if (tacticLower.includes('ads') || tacticLower.includes('paid')) return '💰';
    if (tacticLower.includes('referral') || tacticLower.includes('invite')) return '👥';
    if (tacticLower.includes('community') || tacticLower.includes('forum')) return '👪';
    return '📣';
  };

  return (
    <div className="bg-white overflow-hidden">
      <div className="mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Rocket className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Go-to-Market Plan</h3>
            <p className="text-sm text-gray-600">
              Launch strategy and marketing plan
            </p>
          </div>
        </div>
      </div>

      {/* Launch Hook & Target Audience */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Launch Hook */}
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <h4 className="text-sm font-semibold text-gray-900">Launch Hook</h4>
            </div>
            <p className="text-gray-700">{data.launchHook}</p>
          </div>

          {/* Target Audience */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-blue-600" />
              <h4 className="text-sm font-semibold text-gray-900">Target Audience</h4>
            </div>
            <p className="text-gray-700">{data.targetAudience}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('channels')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${
            activeTab === 'channels'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Megaphone className="h-4 w-4" />
            <span>Launch Channels</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('tactics')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${
            activeTab === 'tactics'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Marketing Tactics</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${
            activeTab === 'timeline'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Launch Timeline</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('criteria')}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 ${
            activeTab === 'criteria'
              ? 'border-purple-500 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Success Criteria</span>
          </div>
        </button>
      </div>

      {/* Launch Channels Tab */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Where to Find Your First Users</h4>
            <ul className="space-y-3">
              {data.launchChannels.map((channel, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-xl mr-3 flex-shrink-0">{getChannelIcon(channel)}</span>
                  <div className="flex-1">
                    <p className="text-gray-800">{channel}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Marketing Tactics Tab */}
      {activeTab === 'tactics' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Marketing Tactics for Launch</h4>
            <ul className="space-y-3">
              {data.marketingTactics.map((tactic, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-xl mr-3 flex-shrink-0">{getTacticIcon(tactic)}</span>
                  <div className="flex-1">
                    <p className="text-gray-800">{tactic}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Timeline to Launch</h4>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-800 whitespace-pre-line">{data.timelineToLaunch}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Criteria Tab */}
      {activeTab === 'criteria' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Success Criteria</h4>
            <ul className="space-y-3">
              {data.successCriteria.map((criterion, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 bg-purple-100 rounded-full w-6 h-6 flex items-center justify-center mr-3">
                    <span className="text-purple-700 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800">{criterion}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoToMarketCard;