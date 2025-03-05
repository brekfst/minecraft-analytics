const AIPrediction = require('../models/prediction');
const Server = require('../models/server');

class PredictionService {
  // Get latest predictions for a server by type
  static async getLatestPredictions(serverId, predictionType, limit = 5) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(serverId));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      // Validate prediction type
      const validTypes = ['player_count', 'downtime', 'latency', 'growth'];
      if (!validTypes.includes(predictionType)) {
        const error = new Error('Invalid prediction type');
        error.statusCode = 400;
        throw error;
      }

      return await AIPrediction.getLatestForServer(
        parseInt(serverId),
        predictionType,
        parseInt(limit)
      );
    } catch (error) {
      console.error(`Error in getLatestPredictions for type ${predictionType}:`, error);
      throw error;
    }
  }

  // Get predictions for a server within a time range
  static async getPredictionsInRange(serverId, predictionType, options = {}) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(serverId));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      // Validate prediction type
      const validTypes = ['player_count', 'downtime', 'latency', 'growth'];
      if (!validTypes.includes(predictionType)) {
        const error = new Error('Invalid prediction type');
        error.statusCode = 400;
        throw error;
      }

      const { 
        start = new Date(), 
        end = new Date(Date.now() + 24 * 60 * 60 * 1000) 
      } = options;

      return await AIPrediction.getForServerInRange(
        parseInt(serverId),
        predictionType,
        start,
        end
      );
    } catch (error) {
      console.error('Error in getPredictionsInRange:', error);
      throw error;
    }
  }

  // Get predicted player counts for next 24 hours
  static async getNext24HoursPredictions(serverId) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(serverId));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      return await AIPrediction.getNext24HoursPlayerCounts(parseInt(serverId));
    } catch (error) {
      console.error('Error in getNext24HoursPredictions:', error);
      throw error;
    }
  }

  // Get predicted peak time for a server
  static async getPredictedPeak(serverId) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(serverId));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      return await AIPrediction.getPredictedPeakTime(parseInt(serverId));
    } catch (error) {
      console.error('Error in getPredictedPeak:', error);
      throw error;
    }
  }

  // Get predicted downtime for a server
  static async getPredictedDowntime(serverId) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(serverId));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      return await AIPrediction.getPredictedDowntime(parseInt(serverId));
    } catch (error) {
      console.error('Error in getPredictedDowntime:', error);
      throw error;
    }
  }

  // Get top insights for a server
  static async getTopInsights(serverId, limit = 5) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(serverId));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      return await AIPrediction.getTopInsights(
        parseInt(serverId), 
        parseInt(limit)
      );
    } catch (error) {
      console.error('Error in getTopInsights:', error);
      throw error;
    }
  }

  // Create a new prediction
  static async createPrediction(predictionData) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(predictionData.server_id));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      // Validate prediction type
      const validTypes = ['player_count', 'downtime', 'latency', 'growth'];
      if (!validTypes.includes(predictionData.prediction_type)) {
        const error = new Error('Invalid prediction type');
        error.statusCode = 400;
        throw error;
      }

      // Prepare prediction data
      const preparedData = {
        server_id: parseInt(predictionData.server_id),
        prediction_timestamp: new Date(predictionData.prediction_timestamp),
        prediction_type: predictionData.prediction_type,
        prediction_value: predictionData.prediction_value,
        insight: predictionData.insight
      };

      return await AIPrediction.create(preparedData);
    } catch (error) {
      console.error('Error in createPrediction:', error);
      throw error;
    }
  }
}

module.exports = PredictionService;