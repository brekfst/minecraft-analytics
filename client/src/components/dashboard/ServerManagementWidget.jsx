// ServerManagementWidget.jsx
import React, { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ServerManagementWidget = ({ server, onServerUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: server.name,
    website_url: server.website_url || '',
    max_players: server.max_players,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const handleEdit = () => {
    setEditing(true);
  };
  
  const handleCancel = () => {
    // Reset form data to server values
    setFormData({
      name: server.name,
      website_url: server.website_url || '',
      max_players: server.max_players,
    });
    setErrors({});
    setEditing(false);
  };
  
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
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.website_url && !isValidUrl(formData.website_url)) {
      newErrors.website_url = 'Invalid URL format';
    }
    
    if (!formData.max_players || isNaN(formData.max_players) || parseInt(formData.max_players) <= 0) {
      newErrors.max_players = 'Must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.put(`/servers/${server.id}`, {
        name: formData.name,
        website_url: formData.website_url || null,
        max_players: parseInt(formData.max_players),
      });
      
      toast.success('Server updated successfully');
      
      // Update server in parent component
      if (onServerUpdated) {
        onServerUpdated(response.data.data);
      }
      
      setEditing(false);
    } catch (err) {
      console.error('Error updating server', err);
      toast.error(err.response?.data?.message || 'Failed to update server');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden h-full">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Settings className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Server Management</h3>
          </div>
          {!editing && (
            <button
              onClick={handleEdit}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Settings
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {editing ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Server Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Server Name*
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.name ? 'border-red-300' : ''
                  }`}
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
              
              {/* Website URL */}
              <div>
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
                  Website URL (optional)
                </label>
                <input
                  type="text"
                  name="website_url"
                  id="website_url"
                  placeholder="https://example.com"
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.website_url ? 'border-red-300' : ''
                  }`}
                  value={formData.website_url}
                  onChange={handleChange}
                />
                {errors.website_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.website_url}</p>
                )}
              </div>
              
              {/* Max Players */}
              <div>
                <label htmlFor="max_players" className="block text-sm font-medium text-gray-700">
                  Maximum Players*
                </label>
                <input
                  type="number"
                  name="max_players"
                  id="max_players"
                  min="1"
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.max_players ? 'border-red-300' : ''
                  }`}
                  value={formData.max_players}
                  onChange={handleChange}
                />
                {errors.max_players && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_players}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
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
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Quick Information</h4>
              <dl className="mt-2 divide-y divide-gray-200">
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                  <dd className="text-sm font-medium text-gray-900">{server.ip}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Hostname</dt>
                  <dd className="text-sm font-medium text-gray-900">{server.hostname || 'N/A'}</dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">First Seen</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(server.first_seen).toLocaleDateString()}
                  </dd>
                </div>
                <div className="py-3 flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Last Update</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {new Date(server.last_seen).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
            
            <div>
              <div className="flex justify-center">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Settings className="h-4 w-4 mr-1.5" />
                  Edit Server Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
