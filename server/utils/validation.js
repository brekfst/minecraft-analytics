// Validation middleware for request data
const validator = {
    // Common validation utilities
    isValidEmail: (email) => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(email);
    },
  
    isValidIP: (ip) => {
      const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$|^([a-fA-F0-9:]+)$/;
      return ipRegex.test(ip);
    },
  
    isValidHostname: (hostname) => {
      const hostnameRegex = /^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])(\.[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])*$/;
      return hostnameRegex.test(hostname);
    },
  
    // Validate server creation data
    validateServerCreation: (data) => {
      const errors = [];
  
      // Required field checks
      if (!data.ip) errors.push('IP address is required');
      if (!data.hostname) errors.push('Hostname is required');
      if (!data.name) errors.push('Server name is required');
      if (!data.country) errors.push('Country is required');
      if (!data.gamemode) errors.push('At least one gamemode is required');
      if (!data.max_players) errors.push('Maximum players is required');
  
      // Validate IP format
      if (data.ip && !validator.isValidIP(data.ip)) {
        errors.push('Invalid IP address format');
      }
  
      // Validate hostname format
      if (data.hostname && !validator.isValidHostname(data.hostname)) {
        errors.push('Invalid hostname format');
      }
  
      // Validate website URL if provided
      if (data.website_url) {
        try {
          const url = new URL(data.website_url);
          if (!['http:', 'https:'].includes(url.protocol)) {
            errors.push('Website URL must use HTTP or HTTPS protocol');
          }
        } catch (e) {
          errors.push('Invalid website URL format');
        }
      }
  
      // Validate country code
      const countryRegex = /^[A-Z]{2}$/;
      if (data.country && !countryRegex.test(data.country)) {
        errors.push('Country code must be a 2-letter ISO code (e.g., US, GB)');
      }
  
      // Validate max_players is a number greater than zero
      if (data.max_players && (isNaN(data.max_players) || parseInt(data.max_players) <= 0)) {
        errors.push('Maximum players must be a positive number');
      }
  
      // Validate gamemode is an array or string
      if (data.gamemode && !Array.isArray(data.gamemode) && typeof data.gamemode !== 'string') {
        errors.push('Gamemode must be a string or an array of strings');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    },
  
    // Validate server claim data
    validateServerClaim: (data) => {
      const errors = [];
  
      // Required field checks
      if (!data.username) errors.push('Username is required');
      if (!data.email) errors.push('Email is required');
  
      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      if (data.username && !usernameRegex.test(data.username)) {
        errors.push('Username must be 3-20 characters and may contain only letters, numbers, underscores, and hyphens');
      }
  
      // Validate email format
      if (data.email && !validator.isValidEmail(data.email)) {
        errors.push('Invalid email format');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    },
  
    // Validate measurement data
    validateMeasurement: (data) => {
      const errors = [];
  
      // Required field checks
      if (data.server_id === undefined) errors.push('Server ID is required');
      if (data.is_online === undefined) errors.push('Online status is required');
      if (!data.motd) errors.push('MOTD is required');
      if (!data.version) errors.push('Version is required');
  
      // Validate server_id is a number
      if (data.server_id !== undefined && (isNaN(data.server_id) || parseInt(data.server_id) <= 0)) {
        errors.push('Server ID must be a positive number');
      }
  
      // Validate is_online is a boolean
      if (data.is_online !== undefined && typeof data.is_online !== 'boolean') {
        errors.push('Online status must be a boolean');
      }
  
      // Validate player_count is a number greater than or equal to zero
      if (data.player_count !== undefined && (isNaN(data.player_count) || parseInt(data.player_count) < 0)) {
        errors.push('Player count must be a non-negative number');
      }
  
      // Validate latency_ms is a number greater than zero if provided
      if (data.latency_ms !== undefined && (isNaN(data.latency_ms) || parseInt(data.latency_ms) < 0)) {
        errors.push('Latency must be a non-negative number');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    },
  
    // Validate prediction data
    validatePrediction: (data) => {
      const errors = [];
      const validTypes = ['player_count', 'downtime', 'latency', 'growth'];
  
      // Required field checks
      if (!data.server_id) errors.push('Server ID is required');
      if (!data.prediction_timestamp) errors.push('Prediction timestamp is required');
      if (!data.prediction_type) errors.push('Prediction type is required');
      if (!data.prediction_value) errors.push('Prediction value is required');
      if (!data.insight) errors.push('Insight is required');
  
      // Validate server_id is a number
      if (data.server_id && (isNaN(data.server_id) || parseInt(data.server_id) <= 0)) {
        errors.push('Server ID must be a positive number');
      }
  
      // Validate prediction_timestamp is a valid date
      if (data.prediction_timestamp) {
        try {
          new Date(data.prediction_timestamp);
        } catch (e) {
          errors.push('Invalid prediction timestamp format');
        }
      }
  
      // Validate prediction_type is one of the allowed types
      if (data.prediction_type && !validTypes.includes(data.prediction_type)) {
        errors.push(`Prediction type must be one of: ${validTypes.join(', ')}`);
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    },
  
    // Validate featured server data
    validateFeaturedServer: (data) => {
      const errors = [];
  
      // Required field checks
      if (!data.server_id) errors.push('Server ID is required');
      if (data.position === undefined) errors.push('Position is required');
  
      // Validate server_id is a number
      if (data.server_id && (isNaN(data.server_id) || parseInt(data.server_id) <= 0)) {
        errors.push('Server ID must be a positive number');
      }
  
      // Validate position is a number greater than or equal to zero
      if (data.position !== null && (isNaN(data.position) || parseInt(data.position) < 0)) {
        errors.push('Position must be a non-negative number or null for automatic positioning');
      }
  
      // Validate end_date is a valid date if provided
      if (data.end_date) {
        try {
          const endDate = new Date(data.end_date);
          const now = new Date();
          if (endDate <= now) {
            errors.push('End date must be in the future');
          }
        } catch (e) {
          errors.push('Invalid end date format');
        }
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  };
  
  module.exports = validator;