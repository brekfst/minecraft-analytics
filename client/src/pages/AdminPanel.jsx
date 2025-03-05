import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

// Admin components
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminStats from '../components/admin/AdminStats';
import PendingServers from '../components/admin/PendingServers';
import PendingClaims from '../components/admin/PendingClaims';
import FeaturedServers from '../components/admin/FeaturedServers';
import AdminAnalytics from '../components/admin/AdminAnalytics';

const AdminPanel = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminStats = async () => {
      if (authLoading) return;
      
      if (!isAuthenticated) {
        navigate('/', { replace: true });
        return;
      }
      
      if (user && user.role !== 'admin') {
        navigate('/', { replace: true });
        return;
      }
      
      try {
        setLoading(true);
        const response = await api.get('/admin/stats');
        setAdminStats(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
        setError(err.response?.data?.message || 'Failed to load admin statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminStats();
  }, [user, isAuthenticated, authLoading, navigate]);

  // Handle authentication loading
  if (authLoading) {
    return <LoadingSpinner fullPage />;
  }

  // Redirect if not authenticated or not admin
  if (!authLoading && (!isAuthenticated || (user && user.role !== 'admin'))) {
    return <Navigate to="/" replace />;
  }

  // Handle data loading
  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  // Handle errors
  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* Admin Sidebar */}
      <div className="w-full md:w-64 flex-shrink-0">
        <AdminSidebar stats={adminStats} />
      </div>
      
      {/* Main Content */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<AdminStats stats={adminStats} />} />
          <Route path="/pending-servers" element={<PendingServers />} />
          <Route path="/pending-claims" element={<PendingClaims />} />
          <Route path="/featured-servers" element={<FeaturedServers />} />
          <Route path="/analytics" element={<AdminAnalytics />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;