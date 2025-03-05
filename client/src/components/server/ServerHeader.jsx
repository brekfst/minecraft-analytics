// src/components/server/ServerHeader.jsx
import React from 'react';
import { ExternalLink } from 'lucide-react';
import { parseMotd } from '../../utils/minecraftText';

const ServerHeader = ({ server }) => {
  // Destructure server data with fallback values
  const { name = 'Unnamed Server', hostname, ip, website_url, stats = {} } = server;
  const { motd = '', is_online = false } = stats;

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        {/* Left side: Server name, hostname/IP, and MOTD */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <p className="text-gray-500">{hostname || ip || 'No address provided'}</p>
          <div
            className="mt-2 text-gray-600"
            dangerouslySetInnerHTML={{ __html: parseMotd(motd) }}
          />
        </div>

        {/* Right side: Online status and website link */}
        <div className="flex items-center space-x-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              is_online ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {is_online ? 'Online' : 'Offline'}
          </span>
          {website_url && (
            <a
              href={website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-500"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerHeader;