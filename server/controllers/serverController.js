const Server = require('../models/server');
const ServerMeasurement = require('../models/measurement');
const AIPrediction = require('../models/prediction');
const ServerClaim = require('../models/claim');

// GET /api/servers
// Get all servers with optional filtering and pagination
exports.getAllServers = async (req, res) => {
  try {
    const {
      limit = 20,
      page = 1,
      search = '',
      sort = 'name',
      order = 'ASC',
      gamemode,
      country
    } = req.query;

    // Calculate offset based on page number and limit
    const offset = (page - 1) * limit;

    // Validate sort field to prevent SQL injection
    const validSortFields = ['name', 'player_count', 'country', 'first_seen', 'last_seen'];
    const validatedSort = validSortFields.includes(sort) ? sort : 'name';

    // Validate order direction
    const validatedOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const result = await Server.getAll({
      limit: parseInt(limit),
      offset,
      search,
      sort: validatedSort,
      order: validatedOrder,
      gamemode,
      country
    });

    return res.json({
      success: true,
      data: result.servers,
      pagination: {
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(result.total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Error in getAllServers:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve servers',
      error: err.message
    });
  }
};

// GET /api/servers/featured
// Get featured servers for homepage
exports.getFeaturedServers = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const featuredServers = await Server.getFeatured(parseInt(limit));
    
    // Enrich with latest player counts
    const serversWithStats = await Promise.all(
      featuredServers.map(async (server) => {
        const latestMeasurement = await ServerMeasurement.getLatestForServer(server.id);
        return {
          ...server,
          current_players: latestMeasurement ? latestMeasurement.player_count : 0,
          is_online: latestMeasurement ? latestMeasurement.is_online : false,
          motd: latestMeasurement ? latestMeasurement.motd : '',
          version: latestMeasurement ? latestMeasurement.version : ''
        };
      })
    );

    return res.json({
      success: true,
      data: serversWithStats
    });
  } catch (err) {
    console.error('Error in getFeaturedServers:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured servers',
      error: err.message
    });
  }
};

// GET /api/servers/top
// Get top servers by player count
exports.getTopServers = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const topServers = await Server.getTopByPlayers(parseInt(limit));
    
    return res.json({
      success: true,
      data: topServers
    });
  } catch (err) {
    console.error('Error in getTopServers:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve top servers',
      error: err.message
    });
  }
};

// GET /api/servers/rising
// Get rising servers (growth in the last 24 hours)
exports.getRisingServers = async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const risingServers = await Server.getRising(parseInt(limit));
    
    return res.json({
      success: true,
      data: risingServers
    });
  } catch (err) {
    console.error('Error in getRisingServers:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve rising servers',
      error: err.message
    });
  }
};

// GET /api/servers/:id
// Get a single server by ID with its latest stats
exports.getServerById = async (req, res) => {
  try {
    const { id } = req.params;
    const server = await Server.getById(parseInt(id));
    
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }
    
    // Get latest measurement
    const latestMeasurement = await ServerMeasurement.getLatestForServer(server.id);
    
    // Get uptime percentage
    const uptimePercentage = await ServerMeasurement.getUptimePercentage(server.id, 1);
    
    // Get player count predictions for next 24 hours
    const playerPredictions = await AIPrediction.getNext24HoursPlayerCounts(server.id);
    
    // Get predicted peak time
    const peakPrediction = await AIPrediction.getPredictedPeakTime(server.id);
    
    // Get 24-hour player count history
    const playerHistory = await ServerMeasurement.getLast24HoursPlayerCounts(server.id);
    
    // Get top insights
    const insights = await AIPrediction.getTopInsights(server.id, 3);
    
    const serverData = {
      ...server,
      stats: {
        current_players: latestMeasurement ? latestMeasurement.player_count : 0,
        max_players: server.max_players,
        is_online: latestMeasurement ? latestMeasurement.is_online : false,
        uptime_percentage: uptimePercentage,
        latency_ms: latestMeasurement ? latestMeasurement.latency_ms : null,
        version: latestMeasurement ? latestMeasurement.version : '',
        motd: latestMeasurement ? latestMeasurement.motd : '',
        description: latestMeasurement ? latestMeasurement.description : '',
        favicon_hash: latestMeasurement ? latestMeasurement.favicon_hash : null,
        tags: latestMeasurement ? latestMeasurement.tags : [],
        whitelist_status: latestMeasurement ? latestMeasurement.whitelist_status : false,
        modded_status: latestMeasurement ? latestMeasurement.modded_status : false,
        server_software: latestMeasurement ? latestMeasurement.server_software : '',
        players_sample: latestMeasurement ? latestMeasurement.players_sample : ''
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
    
    return res.json({
      success: true,
      data: serverData
    });
  } catch (err) {
    console.error(`Error in getServerById for ID ${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve server details',
      error: err.message
    });
  }
};

// POST /api/servers
// Create a new server (pending admin approval)
exports.createServer = async (req, res) => {
  try {
    const {
      ip,
      hostname,
      name,
      website_url,
      country,
      gamemode,
      max_players
    } = req.body;

    // Validate required fields
    if (!ip || !hostname || !name || !country || !gamemode || !max_players) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if server already exists
    const existingServer = await Server.getByIpOrHostname(ip) || 
                           await Server.getByIpOrHostname(hostname);
    
    if (existingServer) {
      return res.status(409).json({
        success: false,
        message: 'Server with this IP or hostname already exists',
        serverId: existingServer.id
      });
    }

    // Create the server (inactive until approved by admin)
    const newServer = await Server.create({
      ip,
      hostname,
      name,
      website_url,
      country,
      gamemode: Array.isArray(gamemode) ? gamemode : [gamemode],
      max_players: parseInt(max_players),
      is_active: false // Default to inactive until approved
    });

    return res.status(201).json({
      success: true,
      message: 'Server submitted successfully and pending approval',
      data: newServer
    });
  } catch (err) {
    console.error('Error in createServer:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create server',
      error: err.message
    });
  }
};

// POST /api/servers/:id/claim
// Submit a claim for a server
exports.claimServer = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;

    // Validate required fields
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username and email are required'
      });
    }

    // Check if server exists
    const server = await Server.getById(parseInt(id));
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }

    // Check if server is already claimed
    if (server.has_owner) {
      return res.status(409).json({
        success: false,
        message: 'Server is already claimed'
      });
    }

    // Check if there's already a pending claim for this server by this user
    const hasPendingClaim = await ServerClaim.hasPendingClaim(server.id, email);
    if (hasPendingClaim) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending claim for this server'
      });
    }

    // Create the claim
    const newClaim = await ServerClaim.create({
      server_id: server.id,
      username,
      email
    });

    return res.status(201).json({
      success: true,
      message: 'Claim submitted successfully and pending approval',
      data: {
        claim_id: newClaim.id,
        server_id: newClaim.server_id,
        status: newClaim.status,
        created_at: newClaim.created_at
      }
    });
  } catch (err) {
    console.error(`Error in claimServer for ID ${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit server claim',
      error: err.message
    });
  }
};

// GET /api/servers/stats
// Get global server stats
exports.getGlobalStats = async (req, res) => {
  try {
    // Get total active servers count
    const totalServers = await Server.getTotalActive();
    
    // Get total online players
    const totalPlayers = await ServerMeasurement.getTotalOnlinePlayers();
    
    // Get top servers by player count
    const topServers = await Server.getTopByPlayers(5);
    
    return res.json({
      success: true,
      data: {
        total_servers: totalServers,
        total_players: totalPlayers,
        top_servers: topServers
      }
    });
  } catch (err) {
    console.error('Error in getGlobalStats:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve global stats',
      error: err.message
    });
  }
};