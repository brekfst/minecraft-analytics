// client/src/components/server/ServerChart.jsx
import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

const ServerChart = ({ playerHistory, playerPredictions }) => {
  // Function to format and merge the data
  const prepareChartData = () => {
    // Convert history data
    const historyData = playerHistory.map((entry) => ({
      time: entry.time ? new Date(entry.time).getTime() : new Date(entry.hour).getTime(),
      actual: entry.avg_player_count || entry.player_count,
      timeLabel: entry.time 
        ? new Date(entry.time).toLocaleString() 
        : new Date(entry.hour).toLocaleString(),
      type: 'Actual'
    }));
    
    // Convert prediction data if available
    const predictionData = playerPredictions ? playerPredictions.map((entry) => ({
      time: new Date(entry.time).getTime(),
      predicted: entry.player_count,
      timeLabel: new Date(entry.time).toLocaleString(),
      type: 'Predicted'
    })) : [];
    
    // Combine both datasets based on time
    const allData = [...historyData, ...predictionData].sort((a, b) => a.time - b.time);
    
    // Find the maximum player count for y-axis scaling
    const maxCount = Math.max(
      ...historyData.map(d => d.actual || 0),
      ...predictionData.map(d => d.predicted || 0),
      1 // Ensure we have a minimum value
    );
    
    return { chartData: allData, maxCount };
  };
  
  const { chartData, maxCount } = prepareChartData();
  
  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No player data available</p>
      </div>
    );
  }
  
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(time) => new Date(time).toLocaleString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={[0, maxCount > 0 ? Math.ceil(maxCount * 1.1) : 10]} 
            allowDecimals={false}
          />
          <Tooltip 
            formatter={(value, name) => [value, name === 'actual' ? 'Actual Players' : 'Predicted Players']}
            labelFormatter={(time) => new Date(time).toLocaleString()}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="actual" 
            name="Actual Players" 
            stroke="#5865F2" 
            strokeWidth={2} 
            dot={{r: 2}}
            activeDot={{r: 6}}
          />
          <Line 
            type="monotone" 
            dataKey="predicted" 
            name="Predicted Players" 
            stroke="#FF9500" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{r: 2}}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-sm text-gray-500 text-center">
        <p>
          Real-time player data (blue) and AI-predicted player counts (orange)
        </p>
      </div>
    </div>
  );
};

export default ServerChart;