import React, { useState, useEffect } from 'react';
import Hero from '../components/home/Hero';
import FeaturedServers from '../components/home/FeaturedServers';
import AiTeaser from '../components/home/AiTeaser';
import ServerCreation from '../components/home/ServerCreation';
import StatsOverview from '../components/home/StatsOverview';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const HomePage = () => {
  const [featuredServers, setFeaturedServers] = useState([]);
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured servers
        const featuredResponse = await api.get('/servers/featured');
        setFeaturedServers(featuredResponse.data.data);
        
        // Fetch global stats
        const statsResponse = await api.get('/servers/stats');
        setStats(statsResponse.data.data);
        
        // Fetch a random prediction for the AI teaser
        if (featuredResponse.data.data.length > 0) {
          const randomServer = featuredResponse.data.data[Math.floor(Math.random() * featuredResponse.data.data.length)];
          try {
            const predictionResponse = await api.get(`/predictions/${randomServer.id}/insights`);
            setPredictions(predictionResponse.data.data);
          } catch (predErr) {
            console.error('Failed to fetch predictions', predErr);
            setPredictions([]);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch home page data', err);
        setError('Failed to load content. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="min-h-screen">
      <Hero />
      
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        {stats && (
          <StatsOverview stats={stats} />
        )}
        
        {/* Featured Servers */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Featured Servers</h2>
          <FeaturedServers servers={featuredServers} />
        </section>
        
        {/* AI Teaser */}
        <section className="mb-16 bg-blue-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            AI-Powered Insights
          </h2>
          <AiTeaser predictions={predictions} />
        </section>
        
        {/* Server Creation */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Your Server</h2>
          <ServerCreation />
        </section>
      </div>
    </div>
  );
};

export default HomePage;