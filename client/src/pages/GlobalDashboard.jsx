import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import GlobalStatsCards from '../components/dashboard/GlobalStatsCards';
import TopServersTable from '../components/dashboard/TopServersTable';
import RisingServersList from '../components/dashboard/RisingServersList';
import PeakHoursChart from '../components/dashboard/PeakHoursChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const GlobalDashboard = () => {
  const [globalStats, setGlobalStats] = useState(null);
  const [topServers, setTopServers] = useState([]);
  const [risingServers, setRisingServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        setLoading(true);
        
        // Fetch global stats
        const statsResponse = await api.get('/servers/stats');
        setGlobalStats(statsResponse.data.data);
        
        // Fetch top servers by player count
        const topServersResponse = await api.get('/servers/top', {
          params: { limit: 10 }
        });
        setTopServers(topServersResponse.data.data);
        
        // Fetch rising servers
        const risingServersResponse = await api.get('/servers/rising', {
          params: { limit: 4 }
        });
        setRisingServers(risingServersResponse.data.data);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch global dashboard data', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGlobalData();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchGlobalData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Global Dashboard</h1>
        <p className="text-gray-600">Overall statistics across all Minecraft servers</p>
      </div>
      
      {/* Global Stats Cards */}
      <div className="mb-10">
        <GlobalStatsCards
          totalServers={globalStats.total_servers}
          totalPlayers={globalStats.total_players}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Top Servers Table */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Top Servers by Player Count</h2>
            <TopServersTable servers={topServers} />
          </div>
        </div>
        
        {/* Rising Servers */}
        <div>
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Rising Servers</h2>
            <RisingServersList servers={risingServers} />
          </div>
        </div>
      </div>
      
      {/* Peak Hours Chart */}
      <div className="bg-white shadow rounded-lg p-6 mb-10">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Peak Hours (Top Servers)</h2>
        <PeakHoursChart topServers={topServers.slice(0, 5)} />
      </div>
    </div>
  );
};

export default GlobalDashboard;