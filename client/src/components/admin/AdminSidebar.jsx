// AdminSidebar.jsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Users, 
  Star, 
  BarChart2,
  Server
} from 'lucide-react';

const AdminSidebar = ({ stats }) => {
  const location = useLocation();
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Admin Panel</h2>
        <p className="text-sm text-gray-500">Manage servers and claims</p>
      </div>
      
      <div className="p-4">
        <nav className="space-y-1">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
            end
          >
            <LayoutDashboard 
              className={`flex-shrink-0 mr-3 h-5 w-5 ${
                location.pathname === '/admin'
                  ? 'text-blue-500'
                  : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            Dashboard
          </NavLink>
          
          <NavLink
            to="/admin/pending-servers"
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Server 
              className={`flex-shrink-0 mr-3 h-5 w-5 ${
                location.pathname === '/admin/pending-servers'
                  ? 'text-blue-500'
                  : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            Pending Servers
            {stats && stats.pending_servers > 0 && (
              <span className="ml-auto inline-block py-0.5 px-3 text-xs rounded-full bg-blue-100 text-blue-800">
                {stats.pending_servers}
              </span>
            )}
          </NavLink>
          
          <NavLink
            to="/admin/pending-claims"
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <ShieldAlert 
              className={`flex-shrink-0 mr-3 h-5 w-5 ${
                location.pathname === '/admin/pending-claims'
                  ? 'text-blue-500'
                  : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            Pending Claims
            {stats && stats.pending_claims > 0 && (
              <span className="ml-auto inline-block py-0.5 px-3 text-xs rounded-full bg-blue-100 text-blue-800">
                {stats.pending_claims}
              </span>
            )}
          </NavLink>
          
          <NavLink
            to="/admin/featured-servers"
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Star 
              className={`flex-shrink-0 mr-3 h-5 w-5 ${
                location.pathname === '/admin/featured-servers'
                  ? 'text-blue-500'
                  : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            Featured Servers
          </NavLink>
          
          <NavLink
            to="/admin/analytics"
            className={({ isActive }) =>
              `group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <BarChart2 
              className={`flex-shrink-0 mr-3 h-5 w-5 ${
                location.pathname === '/admin/analytics'
                  ? 'text-blue-500'
                  : 'text-gray-400 group-hover:text-gray-500'
              }`}
            />
            Analytics
          </NavLink>
        </nav>
      </div>
      
      {stats && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Platform Stats
          </h3>
          <dl className="mt-2 divide-y divide-gray-200">
            <div className="py-2 flex justify-between">
              <dt className="text-sm text-gray-500">Total Servers</dt>
              <dd className="text-sm font-medium text-gray-900">{stats.total_servers}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-sm text-gray-500">Active Servers</dt>
              <dd className="text-sm font-medium text-gray-900">{stats.active_servers}</dd>
            </div>
            <div className="py-2 flex justify-between">
              <dt className="text-sm text-gray-500">Total Players</dt>
              <dd className="text-sm font-medium text-gray-900">{stats.total_players}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
};