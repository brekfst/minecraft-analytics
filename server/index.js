const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const serverRoutes = require('./routes/servers');
const measurementRoutes = require('./routes/measurements');
const predictionRoutes = require('./routes/predictions');
const adminRoutes = require('./routes/admin');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Configure middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS for all routes
app.use(compression()); // Compress responses
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body
app.use(morgan('combined')); // Request logging

// API routes
app.use('/api/servers', serverRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/admin', adminRoutes);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing