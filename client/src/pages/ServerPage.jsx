import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import ServerHeader from '../components/server/ServerHeader';
import ServerStats from '../components/server/ServerStats';
import ServerChart from '../components/server/ServerChart';
import ServerDetails from '../components/server/ServerDetails';
import ServerClaim from '../components/server/ServerClaim';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const ServerPage = () => {
  const { id } = useParams();
  const [server, setServer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerHistory, setPlayerHistory] = useState([]);
  const [playerPredictions, setPlayerPredictions] = useState([]);

  useEffect(() => {
    const fetchServerData = async () => {
      try {
        setLoading(true);
        
        // Fetch server details
        const response = await api.get(`/servers/${id}`);
        setServer(response.data.data);
        
        // Fetch 24-hour player history
        const historyResponse = await api.get(`/measurements/${id}/player-history`);
        setPlayerHistory(historyResponse.data.data);
        
        // Fetch player predictions for next 24 hours
        const predictionsResponse = await api.get(`/predictions/${id}/next24hours`);
        setPlayerPredictions(predictionsResponse.data.data);
        
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch server with ID ${id}`, err);
        setError(err.response?.data?.message || 'Failed to load server data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchServerData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!server) {
    return <ErrorMessage message="Server not found" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Server Header */}
      <ServerHeader server={server} />
      
      {/* Stats Row */}
      <div className="mb-10">
        <ServerStats 
          currentPlayers={server.stats.current_players} 
          maxPlayers={server.stats.max_players}
          predictedPeak={server.predictions.peak}
          uptime={server.stats.uptime_percentage}
        />
      </div>
      
      {/* Player Count Chart */}
      <div className="bg-white shadow rounded-lg p-6 mb-10">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Player Activity</h2>
        <ServerChart 
          playerHistory={playerHistory} 
          playerPredictions={playerPredictions} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Server Details */}
        <div className="lg:col-span-2">
          <ServerDetails server={server} />
        </div>
        
        {/* Server Claim */}
        <div>
          <ServerClaim 
            serverId={server.id} 
            hasOwner={server.has_owner}
          />
          
          {/* AI Insights */}
          <div className="bg-white shadow rounded-lg p-6 mt-8">
            <h2 className="text-xl font-bold mb-4 text-gray-800">AI Insights</h2>
            {server.predictions.insights.length > 0 ? (
              <ul className="space-y-3">
                {server.predictions.insights.map((insight, index) => (
                  <li key={index} className="border-l-4 border-blue-500 pl-4 py-1">
                    {insight.insight}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No insights available for this server yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerPage;