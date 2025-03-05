import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import HomePage from './pages/HomePage';
import ServerPage from './pages/ServerPage';
import ServerDashboard from './pages/ServerDashboard';
import GlobalDashboard from './pages/GlobalDashboard';
import AdminPanel from './pages/AdminPanel';
import NotFoundPage from './pages/NotFoundPage';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/servers/:id" element={<ServerPage />} />
                <Route path="/dashboard/servers/:id" element={<ServerDashboard />} />
                <Route path="/dashboard/global" element={<GlobalDashboard />} />
                <Route path="/admin/*" element={<AdminPanel />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;