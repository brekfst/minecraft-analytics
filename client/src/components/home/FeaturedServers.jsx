import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Server, ChevronRight } from 'lucide-react';
import { parseMotd } from '../../utils/minecraftText';

const FeaturedServers = ({ servers = [] }) => {
  if (servers.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <div className="flex flex-col items-center justify-center py-10">
          <Server className="h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No featured servers yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Check back later for featured Minecraft servers or add your own!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {servers.map((server) => (
        <ServerCard key={server.id} server={server} />
      ))}
    </div>
  );
};

const ServerCard = ({ server }) => {
  const {
    id,
    name,
    hostname,
    country,
    current_players = 0,
    max_players = 0,
    is_online = false,
    motd = '',
    version = ''
  } = server;

  // Get server favicon URL using the hash
  const faviconUrl = server.favicon_hash 
    ? `/api/favicon/${server.favicon_hash}` 
    : '/server-icon-placeholder.png';

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden transition-transform hover:transform hover:scale-102">
      <div className="px-6 py-5">
        <div className="flex items-start">
          <div className="flex-shrink-0 h-12 w-12 mr-3">
            <img
              src={faviconUrl}
              alt={`${name} favicon`}
              className="h-12 w-12 rounded-md border border-gray-200"
              onError={(e) => {
                e.target.src = '/server-icon-placeholder.png';
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {name}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              {hostname || 'play.example.com'}
            </p>
            <div className="mt-1 flex items-center">
              <span
                className={`inline-block h-2 w-2 rounded-full mr-2 ${
                  is_online ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm text-gray-500">
                {is_online ? 'Online' : 'Offline'}
              </span>
              <span className="text-sm text-gray-400 mx-2">•</span>
              <span className="text-sm text-gray-500">
                {version}
              </span>
              <span className="text-sm text-gray-400 mx-2">•</span>
              <span className="text-sm text-gray-500 uppercase">
                {country}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div 
            className="text-sm text-gray-600 mb-3 h-12 overflow-hidden"
            dangerouslySetInnerHTML={{ __html: parseMotd(motd) }}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-4 w-4 mr-1" />
              <span>
                {current_players} / {max_players} players
              </span>
            </div>
            
            <Link
              to={`/servers/${id}`}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:shadow-outline-blue active:bg-blue-700 transition ease-in-out duration-150"
            >
              View Server
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedServers;