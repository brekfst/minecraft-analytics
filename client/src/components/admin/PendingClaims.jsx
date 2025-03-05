// PendingClaims.jsx
import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Search, User, Mail } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../common/LoadingSpinner';

const PendingClaims = () => {
  const [pendingClaims, setPendingClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPendingClaims = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/claims/pending');
        setPendingClaims(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch pending claims', err);
        setError(err.response?.data?.message || 'Failed to load pending claims');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingClaims();
  }, []);

  const handleApprove = async (claimId) => {
    try {
      await api.post(`/admin/claims/${claimId}/approve`);
      
      // Remove from list
      setPendingClaims(pendingClaims.filter(claim => claim.id !== claimId));
      
      toast.success('Claim approved successfully');
    } catch (err) {
      console.error(`Failed to approve claim ${claimId}`, err);
      toast.error(err.response?.data?.message || 'Failed to approve claim');
    }
  };

  const handleReject = async (claimId) => {
    try {
      await api.post(`/admin/claims/${claimId}/reject`);
      
      // Remove from list
      setPendingClaims(pendingClaims.filter(claim => claim.id !== claimId));
      
      toast.success('Claim rejected successfully');
    } catch (err) {
      console.error(`Failed to reject claim ${claimId}`, err);
      toast.error(err.response?.data?.message || 'Failed to reject claim');
    }
  };

  const filteredClaims = searchQuery
    ? pendingClaims.filter(claim => 
        claim.server_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.server_ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : pendingClaims;

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
        <h1 className="text-2xl font-bold text-gray-900">Pending Claims</h1>
        <p className="mt-2 text-sm text-gray-700">
          Review and approve server ownership claims
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
              placeholder="Search claims"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {filteredClaims.length === 0 ? (
          <div className="text-center py-10">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending claims</h3>
            <p className="mt-1 text-sm text-gray-500">
              All server claims have been reviewed
            </p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredClaims.map((claim) => (
                <li key={claim.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Shield className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            Claim for {claim.server_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Server IP: {claim.server_ip}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(claim.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:border-green-700 focus:shadow-outline-green active:bg-green-700 transition ease-in-out duration-150"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(claim.id)}
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
                          <User className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-600">Username:</span>
                          <span className="ml-1">{claim.username}</span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-600">Email:</span>
                          <span className="ml-1">{claim.email}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className="font-medium text-gray-600">Submitted:</span>
                        <span className="ml-1">
                          {new Date(claim.created_at).toLocaleString()}
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