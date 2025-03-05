// AIInsightsWidget.jsx
import React from 'react';
import { Bot, AlertTriangle, TrendingUp, Users, Zap } from 'lucide-react';

const AIInsightsWidget = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 h-full">
        <div className="flex items-center mb-4">
          <Brain className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Brain className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500">No insights available yet</p>
          <p className="text-sm text-gray-400 mt-2">
            AI needs more data to generate meaningful insights
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg p-6 h-full">
      <div className="flex items-center mb-4">
        <Brain className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
      </div>
      
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
            <div className="flex items-start">
              {getPredictionIcon(insight.prediction_type)}
              <div className="ml-3">
                <p className="text-gray-900 text-sm">{insight.insight}</p>
                <p className="text-xs text-gray-500">
                  {formatPredictionTime(insight.prediction_timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>AI predictions are generated based on historical patterns</p>
      </div>
    </div>
  );
};

const getPredictionIcon = (type) => {
  switch (type) {
    case 'player_count':
      return <Users className="h-5 w-5 text-blue-600 flex-shrink-0" />;
    case 'downtime':
      return <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />;
    case 'latency':
      return <Zap className="h-5 w-5 text-red-500 flex-shrink-0" />;
    case 'growth':
      return <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0" />;
    default:
      return <Brain className="h-5 w-5 text-blue-600 flex-shrink-0" />;
  }
};

const formatPredictionTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
