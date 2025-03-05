const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
require('dotenv').config();

// Middleware to authenticate users with JWT
exports.authenticateUser = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists and is active
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user'
      });
    }
    
    // Attach user information to request
    req.user = userResult.rows[0];
    
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Authentication error:', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: err.message
    });
  }
};

// Middleware to authenticate admin users
exports.authenticateAdmin = async (req, res, next) => {
  try {
    // First authenticate the user
    await exports.authenticateUser(req, res, () => {
      // Check if the user is an admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        });
      }
      
      next();
    });
  } catch (err) {
    console.error('Admin authentication error:', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: err.message
    });
  }
};

// Middleware to authenticate API keys for external integrations
exports.authenticateApiKey = async (req, res, next) => {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }
    
    // In a real application, you would check the API key against a database
    // For this example, we'll use a simple environment variable comparison
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }
    
    next();
  } catch (err) {
    console.error('API key authentication error:', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: err.message
    });
  }
};

// Optional authentication middleware
exports.optionalAuth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, continue without authentication
      req.user = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );
    
    // Attach user information to request if found
    req.user = userResult.rows.length > 0 ? userResult.rows[0] : null;
    
    next();
  } catch (err) {
    // Continue without authentication on any error
    req.user = null;
    next();
  }
};

// Middleware to check if the user owns a server
exports.isServerOwner = async (req, res, next) => {
  try {
    // First authenticate the user
    await exports.authenticateUser(req, res, async () => {
      const { serverId } = req.params;
      
      // Check if the user owns the server
      const ownershipResult = await query(
        'SELECT * FROM server_owners WHERE server_id = $1 AND user_id = $2',
        [parseInt(serverId), req.user.id]
      );
      
      if (ownershipResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to manage this server'
        });
      }
      
      next();
    });
  } catch (err) {
    console.error('Server ownership check error:', err);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: err.message
    });
  }
};