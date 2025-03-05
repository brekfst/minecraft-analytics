const ServerMeasurement = require('../models/measurement');
const Server = require('../models/server');

class MeasurementService {
  // Get the latest measurement for a server
  static async getLatestMeasurement(serverId) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(serverId));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      const measurement = await ServerMeasurement.getLatestForServer(parseInt(serverId));
      
      if (!measurement) {
        const error = new Error('No measurements found for this server');
        error.statusCode = 404;
        throw error;
      }
      
      return measurement;
    } catch (error) {
      console.error('Error in getLatestMeasurement:', error);
      throw error;
    }
  }

  // Get server history
  static async getServerHistory(serverId, options = {}) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(serverId));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      const { 
        start = new Date(Date.now() - 24 * 60 * 60 * 1000), 
        end = new Date(),
        interval = null 
      } = options;

      return await ServerMeasurement.getForServerInRange(
        parseInt(serverId),
        start,
        end,
        interval
      );
    } catch (error) {
      console.error('Error in getServerHistory:', error);
      throw error;
    }
  }

  // Get player history for a server
  static async getPlayerHistory(serverId) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(serverId));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      return await ServerMeasurement.getLast24HoursPlayerCounts(parseInt(serverId));
    } catch (error) {
      console.error('Error in getPlayerHistory:', error);
      throw error;
    }
  }

  // Get server uptime percentage
  static async getUptimePercentage(serverId, days = 1) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(serverId));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      return await ServerMeasurement.getUptimePercentage(
        parseInt(serverId), 
        parseInt(days)
      );
    } catch (error) {
      console.error('Error in getUptimePercentage:', error);
      throw error;
    }
  }

  // Get peak hour for a server
  static async getPeakHour(serverId) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(serverId));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      return await ServerMeasurement.getPeakHour(parseInt(serverId));
    } catch (error) {
      console.error('Error in getPeakHour:', error);
      throw error;
    }
  }

  // Create a new measurement
  static async createMeasurement(measurementData) {
    try {
      // Validate server exists
      const server = await Server.getById(parseInt(measurementData.server_id));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      // Prepare measurement data
      const preparedData = {
        server_id: parseInt(measurementData.server_id),
        is_online: measurementData.is_online,
        player_count: parseInt(measurementData.player_count || 0),
        motd: measurementData.motd,
        version: measurementData.version,
        latency_ms: parseInt(measurementData.latency_ms || 0),
        players_sample: measurementData.players_sample || '',
        favicon_hash: measurementData.favicon_hash || null,
        protocol_version: measurementData.protocol_version ? parseInt(measurementData.protocol_version) : null,
        description: measurementData.description || '',
        tags: Array.isArray(measurementData.tags) ? measurementData.tags : (measurementData.tags ? [measurementData.tags] : []),
        whitelist_status: measurementData.whitelist_status || false,
        modded_status: measurementData.modded_status || false,
        forge_data: measurementData.forge_data || null,
        server_software: measurementData.server_software || ''
      };

      return await ServerMeasurement.create(preparedData);
    } catch (error) {
      console.error('Error in createMeasurement:', error);
      throw error;
    }
  }

  // Get total online players
  static async getTotalPlayerCount() {
    try {
      return await ServerMeasurement.getTotalOnlinePlayers();
    } catch (error) {
      console.error('Error in getTotalPlayerCount:', error);
      throw error;
    }
  }
}

module.exports = MeasurementService;