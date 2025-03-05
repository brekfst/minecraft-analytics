const AIPrediction = require('../models/prediction');
const Server = require('../models/server');

// GET /api/predictions/:serverId/latest/:type
// Get the latest predictions for a server by type
exports.getLatestPredictions = async (req, res) => {
  try {
    const { serverId, type } = req.params;
    const { limit = 5 } = req.query;
    
    // Check if server exists
    const server = await Server.getById(parseInt(serverId));
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }
    
    // Validate prediction type
    const validTypes = ['player_count', 'downtime', 'latency', 'growth'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid prediction type'
      });
    }
    
    const predictions = await AIPrediction.getLatestForServer(
      parseInt(serverId),
      type,
      parseInt(limit)
    );
    
    return res.json({
      success: true,
      data: predictions
    });
  } catch (err) {
    console.error(`Error in getLatestPredictions for server ${req.params.serverId} and type ${req.params.type}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve predictions',
      error: err.message
    });
  }
};

// GET /api/predictions/:serverId/range/:type
// Get predictions for a server by type within a time range
exports.getPredictionsInRange = async (req, res) => {
  try {
    const { serverId, type } = req.params;
    const { 
      start = new Date().toISOString(), // Default to now
      end = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Default to 24 hours from now
    } = req.query;
    
    // Check if server exists
    const server = await Server.getById(parseInt(serverId));
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }
    
    // Validate prediction type
    const validTypes = ['player_count', 'downtime', 'latency', 'growth'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid prediction type'
      });
    }
    
    const predictions = await AIPrediction.getForServerInRange(
      parseInt(serverId),
      type,
      new Date(start),
      new Date(end)
    );
    
    return res.json({
      success: true,
      data: predictions,
      meta: {
        server_id: parseInt(serverId),
        prediction_type: type,
        start_time: start,
        end_time: end,
        count: predictions.length
      }
    });
  } catch (err) {
    console.error(`Error in getPredictionsInRange for server ${req.params.serverId} and type ${req.params.type}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve predictions',
      error: err.message
    });
  }
};

// GET /api/predictions/:serverId/next24hours
// Get predicted player counts for the next 24 hours
exports.getNext24HoursPredictions = async (req, res) => {
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
    
    const predictions = await AIPrediction.getNext24HoursPlayerCounts(parseInt(serverId));
    
    return res.json({
      success: true,
      data: predictions
    });
  } catch (err) {
    console.error(`Error in getNext24HoursPredictions for server ${req.params.serverId}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve predictions',
      error: err.message
    });
  }
};

// GET /api/predictions/:serverId/peak
// Get predicted peak time for the next 24 hours
exports.getPredictedPeak = async (req, res) => {
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
    
    const peakData = await AIPrediction.getPredictedPeakTime(parseInt(serverId));
    
    if (!peakData) {
      return res.json({
        success: true,
        data: null,
        message: 'No peak predictions available for this server'
      });
    }
    
    return res.json({
      success: true,
      data: peakData
    });
  } catch (err) {
    console.error(`Error in getPredictedPeak for server ${req.params.serverId}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve peak prediction',
      error: err.message
    });
  }
};

// GET /api/predictions/:serverId/downtime
// Get predicted downtime (if any) in the next 24 hours
exports.getPredictedDowntime = async (req, res) => {
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
    
    const downtimePredictions = await AIPrediction.getPredictedDowntime(parseInt(serverId));
    
    return res.json({
      success: true,
      data: downtimePredictions,
      has_predicted_downtime: downtimePredictions.length > 0
    });
  } catch (err) {
    console.error(`Error in getPredictedDowntime for server ${req.params.serverId}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve downtime predictions',
      error: err.message
    });
  }
};

// GET /api/predictions/:serverId/insights
// Get top AI insights for a server
exports.getTopInsights = async (req, res) => {
  try {
    const { serverId } = req.params;
    const { limit = 5 } = req.query;
    
    // Check if server exists
    const server = await Server.getById(parseInt(serverId));
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }
    
    const insights = await AIPrediction.getTopInsights(parseInt(serverId), parseInt(limit));
    
    return res.json({
      success: true,
      data: insights
    });
  } catch (err) {
    console.error(`Error in getTopInsights for server ${req.params.serverId}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve insights',
      error: err.message
    });
  }
};

// POST /api/predictions
// Create a new prediction (typically called by an AI prediction service)
exports.createPrediction = async (req, res) => {
  try {
    const {
      server_id,
      prediction_timestamp,
      prediction_type,
      prediction_value,
      insight
    } = req.body;

    // Validate required fields
    if (
      !server_id || 
      !prediction_timestamp || 
      !prediction_type || 
      !prediction_value || 
      !insight
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

    // Validate prediction type
    const validTypes = ['player_count', 'downtime', 'latency', 'growth'];
    if (!validTypes.includes(prediction_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid prediction type'
      });
    }

    // Create the prediction
    const newPrediction = await AIPrediction.create({
      server_id: parseInt(server_id),
      prediction_timestamp: new Date(prediction_timestamp),
      prediction_type,
      prediction_value,
      insight
    });

    return res.status(201).json({
      success: true,
      message: 'Prediction created successfully',
      data: newPrediction
    });
  } catch (err) {
    console.error('Error in createPrediction:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to create prediction',
      error: err.message
    });
  }
};