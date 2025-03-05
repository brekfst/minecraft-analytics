// ServerComparisonWidget.jsx
import React, { useState, useEffect } from 'react';
import { BarChart2, Search } from 'lucide-react';
import api from '../../utils/api';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const ServerComparisonWidget = ({ currentServerId, serverName }) => {
  const [servers, setServers] = useState([]);
  const [selectedServerId, setSelectedServerId] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch top servers for comparison
  useEffect(() => {
    const fetchTopServers = async () => {
      try {
        const response = await api.get('/servers/top', { params: { limit: 10 } });
        // Filter out the current server
        const filteredServers = response.data.data.filter(
          server => server.id !== parseInt(currentServerId)
        );
        setServers(filteredServers);
      } catch (err) {
        console.error('Error fetching top servers', err);
        setError('Failed to load servers for comparison');
      }
    };
    
    fetchTopServers();
  }, [currentServerId]);
  
  // When a server is selected for comparison, fetch comparison data
  useEffect(() => {
    if (!selectedServerId) return;
    
    const fetchComparisonData = async () => {
      setLoading(true);
      try {
        // Get player history for current server
        const currentServerResponse = await api.get(`/measurements/${currentServerId}/player-history`);
        const currentServerData = currentServerResponse.data.data;
        
        // Get player history for comparison server
        const comparisonServerResponse = await api.get(`/measurements/${selectedServerId}/player-history`);
        const comparisonServerData = comparisonServerResponse.data.data;
        
        // Get comparison server details
        const serverResponse = await api.get(`/servers/${selectedServerId}`);
        const comparisonServer = serverResponse.data.data;
        
        // Prepare data for chart
        const preparedData = prepareComparisonData(
          currentServerData,
          comparisonServerData,
          serverName,
          comparisonServer.name
        );
        
        setComparisonData({
          chartData: preparedData,
          server: comparisonServer
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching comparison data', err);
        setError('Failed to load comparison data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComparisonData();
  }, [selectedServerId, currentServerId, serverName]);
  
  // Prepare data for comparison chart
  const prepareComparisonData = (currentData, comparisonData, currentName, comparisonName) => {
    // Create a map of times to data points
    const timeMap = new Map();
    
    // Add current server data
    currentData.forEach(entry => {
      const time = new Date(entry.hour).getTime();
      timeMap.set(time, {
        time,
        timeLabel: new Date(entry.hour).toLocaleString(),
        [currentName]: entry.avg_player_count
      });
    });
    
    // Add comparison server data
    comparisonData.forEach(entry => {
      const time = new Date(entry.hour).getTime();
      const existing = timeMap.get(time) || { 
        time, 
        timeLabel: new Date(entry.hour).toLocaleString() 
      };
      
      timeMap.set(time, {
        ...existing,
        [comparisonName]: entry.avg_player_count
      });
    });
    
    // Convert map to array and sort by time
    return Array.from(timeMap.values()).sort((a, b) => a.time - b.time);
  };
  
  // Search and filter servers
  const filteredServers = searchQuery
    ? servers.filter(server => 
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (server.hostname && server.hostname.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : servers;
  
  return (
    <div className="bg-white shadow rounded-lg p-6 h-full">
      <div className="flex items-center mb-4">
        <BarChart2 className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Server Comparison</h3>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for a server to compare"
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="mb-4 max-h-40 overflow-y-auto">
        {filteredServers.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredServers.map(server => (
              <li key={server.id} className="py-2">
                <button
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedServerId === server.id
                      ? 'bg-blue-100 text-blue-800'
                      : 'text-gray-800 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedServerId(server.id)}
                >
                  <div className="font-medium">{server.name}</div>
                  <div className="text-xs text-gray-500">{server.hostname || server.ip}</div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No servers available for comparison
          </div>
        )}
      </div>
      
      {loading && (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="h-64 flex items-center justify-center text-center">
          <div>
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      )}
      
      {!loading && !error && comparisonData && (
        <div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData.chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  type="number" 
                  scale="time" 
                  tickFormatter={(time) => {
                    const date = new Date(time);
                    return `${date.getHours()}:00`;
                  }}
                />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  labelFormatter={(time) => new Date(time).toLocaleString()}
                  formatter={(value, name) => [value, name]}
                />
                <Legend />
                <Bar dataKey={serverName} fill="#5865F2" name={serverName} />
                <Bar dataKey={comparisonData.server.name} fill="#FF9500" name={comparisonData.server.name} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>24-hour player count comparison</p>
          </div>
        </div>
      )}
      
      {!loading && !error && !comparisonData && !selectedServerId && (
        <div className="h-64 flex items-center justify-center text-center">
          <div>
            <BarChart2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Select a server to compare</p>
          </div>
        </div>
      )}
    </div>
  );
};