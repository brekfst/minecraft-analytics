import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

// Create the authentication context
const AuthContext = createContext(null);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user from local storage on initial render
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Set token on API instance
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token is still valid by making a request to the auth check endpoint
          await api.get('/auth/check');
          
          // If request doesn't throw, token is valid
          setUser(JSON.parse(userData));
          setIsAuthenticated(true);
        } catch (err) {
          // Token invalid or expired, clear localStorage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    
    const { token, user } = response.data.data;
    
    // Store token and user in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set token on API instance
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Update state
    setUser(user);
    setIsAuthenticated(true);
    
    return user;
  };

  // Register function
  const register = async (username, email, password) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
    });
    
    const { token, user } = response.data.data;
    
    // Store token and user in localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set token on API instance
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Update state
    setUser(user);
    setIsAuthenticated(true);
    
    return user;
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint if needed
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Remove token from API instance
      delete api.defaults.headers.common['Authorization'];
      
      // Update state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Update user function
  const updateUser = async (userData) => {
    const response = await api.put('/auth/profile', userData);
    
    const updatedUser = response.data.data;
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update state
    setUser(updatedUser);
    
    return updatedUser;
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;