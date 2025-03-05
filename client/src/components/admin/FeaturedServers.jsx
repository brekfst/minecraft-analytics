// FeaturedServers.jsx
import React, { useState, useEffect } from 'react';
import { Star, X, Edit, Plus, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const FeaturedServers = () => {
  const [featuredServers, setFeaturedServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchFeaturedServers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/featured');
        setFeaturedServers(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch featured servers', err);
        setError(err.response?.data?.message || 'Failed to load featured servers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedServers();
  }, []);

  const handleRemove = async (id) => {
    try {
      await api.delete(`/admin/featured/${id}`);
      
      // Remove from list
      setFeaturedServers(featuredServers.filter(server => server.id !== id));
      
      toast.success('Server removed from featured list');
    } catch (err) {
      console.error(`Failed to remove featured server ${id}`, err);
      toast.error(err.response?.data?.message || 'Failed to remove featured server');
    }
  };

  const handleMoveUp = async (id, position) => {
    if (position <= 1) return; // Already at the top
    
    try {
      await api.put(`/admin/featured/${id}`, {
        position: position - 1
      });
      
      // Refresh the list
      const response = await api.get('/admin/featured');
      setFeaturedServers(response.data.data);
      
      toast.success('Server position updated');
    } catch (err) {
      console.error(`Failed to update featured server position ${id}`, err);
      toast.error(err.response?.data?.message || 'Failed to update position');
    }
  };

  const handleMoveDown = async (id, position) => {
    if (position >= featuredServers.length) return; // Already at the bottom
    
    try {
      await api.put(`/admin/featured/${id}`, {
        position: position + 1
      });
      
      // Refresh the list
      const response = await api.get('/admin/featured');
      setFeaturedServers(response.data.data);
      
      toast.success('Server position updated');
    } catch (err) {
      console.error(`Failed to update featured server position ${id}`, err);
      toast.error(err.response?.data?.message || 'Failed to update position');
    }
  };

  const filteredServers = searchQuery
    ? featuredServers.filter(server => 
        server.server_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.server_ip.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : featuredServers;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="rounded-full bg-red-100 p-3 mx-auto w-fit">
          <X className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Featured Servers</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add Featured Server
          </button>
        </div>
      </div>
      
      <div className="mt-6">
        {/* Search Bar */}
        <div className="max-w-lg w-full lg:max-w-xs mb-6">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search featured servers"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {filteredServers.length === 0 ? (
          <div className="text-center py-10">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No featured servers</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add a server to the featured list to promote it on the homepage
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredServers.map((featured) => (
                <li key={featured.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-800">{featured.position}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {featured.server_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Server IP: {featured.server_ip}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMoveUp(featured.id, featured.position)}
                          disabled={featured.position <= 1}
                          className={`inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-500 ${
                            featured.position <= 1
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-gray-50'
                          }`}
                          title="Move up"
                        >
                          <ArrowUp className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(featured.id, featured.position)}
                          disabled={featured.position >= featuredServers.length}
                          className={`inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-500 ${
                            featured.position >= featuredServers.length
                              ? 'opacity-50 cursor-not-allowed'
                              : 'hover:bg-gray-50'
                          }`}
                          title="Move down"
                        >
                          <ArrowDown className="h-5 w-5" />
                        </button>
                        <Link
                          to={`/servers/${featured.server_id}`}
                          className="inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-500 hover:bg-gray-50"
                          title="View server"
                        >
                          <Search className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleRemove(featured.id)}
                          className="inline-flex items-center p-1 border border-gray-300 rounded-md text-red-500 hover:bg-gray-50"
                          title="Remove from featured"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex sm:space-x-4">
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className="font-medium text-gray-600">Start Date:</span>
                          <span className="ml-1">
                            {new Date(featured.start_date).toLocaleDateString()}
                          </span>
                        </div>
                        {featured.end_date && (
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <span className="font-medium text-gray-600">End Date:</span>
                            <span className="ml-1">
                              {new Date(featured.end_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            featured.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {featured.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                // AdminSidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Users, 
  Star, 
  BarChart2,
  Server
} from 'lucide-react';

const AdminSidebar = ({ stats }) => {
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