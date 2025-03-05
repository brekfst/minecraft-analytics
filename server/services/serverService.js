const Server = require('../models/server');
const ServerMeasurement = require('../models/measurement');
const AIPrediction = require('../models/prediction');

class ServerService {
  // Get all servers with filtering and pagination
  static async listServers(options = {}) {
    try {
      return await Server.getAll(options);
    } catch (error) {
      console.error('Error in listServers:', error);
      throw error;
    }
  }

  // Create a new server
  static async createServer(serverData) {
    try {
      // Check if server already exists
      const existingServer = await Server.getByIpOrHostname(serverData.ip) || 
                             await Server.getByIpOrHostname(serverData.hostname);
      
      if (existingServer) {
        const error = new Error('Server with this IP or hostname already exists');
        error.statusCode = 409;
        error.serverId = existingServer.id;
        throw error;
      }

      return await Server.create({
        ...serverData,
        is_active: false // Default to inactive until approved
      });
    } catch (error) {
      console.error('Error in createServer:', error);
      throw error;
    }
  }

  // Get server details with enriched information
  static async getServerDetails(serverId) {
    try {
      const server = await Server.getById(serverId);
      
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }

      // Fetch additional data
      const [
        latestMeasurement, 
        uptimePercentage, 
        playerPredictions, 
        peakPrediction,
        playerHistory,
        insights
      ] = await Promise.all([
        ServerMeasurement.getLatestForServer(serverId),
        ServerMeasurement.getUptimePercentage(serverId),
        AIPrediction.getNext24HoursPlayerCounts(serverId),
        AIPrediction.getPredictedPeakTime(serverId),
        ServerMeasurement.getLast24HoursPlayerCounts(serverId),
        AIPrediction.getTopInsights(serverId, 3)
      ]);

      return {
        ...server,
        stats: {
          current_players: latestMeasurement?.player_count || 0,
          max_players: server.max_players,
          is_online: latestMeasurement?.is_online || false,
          uptime_percentage: uptimePercentage,
          latency_ms: latestMeasurement?.latency_ms || null,
          version: latestMeasurement?.version || '',
          motd: latestMeasurement?.motd || '',
          description: latestMeasurement?.description || '',
          favicon_hash: latestMeasurement?.favicon_hash || null,
        },
        predictions: {
          player_counts: playerPredictions,
          peak: peakPrediction,
          insights: insights
        },
        history: {
          player_counts: playerHistory
        }
      };
    } catch (error) {
      console.error('Error in getServerDetails:', error);
      throw error;
    }
  }

  // Get featured servers
  static async getFeaturedServers(limit = 6) {
    try {
      return await Server.getFeatured(limit);
    } catch (error) {
      console.error('Error in getFeaturedServers:', error);
      throw error;
    }
  }

  // Get top servers by player count
  static async getTopServers(limit = 5) {
    try {
      return await Server.getTopByPlayers(limit);
    } catch (error) {
      console.error('Error in getTopServers:', error);
      throw error;
    }
  }

  // Get rising servers
  static async getRisingServers(limit = 4) {
    try {
      return await Server.getRising(limit);
    } catch (error) {
      console.error('Error in getRisingServers:', error);
      throw error;
    }
  }

  // Get global stats
  static async getGlobalStats() {
    try {
      const [totalServers, totalPlayers, topServers] = await Promise.all([
        Server.getTotalActive(),
        ServerMeasurement.getTotalOnlinePlayers(),
        Server.getTopByPlayers(5)
      ]);

      return {
        total_servers: totalServers,
        total_players: totalPlayers,
        top_servers: topServers
      };
    } catch (error) {
      console.error('Error in getGlobalStats:', error);
      throw error;
    }
  }
}

module.exports = ServerService;