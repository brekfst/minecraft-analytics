import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import ServerDashboardHeader from '../components/dashboard/ServerDashboardHeader';
import ServerTrendsWidget from '../components/dashboard/ServerTrendsWidget';
import UptimeWidget from '../components/dashboard/UptimeWidget';
import AIInsightsWidget from '../components/dashboard/AIInsightsWidget';
import ServerComparisonWidget from '../components/dashboard/ServerComparisonWidget';
import ServerManagementWidget from '../components/dashboard/ServerManagementWidget';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ServerDashboard = () => {
  const { id } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [server, setServer] = useState(null);
  const [serverOwners, setServerOwners] = useState([]);
  const [playerHistory, setPlayerHistory] = useState([]);
  const [playerPredictions, setPlayerPredictions] = useState([]);
  const [latencyHistory, setLatencyHistory] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchServerDashboardData = async () => {
      if (authLoading) return;
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        
        // Fetch server details
        const serverResponse = await api.get(`/servers/${id}`);
        setServer(serverResponse.data.data);
        
        // Fetch server owners
        const ownersResponse = await api.get(`/servers/${id}/owners`);
        setServerOwners(ownersResponse.data.data);
        
        // Check if current user is an owner
        if (user) {
          const isCurrentUserOwner = ownersResponse.data.data.some(
            owner => owner.user_id === user.id
          );
          setIsOwner(isCurrentUserOwner);
          
          // If not an owner and not admin, we'll redirect
          if (!isCurrentUserOwner && user.role !== 'admin') {
            setError('You do not have permission to view this dashboard');
            return;
          }
        }
        
        // Fetch 7-day player history
        const historyResponse = await api.get(`/measurements/${id}/history`, {
          params: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
            interval: '1 hour'
          }
        });
        setPlayerHistory(historyResponse.data.data);
        
        // Fetch latency history
        const latencyResponse = await api.get(`/measurements/${id}/history`, {
          params: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
            interval: '3 hours'
          }
        });
        setLatencyHistory(latencyResponse.data.data);
        
        // Fetch player predictions for next 24 hours
        const predictionsResponse = await api.get(`/predictions/${id}/next24hours`);
        setPlayerPredictions(predictionsResponse.data.data);
        
        // Fetch AI insights
        const insightsResponse = await api.get(`/predictions/${id}/insights`, {
          params: { limit: 5 }
        });
        setInsights(insightsResponse.data.data);
        
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch server dashboard data for ID ${id}`, err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServerDashboardData();
  }, [id, user, isAuthenticated, authLoading]);

  // Handle authentication loading
  if (authLoading) {
    return <LoadingSpinner fullPage />;
  }

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <Navigate to={`/servers/${id}`} replace />;
  }

  // Handle data loading
  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  // Handle errors
  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Handle missing data
  if (!server) {
    return <ErrorMessage message="Server not found" />;
  }

  // Handle permission check (already run in useEffect)
  if (!isOwner && user?.role !== 'admin') {
    return <Navigate to={`/servers/${id}`} replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <ServerDashboardHeader server={server} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Server Trends Widget - Main Chart */}
        <div className="lg:col-span-2">
          <ServerTrendsWidget 
            playerHistory={playerHistory} 
            playerPredictions={playerPredictions} 
          />
        </div>
        
        {/* Uptime Widget */}
        <div>
          <UptimeWidget 
            server={server} 
            uptime={server.stats.uptime_percentage}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* AI Insights Widget */}
        <div>
          <AIInsightsWidget insights={insights} />
        </div>
        
        {/* Server Comparison Widget */}
        <div className="lg:col-span-2">
          <ServerComparisonWidget 
            currentServerId={server.id} 
            serverName={server.name}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Latency Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Latency Over Time</h2>
          <div className="h-64">
            {latencyHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={latencyHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(time) => new Date(time).toLocaleString()} 
                    interval={Math.ceil(latencyHistory.length / 8)}
                  />
                  <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value) => [`${value} ms`, 'Latency']}
                    labelFormatter={(time) => new Date(time).toLocaleString()}
                  />
                  <Bar dataKey="avg_latency" fill="#5865F2" name="Latency" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No latency data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Server Management Widget */}
        <div>
          <ServerManagementWidget 
            server={server} 
            onServerUpdated={setServer}
          />
        </div>
      </div>
    </div>
  );