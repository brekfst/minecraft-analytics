// client/src/components/server/ServerStats.jsx
import React from 'react';
import { Users, Activity, Clock, TrendingUp } from 'lucide-react';

const ServerStats = ({ currentPlayers, maxPlayers, predictedPeak, uptime }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        icon={<Users className="h-12 w-12 text-blue-600" />}
        value={`${currentPlayers} / ${maxPlayers}`}
        label="Player Count"
        description="Current online players"
      />
      
      <StatCard
        icon={<Activity className="h-12 w-12 text-green-600" />}
        value={`${uptime?.toFixed(1)}%`}
        label="Uptime"
        description="Last 24 hours"
      />
      
      <StatCard
        icon={<Clock className="h-12 w-12 text-purple-600" />}
        value={predictedPeak?.peak_time ? new Date(predictedPeak.peak_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
        label="Predicted Peak Time"
        description="Next 24 hours"
      />
      
      <StatCard
        icon={<TrendingUp className="h-12 w-12 text-amber-600" />}
        value={predictedPeak?.peak_players ? `${predictedPeak.peak_players} players` : 'N/A'}
        label="Predicted Peak"
        description="Maximum players expected"
      />
    </div>
  );
};

const StatCard = ({ icon, value, label, description }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
            <dd>
              <div className="text-2xl font-bold text-gray-900">{value}</div>
            </dd>
          </dl>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ServerStats;