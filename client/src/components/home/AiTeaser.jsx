import React from 'react';
import { Bot, Clock, TrendingUp, AlertTriangle, Users, Zap } from 'lucide-react';

const AiTeaser = ({ predictions = [] }) => {
  // If no predictions, show a teaser message
  if (!predictions || predictions.length === 0) {
    return (
      <div className="p-6 bg-white shadow rounded-lg">
        <div className="flex flex-col items-center justify-center py-4">
          <Brain className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 text-center">
            See what's next with AI-driven forecasts
          </h3>
          <p className="mt-2 text-gray-600 text-center max-w-lg">
            Our AI analyzes server patterns to predict peak times, potential issues, 
            and player activity - helping you optimize your Minecraft server.
          </p>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <PredictionExample
            icon={<Clock className="h-6 w-6 text-blue-600" />}
            title="Player Activity"
            description="Predicted peak: 60 players at 8 PM"
          />
          <PredictionExample
            icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
            title="Potential Issues"
            description="Possible lag spike in the next 3 hours"
          />
          <PredictionExample
            icon={<TrendingUp className="h-6 w-6 text-green-600" />}
            title="Growth Trends"
            description="13% player increase expected this weekend"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <div className="flex items-center mb-6">
        <Brain className="h-8 w-8 text-blue-600 mr-3" />
        <h3 className="text-xl font-medium text-gray-900">
          AI-Generated Server Insights
        </h3>
      </div>
      
      <div className="space-y-4">
        {predictions.slice(0, 3).map((prediction, index) => (
          <div 
            key={index} 
            className="border-l-4 border-blue-500 pl-4 py-2"
          >
            <div className="flex items-start">
              {getPredictionIcon(prediction.prediction_type)}
              <div className="ml-3">
                <p className="text-gray-900 font-medium">
                  {prediction.insight}
                </p>
                <p className="text-sm text-gray-500">
                  {formatPredictionTime(prediction.prediction_timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600 text-sm">
          AI predictions are generated based on historical data and patterns.
          Results may vary based on actual server conditions.
        </p>
      </div>
    </div>
  );
};

const PredictionExample = ({ icon, title, description }) => {
  return (
    <div className="bg-blue-50 rounded-lg p-4">
      <div className="flex items-center mb-2">
        {icon}
        <h4 className="ml-2 text-md font-medium text-gray-900">{title}</h4>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
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
  return date.toLocaleString();
};

export default AiTeaser;
