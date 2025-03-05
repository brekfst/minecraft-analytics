import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Server, Check } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { CountrySelect } from '../common/CountrySelect';
import { GamemodeSelect } from '../common/GamemodeSelect';

const ServerCreation = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ip: '',
    hostname: '',
    name: '',
    website_url: '',
    country: 'US',
    gamemode: ['Survival'],
    max_players: 100,
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear the error for this field when user changes it
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCountryChange = (country) => {
    setFormData((prev) => ({ ...prev, country }));
    if (errors.country) {
      setErrors((prev) => ({ ...prev, country: null }));
    }
  };

  const handleGamemodeChange = (selectedGamemodes) => {
    setFormData((prev) => ({ ...prev, gamemode: selectedGamemodes }));
    if (errors.gamemode) {
      setErrors((prev) => ({ ...prev, gamemode: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.ip) newErrors.ip = 'IP address is required';
    if (!formData.hostname) newErrors.hostname = 'Hostname is required';
    if (!formData.name) newErrors.name = 'Server name is required';
    
    // Validate IP format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^([a-fA-F0-9:]+)$/;
    if (formData.ip && !ipRegex.test(formData.ip)) {
      newErrors.ip = 'Invalid IP address format';
    }
    
    // Validate hostname format
    const hostnameRegex = /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])(\.[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])*$/;
    if (formData.hostname && !hostnameRegex.test(formData.hostname)) {
      newErrors.hostname = 'Invalid hostname format';
    }
    
    // Validate website URL if provided
    if (formData.website_url && formData.website_url.trim() !== '') {
      try {
        new URL(formData.website_url);
      } catch (e) {
        newErrors.website_url = 'Invalid website URL';
      }
    }
    
    // Validate max_players
    if (!formData.max_players || isNaN(formData.max_players) || parseInt(formData.max_players) <= 0) {
      newErrors.max_players = 'Must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.post('/servers', {
        ...formData,
        max_players: parseInt(formData.max_players)
      });
      
      setSuccess(true);
      toast.success('Server submitted successfully! Pending admin approval.');
      
      // Reset form after successful submission
      setFormData({
        ip: '',
        hostname: '',
        name: '',
        website_url: '',
        country: 'US',
        gamemode: ['Survival'],
        max_players: 100,
      });
      
      // Navigate to the new server page after a delay
      setTimeout(() => {
        navigate(`/servers/${response.data.data.id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Failed to submit server', err);
      toast.error(err.response?.data?.message || 'Failed to submit server');
      
      if (err.response?.data?.serverId) {
        // Server already exists, redirect to it
        toast.error('Server with this IP or hostname already exists');
        setTimeout(() => {
          navigate(`/servers/${err.response.data.serverId}`);
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="add-server" className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center">
          <PlusCircle className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-medium text-gray-900">
            Add Your Minecraft Server
          </h3>
        </div>
      </div>
      
      {success ? (
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-6">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Server submitted successfully!</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your server has been submitted and is awaiting admin approval.
              You'll be redirected to your server page shortly.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* IP Address */}
              <div>
                <label htmlFor="ip" className="block text-sm font-medium text-gray-700">
                  IP Address*
                </label>
                <input
                  type="text"
                  name="ip"
                  id="ip"
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.ip ? 'border-red-300' : ''
                  }`}
                  value={formData.ip}
                  onChange={handleChange}
                />
                {errors.ip && (
                  <p className="mt-1 text-sm text-red-600">{errors.ip}</p>
                )}
              </div>
              
              {/* Hostname */}
              <div>
                <label htmlFor="hostname" className="block text-sm font-medium text-gray-700">
                  Hostname*
                </label>
                <input
                  type="text"
                  name="hostname"
                  id="hostname"
                  placeholder="play.example.com"
                  className={`mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${
                    errors.hostname ? 'border-red-300' : ''
                  }`}
                  value={formData.hostname}
                  onChange={handleChange}
                />
                {errors.hostname && (
                  <p className="mt-1 text-sm text-red-600">{errors.hostname}</p>
                )}
              </div>
              
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
              
              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                  Country*
                </label>
                <CountrySelect
                  value={formData.country}
                  onChange={handleCountryChange}
                  error={errors.country}
                />
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
              
              {/* Gamemode */}
              <div className="md:col-span-2">
                <label htmlFor="gamemode" className="block text-sm font-medium text-gray-700">
                  Gamemode(s)*
                </label>
                <GamemodeSelect
                  value={formData.gamemode}
                  onChange={handleGamemodeChange}
                  error={errors.gamemode}
                />
              </div>
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className={`w-full inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Server className="mr-2 h-5 w-5" />
                    Add Server
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-4 text-sm text-gray-500 text-center">
              <p>
                All server submissions require admin approval before being listed.
                You'll be able to claim ownership once approved.
              </p>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ServerCreation;