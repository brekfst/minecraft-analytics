// UptimeWidget.jsx
import React from 'react';
import { Activity, Clock } from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip
} from 'recharts';

const UptimeWidget = ({ server, uptime }) => {
  const uptimePercent = Math.round(uptime * 10) / 10; // Round to 1 decimal place
  const downtimePercent = Math.round((100 - uptimePercent) * 10) / 10;
  
  const data = [
    { name: 'Uptime', value: uptimePercent },
    { name: 'Downtime', value: downtimePercent },
  ];
  
  const COLORS = ['#22c55e', '#ef4444'];
  
  return (
    <div className="bg-white shadow rounded-lg p-6 h-full">
      <div className="flex items-center mb-4">
        <Activity className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">Uptime (24h)</h3>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
                contentStyle={{ borderRadius: '8px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{uptimePercent}%</div>
          <p className="text-gray-500">Server availability</p>
        </div>
        
        <div className="mt-4 text-sm text-gray-500 text-center">
          <div className="flex items-center justify-center">
            <Clock className="h-4 w-4 mr-1 text-gray-400" />
            <span>
              Last checked: {new Date(server.stats.last_seen).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};