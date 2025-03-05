// PeakHoursChart.jsx
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import api from '../../utils/api';

const PeakHoursChart = ({ topServers = [] }) => {
  const [peakData, setPeakData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPeakHoursData = async () => {
      if (topServers.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch peak hour data for each server
        const peakHoursPromises = topServers.map(server => 
          api.get(`/measurements/${server.id}/peak-hour`)
            .then(response => ({
              serverId: server.id,
              serverName: server.name,
              ...response.data.data
            }))
            .catch(err => {
              console.error(`Error fetching peak hour for server ${server.id}`, err);
              return null;
            })
        );
        
        const results = await Promise.all(peakHoursPromises);
        const validResults = results.filter(Boolean);
        
        // Prepare data for the chart
        const hoursData = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: 0,
          servers: []
        }));
        
        validResults.forEach(result => {
          if (result.hour !== null) {
            const hourIndex = parseInt(result.hour);
            hoursData[hourIndex].count += 1;
            hoursData[hourIndex].servers.push({
              id: result.serverId,
              name: result.serverName,
              players: result.avg_player_count
            });
          }
        });
        
        setPeakData(hoursData);
        setError(null);
      } catch (err) {
        console.error('Error fetching peak hours data', err);
        setError('Failed to load peak hours data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPeakHoursData();
  }, [topServers]);

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 flex items-center justify-center text-center">
        <div>
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (peakData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-center">
        <div>
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No peak hours data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={peakData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="hour" 
            tickFormatter={(hour) => `${hour}:00`}
          />
          <YAxis allowDecimals={false} />
          <Tooltip 
            formatter={(value, name) => [value, 'Servers with peak']}
            labelFormatter={(hour) => `Hour: ${hour}:00`}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="custom-tooltip bg-white p-3 border border-gray-200 shadow-md rounded-md">
                    <p className="font-medium text-gray-900">{`${label}:00 - ${(label + 1) % 24}:00`}</p>
                    <p className="text-blue-600">{`${data.count} server(s) peak at this hour`}</p>
                    {data.servers.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-500">Servers:</p>
                        <ul className="text-xs text-gray-600">
                          {data.servers.map((server, i) => (
                            <li key={i}>{server.name} ({server.players} players)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" fill="#5865F2" name="Servers with peak" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
