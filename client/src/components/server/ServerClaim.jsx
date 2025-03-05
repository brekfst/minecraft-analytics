// client/src/components/server/ServerClaim.jsx
import React, { useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ServerClaim = ({ serverId, hasOwner }) => {
  const { isAuthenticated, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If user is authenticated, pre-fill the form
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setFormData({
        username: user.username || '',
        email: user.email || ''
      });
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      await api.post(`/servers/${serverId}/claim`, formData);
      
      setSuccess(true);
      toast.success('Claim submitted successfully! Awaiting approval.');
      
      // Reset form
      setFormData({
        username: '',
        email: ''
      });
    } catch (err) {
      console.error('Failed to submit claim', err);
      toast.error(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  // If the server already has an owner
  if (hasOwner) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center flex-col text-center py-4">
          <div className="rounded-full bg-green-100 p-3">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Server Claimed</h3>
          <p className="mt-1 text-sm text-gray-500">
            This server has already been claimed by its owner
          </p>
          
          {isAuthenticated ? (
            <p className="mt-2 text-sm text-gray-600">
              If you are the owner but don't have access, please contact support.
            </p>
          ) : (
            <p className="mt-2 text-sm text-gray-600">
              Sign in to see if you have access to this server
            </p>
          )}
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-center flex-col text-center py-4">
          <div className="rounded-full bg-green-100 p-3">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Claim Submitted</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your claim has been submitted and is awaiting review by our admins
          </p>
          <p className="mt-2 text-sm text-gray-600">
            We'll notify you by email when your claim is processed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center">
          <Shield className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">
            Claim This Server
          </h3>
        </div>
      </div>
      
      <div className="p-6">
        {showForm ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Minecraft Username*
                </label>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.username ? 'border-red-300' : ''
                  }`}
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address*
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.email ? 'border-red-300' : ''
                  }`}
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Submitting...' : 'Submit Claim'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Are you the owner of this Minecraft server? Claim it to gain management access.
            </p>
            
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Shield className="h-4 w-4 mr-1.5" />
              Claim Server
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerClaim;