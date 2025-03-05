import React from 'react';
import { Link } from 'react-router-dom';
import { Server, Users, Activity, ChevronRight } from 'lucide-react';

const StatsOverview = ({ stats }) => {
  if (!stats) return null;

  const { total_servers, total_players, top_servers } = stats;

  return (
    <section className="mb-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<Server className="h-12 w-12 text-blue-600" />}
          value={total_servers.toLocaleString()}
          label="Active Servers"
          description="Minecraft servers being tracked"
        />
        
        <StatCard
          icon={<Users className="h-12 w-12 text-green-600" />}
          value={total_players.toLocaleString()}
          label="Online Players"
          description="Currently playing across all servers"
        />
        
        <StatCard
          icon={<Activity className="h-12 w-12 text-purple-600" />}
          value={top_servers.length > 0 ? `${top_servers[0].player_count} players` : 'N/A'}
          label="Top Server"
          description={top_servers.length > 0 ? top_servers[0].name : 'No servers available'}
          link={top_servers.length > 0 ? `/servers/${top_servers[0].id}` : null}
        />
      </div>
      
      <div className="text-right">
        <Link
          to="/dashboard/global"
          className="inline-flex items-center text-blue-600 hover:text-blue-500"
        >
          View Global Dashboard
          <ChevronRight className="ml-1 h-5 w-5" />
        </Link>
      </div>
    </section>
  );
};

const StatCard = ({ icon, value, label, description, link }) => {
  const content = (
    <div className="bg-white rounded-lg shadow p-6 h-full transition hover:shadow-md">
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

  if (link) {
    return (
      <Link to={link} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
};

export default StatsOverview;