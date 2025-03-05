// PendingServers.jsx
import React, { useState, useEffect } from 'react';
import { Server, Check, X, Search } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const PendingServers = () => {
  const [pendingServers, setPendingServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPendingServers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/servers/pending');
        setPendingServers(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch pending servers', err);
        setError(err.response?.data?.message || 'Failed to load pending servers');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingServers();
  }, []);

  const handleApprove = async (serverId) => {
    try {
      await api.post(`/admin/servers/${serverId}/approve`);
      
      // Remove from list
      setPendingServers(pendingServers.filter(server => server.id !== serverId));
      
      toast.success('Server approved successfully');
    } catch (err) {
      console.error(`Failed to approve server ${serverId}`, err);
      toast.error(err.response?.data?.message || 'Failed to approve server');
    }
  };

  const handleReject = async (serverId) => {
    try {
      await api.post(`/admin/servers/${serverId}/reject`);
      
      // Remove from list
      setPendingServers(pendingServers.filter(server => server.id !== serverId));
      
      toast.success('Server rejected successfully');
    } catch (err) {
      console.error(`Failed to reject server ${serverId}`, err);
      toast.error(err.response?.data?.message || 'Failed to reject server');
    }
  };

  const filteredServers = searchQuery
    ? pendingServers.filter(server => 
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (server.hostname && server.hostname.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : pendingServers;

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
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Pending Servers</h1>
        <p className="mt-2 text-sm text-gray-700">
          Review and approve new server submissions
        </p>
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
              placeholder="Search servers"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {filteredServers.length === 0 ? (
          <div className="text-center py-10">
            <Server className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending servers</h3>
            <p className="mt-1 text-sm text-gray-500">
              All server submissions have been reviewed
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredServers.map((server) => (
                <li key={server.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Server className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {server.name}
                          </div>
                          <div className="flex items-center">
                            <div className="text-sm text-gray-500">
                              IP: {server.ip}
                            </div>
                            {server.hostname && (
                              <>
                                <span className="mx-2 text-gray-500">•</span>
                                <div className="text-sm text-gray-500">
                                  Hostname: {server.hostname}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(server.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:border-green-700 focus:shadow-outline-green active:bg-green-700 transition ease-in-out duration-150"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(server.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red active:bg-red-700 transition ease-in-out duration-150"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex sm:space-x-4">
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className="font-medium text-gray-600">Country:</span>
                          <span className="ml-1">{server.country}</span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className="font-medium text-gray-600">Gamemodes:</span>
                          <span className="ml-1">{server.gamemode.join(', ')}</span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <span className="font-medium text-gray-600">Max Players:</span>
                          <span className="ml-1">{server.max_players}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className="font-medium text-gray-600">Submitted:</span>
                        <span className="ml-1">
                          {new Date(server.first_seen).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};