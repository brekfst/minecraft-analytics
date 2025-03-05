// TopServersTable.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Users } from 'lucide-react';

const TopServersTable = ({ servers = [] }) => {
  if (servers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Server className="h-12 w-12 text-gray-300 mb-2" />
        <p className="text-gray-500">No server data available</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Server
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Players
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Version
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {servers.map((server) => (
            <tr key={server.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-md"
                      src={server.favicon_hash ? `/api/favicon/${server.favicon_hash}` : '/server-icon-placeholder.png'}
                      alt={`${server.name} icon`}
                      onError={(e) => {
                        e.target.src = '/server-icon-placeholder.png';
                      }}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {server.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {server.hostname || server.ip}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end">
                  <Users className="h-4 w-4 text-gray-400 mr-1" />
                  <span>{server.player_count} / {server.max_players}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    server.is_online
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {server.is_online ? 'Online' : 'Offline'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                {server.version || 'Unknown'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  to={`/servers/${server.id}`}
                  className="text-blue-600 hover:text-blue-900 flex items-center justify-end"
                >
                  View <ExternalLink className="h-4 w-4 ml-1" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
