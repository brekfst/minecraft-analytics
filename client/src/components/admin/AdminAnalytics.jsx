// client/src/components/admin/AdminAnalytics.jsx
import React, { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Clock, Users, Calendar } from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../utils/api';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    playerStats: [],
    serverStats: [],
    hourlyDistribution: [],
    countryDistribution: [],
    gamemodeDistribution: []
  });
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        
        // In a real application, you would fetch this data from the API
        // For now, we'll use placeholder data
        
        // Fetch player count analytics
        const playerStatsResponse = await api.get('/admin/analytics/players', {
          params: { timeRange }
        }).catch(() => ({ data: { data: generateMockPlayerStats() } }));
        
        // Fetch server analytics
        const serverStatsResponse = await api.get('/admin/analytics/servers', {
          params: { timeRange }
        }).catch(() => ({ data: { data: generateMockServerStats() } }));
        
        // Fetch peak hours distribution
        const hourlyResponse = await api.get('/admin/analytics/hours')
          .catch(() => ({ data: { data: generateMockHourlyDistribution() } }));
        
        // Fetch country distribution
        const countryResponse = await api.get('/admin/analytics/countries')
          .catch(() => ({ data: { data: generateMockCountryDistribution() } }));
        
        // Fetch gamemode distribution
        const gamemodeResponse = await api.get('/admin/analytics/gamemodes')
          .catch(() => ({ data: { data: generateMockGamemodeDistribution() } }));
        
        setAnalytics({
          playerStats: playerStatsResponse.data.data,
          serverStats: serverStatsResponse.data.data,
          hourlyDistribution: hourlyResponse.data.data,
          countryDistribution: countryResponse.data.data,
          gamemodeDistribution: gamemodeResponse.data.data
        });
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch analytics', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [timeRange]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="rounded-full bg-red-100 p-3 mx-auto w-fit">
          <span className="h-6 w-6 text-red-600">×</span>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="pb-5 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="mt-2 text-sm text-gray-700">
          Overview of platform usage and growth metrics
        </p>
      </div>
      
      {/* Time Range Selector */}
      <div className="mt-6 mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handleTimeRangeChange('week')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              timeRange === 'week'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Last Week
          </button>
          <button
            onClick={() => handleTimeRangeChange('month')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              timeRange === 'month'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => handleTimeRangeChange('quarter')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              timeRange === 'quarter'
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            Last Quarter
          </button>
        </div>
      </div>
      
      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Player Count Trend */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Player Count Trend</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.playerStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} players`, 'Player Count']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Player Count" 
                  stroke="#5865F2" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Server Growth */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <BarChart2 className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Server Growth</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.serverStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Servers']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Bar dataKey="active" name="Active Servers" fill="#10B981" />
                <Bar dataKey="new" name="New Servers" fill="#60A5FA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Hours Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Peak Hours Distribution</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(hour) => `${hour}:00`} 
                />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  labelFormatter={(hour) => `${hour}:00 - ${(hour + 1) % 24}:00`}
                />
                <Legend />
                <Bar dataKey="percentage" name="% of Peak Activity" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Country Distribution */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-5 w-5 text-amber-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Server Countries</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.countryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.countryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gamemode Distribution */}
        <div className="bg-white shadow rounded-lg p-6 col-span-1 lg:col-span-2">
          <div className="flex items-center mb-4">
            <Gamepad className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Popular Gamemodes</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={analytics.gamemodeDistribution}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={100}
                />
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                <Legend />
                <Bar dataKey="value" name="Percentage of Servers" fill="#F87171" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#6C63FF'];

// Mock data generators
const generateMockPlayerStats = () => {
  const data = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate a realistic trend with some daily fluctuation
    const baseCount = 50000;
    const weekendBoost = date.getDay() === 0 || date.getDay() === 6 ? 15000 : 0;
    const randomVariation = Math.random() * 10000 - 5000;
    const growthTrend = i * 100; // Slight upward trend
    
    data.push({
      date: date.toISOString(),
      count: Math.round(baseCount + weekendBoost + randomVariation - growthTrend)
    });
  }
  
  return data;
};

const generateMockServerStats = () => {
  const data = [];
  const now = new Date();
  
  let cumulativeServers = 1200;
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate new servers with some randomness
    const newServers = Math.floor(Math.random() * 15) + 5;
    cumulativeServers += newServers;
    
    data.push({
      date: date.toISOString(),
      active: cumulativeServers,
      new: newServers
    });
  }
  
  return data;
};

const generateMockHourlyDistribution = () => {
  const data = [];
  
  // Peak times typically in the evenings
  const peakHour = 20; // 8 PM
  
  for (let hour = 0; hour < 24; hour++) {
    let percentage;
    
    if (hour >= 8 && hour <= 23) {
      // Calculate percentage based on distance from peak
      const distanceFromPeak = Math.abs(hour - peakHour);
      percentage = 100 - (distanceFromPeak * 8);
      percentage = Math.max(20, percentage); // Minimum of 20%
    } else {
      // Late night/early morning hours
      percentage = 10 + Math.random() * 15;
    }
    
    data.push({
      hour,
      percentage: Math.round(percentage * 10) / 10 // Round to 1 decimal place
    });
  }
  
  return data;
};

const generateMockCountryDistribution = () => {
  return [
    { name: 'US', value: 35 },
    { name: 'DE', value: 15 },
    { name: 'GB', value: 12 },
    { name: 'FR', value: 8 },
    { name: 'CA', value: 7 },
    { name: 'AU', value: 6 },
    { name: 'BR', value: 5 },
    { name: 'Other', value: 12 }
  ];
};

const generateMockGamemodeDistribution = () => {
  return [
    { name: 'Survival', value: 45 },
    { name: 'SkyBlock', value: 28 },
    { name: 'Creative', value: 25 },
    { name: 'Factions', value: 22 },
    { name: 'PvP', value: 18 },
    { name: 'Prison', value: 15 },
    { name: 'Minigames', value: 14 },
    { name: 'RPG', value: 10 }
  ];
};

export default AdminAnalytics;