// ServerDashboardHeader.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Server, ArrowLeft } from 'lucide-react';
import { parseMotd } from '../../utils/minecraftText';

const ServerDashboardHeader = ({ server }) => {
  const { name, hostname, ip, website_url, stats } = server;

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row items-start justify-between">
        <div>
          <div className="flex items-center mb-4">
            <Link to={`/servers/${server.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-500 mr-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Public Server Page
            </Link>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                stats.is_online
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {stats.is_online ? 'Online' : 'Offline'}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{name}</h1>
          <p className="text-gray-500">{hostname || ip}</p>
          
          <div 
            className="mt-2 text-gray-600"
            dangerouslySetInnerHTML={{ __html: parseMotd(stats.motd) }}
          />
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-end">
          <div className="text-sm bg-gray-100 rounded p-2 mb-3">
            <div className="font-medium text-gray-800 mb-1">Current Players</div>
            <div className="text-2xl font-bold text-blue-600">{stats.current_players} / {server.max_players}</div>
          </div>
          
          {website_url && (
            <a
              href={website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-500"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
};