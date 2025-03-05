const ServerMeasurement = require('../models/measurement');
const Server = require('../models/server');

// GET /api/measurements/:serverId/latest
// Get the latest measurement for a server
exports.getLatestMeasurement = async (req, res) => {
  try {
    const { serverId } = req.params;
    
    // Check if server exists
    const server = await Server.getById(parseInt(serverId));
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }
    
    const measurement = await ServerMeasurement.getLatestForServer(parseInt(serverId));
    
    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'No measurements found for this server'
      });
    }
    
    return res.json({
      success: true,
      data: measurement
    });
  } catch (err) {
    console.error(`Error in getLatestMeasurement for server ${req.params.serverId}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve latest measurement',
      error: err.message
    });
  }
};

// GET /api/measurements/:serverId/history
// Get historical measurements for a server with time range and optional interval
exports.getServerHistory = async (req, res) => {
  try {
    const { serverId } = req.params;
    const { 
      start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Default to last 24 hours
      end = new Date().toISOString(),
      interval = null // Optional aggregation interval (e.g., '1 hour')
    } = req.query;
    
    // Check if server exists
    const server = await Server.getById(parseInt(serverId));
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }
    
    const measurements = await ServerMeasurement.getForServerInRange(
      parseInt(serverId),
      new Date(start),
      new Date(end),
      interval
    );
    
    return res.json({
      success: true,
      data: measurements,
      meta: {
        server_id: parseInt(serverId),
        start_time: start,
        end_time: end,
        interval: interval,
        count: measurements.length
      }
    });
  } catch (err) {
    console.error(`Error in getServerHistory for server ${req.params.serverId}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve server history',
      error: err.message
    });
  }
};

// GET /api/measurements/:serverId/player-history
// Get player count history for the last 24 hours
exports.getPlayerHistory = async (req, res) => {
  try {
    const { serverId } = req.params;
    
    // Check if server exists
    const server = await Server.getById(parseInt(serverId));
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }
    
    const playerCounts = await ServerMeasurement.getLast24HoursPlayerCounts(parseInt(serverId));
    
    return res.json({
      success: true,
      data: playerCounts
    });
  } catch (err) {
    console.error(`Error in getPlayerHistory for server ${req.params.serverId}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve player history',
      error: err.message
    });
  }
};

// GET /api/measurements/:serverId/uptime
// Get server uptime percentage for a time period
exports.getUptimePercentage = async (req, res) => {
  try {
    const { serverId } = req.params;
    const { days = 1 } = req.query;
    
    // Check if server exists
    const server = await Server.getById(parseInt(serverId));
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }
    
    const uptime = await ServerMeasurement.getUptimePercentage(parseInt(serverId), parseInt(days));
    
    return res.json({
      success: true,
      data: {
        server_id: parseInt(serverId),
        days: parseInt(days),
        uptime_percentage: uptime
      }
    });
  } catch (err) {
    console.error(`Error in getUptimePercentage for server ${req.params.serverId}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve uptime percentage',
      error: err.message
    });
  }
};

// GET /api/measurements/:serverId/peak-hour
// Get server peak hour based on historical data
exports.getPeakHour = async (req, res) => {
  try {
    const { serverId } = req.params;
    
    // Check if server exists
    const server = await Server.getById(parseInt(serverId));
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }
    
    const peakHour = await ServerMeasurement.getPeakHour(parseInt(serverId));
    
    return res.json({
      success: true,
      data: peakHour
    });
  } catch (err) {
    console.error(`Error in getPeakHour for server ${req.params.serverId}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve peak hour',
      error: err.message
    });
  }
};

// POST /api/measurements
// Create a new measurement (typically called by a periodic job or external monitor)
exports.createMeasurement = async (req, res) => {
  try {
    const {
      server_id,
      is_online,
      player_count,
      motd,
      version,
      latency_ms,
      players_sample,
      favicon_hash,
      protocol_version,
      description,
      tags,
      whitelist_status,
      modded_status,
      forge_data,
      server_software
    } = req.body;

    // Validate required fields
    if (
      server_id === undefined || 
      is_online === undefined || 
      !motd || 
      !version
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if server exists
    const server = await Server.getById(parseInt(server_id));
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    // Create the measurement
    const newMeasurement = await ServerMeasurement.create({
      server_id: parseInt(server_id),
      is_online,
      player_count: parseInt(player_count || 0),
      motd,
      version,
      latency_ms: parseInt(latency_ms || 0),
      players_sample: players_sample || '',
      favicon_hash: favicon_hash || null,
      protocol_version: protocol_version ? parseInt(protocol_version) : null,
      description: description || '',
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      whitelist_status: whitelist_status || false,
      modded_status: modded_status || false,
      forge_data: forge_data || null,
      server_software: server_software || ''
    });

    // Update the server's last_seen timestamp
    await Server.update(parseInt(server_id), { last_seen: new Date() });

    return res.status(201).json({
      success: true,
      message: 'Measurement created successfully',
      data: newMeasurement
    });
  } catch (err) {
    console.error('Error in createMeasurement:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create measurement',
      error: err.message
    });
  }
};

// GET /api/measurements/global/player-count
// Get total player count across all active servers
exports.getTotalPlayerCount = async (req, res) => {
  try {
    const totalPlayers = await ServerMeasurement.getTotalOnlinePlayers();
    
    return res.json({
      success: true,
      data: {
        total_players: totalPlayers,
        timestamp: new Date()
      }
    });
  } catch (err) {
    console.error('Error in getTotalPlayerCount:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve total player count',
      error: err.message
    });
  }
};