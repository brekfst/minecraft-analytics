// client/src/components/server/ServerDetails.jsx
import React from 'react';
import { Globe, Calendar, Server as ServerIcon, Tag } from 'lucide-react';

const ServerDetails = ({ server }) => {
  const { ip, hostname, first_seen, last_seen, country, gamemode, website_url, stats } = server;
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-xl font-medium text-gray-900">Server Details</h2>
      </div>
      
      <div className="px-6 py-5">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          {/* Server IP */}
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <ServerIcon className="h-4 w-4 mr-2 text-gray-400" />
              IP Address
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{ip}</dd>
          </div>
          
          {/* Hostname */}
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Globe className="h-4 w-4 mr-2 text-gray-400" />
              Hostname
            </dt>
            <dd className="mt-1 text-sm text-gray-900">{hostname || 'Not provided'}</dd>
          </div>
          
          {/* Country */}
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1 text-sm text-gray-900">{country || 'Unknown'}</dd>
          </div>
          
          {/* Website */}
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500">Website</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {website_url ? (
                <a 
                  href={website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-500"
                >
                  {website_url}
                </a>
              ) : (
                'Not provided'
              )}
            </dd>
          </div>
          
          {/* First seen */}
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              First Seen
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(first_seen).toLocaleDateString()}
            </dd>
          </div>
          
          {/* Last seen */}
          <div className="col-span-1">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
              Last Updated
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(last_seen).toLocaleString()}
            </dd>
          </div>
          
          {/* Game modes */}
          <div className="col-span-2">
            <dt className="text-sm font-medium text-gray-500 flex items-center">
              <Tag className="h-4 w-4 mr-2 text-gray-400" />
              Game Modes
            </dt>
            <dd className="mt-1 text-sm text-gray-900">
              <div className="flex flex-wrap gap-2">
                {gamemode && gamemode.map((mode, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {mode}
                  </span>
                ))}
              </div>
            </dd>
          </div>
          
          {/* Server version */}
          {stats && stats.version && (
            <div className="col-span-1">
              <dt className="text-sm font-medium text-gray-500">Version</dt>
              <dd className="mt-1 text-sm text-gray-900">{stats.version}</dd>
            </div>
          )}
          
          {/* Server software */}
          {stats && stats.server_software && (
            <div className="col-span-1">
              <dt className="text-sm font-medium text-gray-500">Server Software</dt>
              <dd className="mt-1 text-sm text-gray-900">{stats.server_software}</dd>
            </div>
          )}
          
          {/* Tags */}
          {stats && stats.tags && stats.tags.length > 0 && (
            <div className="col-span-2">
              <dt className="text-sm font-medium text-gray-500">Tags</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <div className="flex flex-wrap gap-2">
                  {stats.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export default ServerDetails;