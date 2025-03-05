// Validation middleware for request data

// Validate server creation data
exports.validateServer = (req, res, next) => {
    const { ip, hostname, name, website_url, country, gamemode, max_players } = req.body;
    const errors = [];
  
    // Check required fields
    if (!ip) errors.push('IP address is required');
    if (!hostname) errors.push('Hostname is required');
    if (!name) errors.push('Server name is required');
    if (!country) errors.push('Country code is required');
    if (!gamemode) errors.push('At least one gamemode is required');
    if (!max_players) errors.push('Maximum players is required');
  
    // Validate IP format
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^([a-fA-F0-9:]+)$/;
    if (ip && !ipRegex.test(ip)) {
      errors.push('Invalid IP address format');
    }
  
    // Validate hostname format
    const hostnameRegex = /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])(\.[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])*$/;
    if (hostname && !hostnameRegex.test(hostname)) {
      errors.push('Invalid hostname format');
    }
  
    // Validate website URL if provided
    if (website_url) {
      try {
        const url = new URL(website_url);
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push('Website URL must use HTTP or HTTPS protocol');
        }
      } catch (e) {
        errors.push('Invalid website URL format');
      }
    }
  
    // Validate country code
    const countryRegex = /^[A-Z]{2}$/;
    if (country && !countryRegex.test(country)) {
      errors.push('Country code must be a 2-letter ISO code (e.g., US, GB)');
    }
  
    // Validate max_players is a number greater than zero
    if (max_players && (isNaN(max_players) || parseInt(max_players) <= 0)) {
      errors.push('Maximum players must be a positive number');
    }
  
    // Validate gamemode is an array or string
    if (gamemode && !Array.isArray(gamemode) && typeof gamemode !== 'string') {
      errors.push('Gamemode must be a string or an array of strings');
    }
  
    // Send validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
  
    next();
  };
  
  // Validate server claim data
  exports.validateClaim = (req, res, next) => {
    const { username, email } = req.body;
    const errors = [];
  
    // Check required fields
    if (!username) errors.push('Username is required');
    if (!email) errors.push('Email is required');
  
    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (username && !usernameRegex.test(username)) {
      errors.push('Username must be 3-20 characters and may contain only letters, numbers, underscores, and hyphens');
    }
  
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email && !emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  
    // Send validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
  
    next();
  };
  
  // Validate measurement data
  exports.validateMeasurement = (req, res, next) => {
    const {
      server_id,
      is_online,
      player_count,
      motd,
      version,
      latency_ms
    } = req.body;
    const errors = [];
  
    // Check required fields
    if (server_id === undefined) errors.push('Server ID is required');
    if (is_online === undefined) errors.push('Online status is required');
    if (!motd) errors.push('MOTD is required');
    if (!version) errors.push('Version is required');
  
    // Validate server_id is a number
    if (server_id !== undefined && (isNaN(server_id) || parseInt(server_id) <= 0)) {
      errors.push('Server ID must be a positive number');
    }
  
    // Validate is_online is a boolean
    if (is_online !== undefined && typeof is_online !== 'boolean') {
      errors.push('Online status must be a boolean');
    }
  
    // Validate player_count is a number greater than or equal to zero
    if (player_count !== undefined && (isNaN(player_count) || parseInt(player_count) < 0)) {
      errors.push('Player count must be a non-negative number');
    }
  
    // Validate latency_ms is a number greater than zero if provided
    if (latency_ms !== undefined && (isNaN(latency_ms) || parseInt(latency_ms) < 0)) {
      errors.push('Latency must be a non-negative number');
    }
  
    // Send validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
  
    next();
  };
  
  // Validate prediction data
  exports.validatePrediction = (req, res, next) => {
    const {
      server_id,
      prediction_timestamp,
      prediction_type,
      prediction_value,
      insight
    } = req.body;
    const errors = [];
  
    // Check required fields
    if (!server_id) errors.push('Server ID is required');
    if (!prediction_timestamp) errors.push('Prediction timestamp is required');
    if (!prediction_type) errors.push('Prediction type is required');
    if (!prediction_value) errors.push('Prediction value is required');
    if (!insight) errors.push('Insight is required');
  
    // Validate server_id is a number
    if (server_id && (isNaN(server_id) || parseInt(server_id) <= 0)) {
      errors.push('Server ID must be a positive number');
    }
  
    // Validate prediction_timestamp is a valid date
    if (prediction_timestamp) {
      try {
        new Date(prediction_timestamp);
      } catch (e) {
        errors.push('Invalid prediction timestamp format');
      }
    }
  
    // Validate prediction_type is one of the allowed types
    const validTypes = ['player_count', 'downtime', 'latency', 'growth'];
    if (prediction_type && !validTypes.includes(prediction_type)) {
      errors.push(`Prediction type must be one of: ${validTypes.join(', ')}`);
    }
  
    // Send validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
  
    next();
  };
  
  // Validate featured server data
  exports.validateFeaturedServer = (req, res, next) => {
    const { server_id, position, end_date } = req.body;
    const errors = [];
  
    // Check required fields
    if (!server_id) errors.push('Server ID is required');
    if (position === undefined) errors.push('Position is required');
  
    // Validate server_id is a number
    if (server_id && (isNaN(server_id) || parseInt(server_id) <= 0)) {
      errors.push('Server ID must be a positive number');
    }
  
    // Validate position is a number greater than or equal to zero
    if (position !== null && (isNaN(position) || parseInt(position) < 0)) {
      errors.push('Position must be a non-negative number or null for automatic positioning');
    }
  
    // Validate end_date is a valid date if provided
    if (end_date) {
      try {
        const endDate = new Date(end_date);
        const now = new Date();
        if (endDate <= now) {
          errors.push('End date must be in the future');
        }
      } catch (e) {
        errors.push('Invalid end date format');
      }
    }
  
    // Send validation errors if any
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
  
    next();
  };