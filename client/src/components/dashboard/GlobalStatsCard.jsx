// GlobalStatsCards.jsx
import React from 'react';
import { Users, Server, Activity } from 'lucide-react';

const GlobalStatsCards = ({ totalServers, totalPlayers }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <StatCard
        icon={<Server className="h-12 w-12 text-blue-600" />}
        value={totalServers.toLocaleString()}
        label="Active Servers"
        description="Minecraft servers being tracked"
      />
      
      <StatCard
        icon={<Users className="h-12 w-12 text-green-600" />}
        value={totalPlayers.toLocaleString()}
        label="Online Players"
        description="Currently playing across all servers"
      />
      
      <StatCard
        icon={<Activity className="h-12 w-12 text-purple-600" />}
        value={`${(totalPlayers / Math.max(totalServers, 1)).toFixed(1)}`}
        label="Average Players"
        description="Per active server"
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