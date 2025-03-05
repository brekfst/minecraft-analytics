// RisingServersList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowUp, Server } from 'lucide-react';

const RisingServersList = ({ servers = [] }) => {
  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Server className="h-12 w-12 text-gray-300 mb-2" />
        <p className="text-gray-500">No rising servers data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {servers.map((server) => (
        <Link
          key={server.id}
          to={`/servers/${server.id}`}
          className="block"
        >
          <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-150">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {server.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">{server.hostname || server.ip}</p>
              </div>
              <div className="flex-shrink-0 ml-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800`}
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Rising
                </span>
              </div>
            </div>
            
            <div className="mt-2 flex items-center text-sm">
              <div className="flex items-center text-green-600">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="font-medium">
                  {server.growth > 0 ? `+${server.growth}` : server.growth} players
                </span>
              </div>
              <span className="text-gray-500 mx-2">•</span>
              <div className="text-gray-600">
                {server.current_players} online now
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};