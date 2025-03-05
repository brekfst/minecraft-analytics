const Server = require('../models/server');
const ServerClaim = require('../models/claim');
const { pool, query } = require('../config/database');

// GET /api/admin/servers/pending
// Get all pending server submissions
exports.getPendingServers = async (req, res) => {
  try {
    // Admin authentication should be checked in middleware
    const result = await query(
      `SELECT * FROM servers WHERE is_active = false ORDER BY first_seen ASC`,
      []
    );
    
    return res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error in getPendingServers:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending servers',
      error: err.message
    });
  }
};

// POST /api/admin/servers/:id/approve
// Approve a pending server
exports.approveServer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Admin authentication should be checked in middleware
    const serverId = parseInt(id);
    
    // Get the server to check if it exists and is pending
    const server = await Server.getById(serverId);
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }
    
    if (server.is_active) {
      return res.status(409).json({
        success: false,
        message: 'Server is already active'
      });
    }
    
    // Update server to active
    const updatedServer = await Server.update(serverId, { is_active: true });
    
    return res.json({
      success: true,
      message: 'Server approved successfully',
      data: updatedServer
    });
  } catch (err) {
    console.error(`Error in approveServer for ID ${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve server',
      error: err.message
    });
  }
};

// POST /api/admin/servers/:id/reject
// Reject a pending server
exports.rejectServer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Admin authentication should be checked in middleware
    const serverId = parseInt(id);
    
    // Get the server to check if it exists and is pending
    const server = await Server.getById(serverId);
    if (!server) {
      return res.status(404).json({
        success: false,
        message: 'Server not found'
      });
    }
    
    if (server.is_active) {
      return res.status(409).json({
        success: false,
        message: 'Cannot reject an active server'
      });
    }
    
    // Delete the server
    await Server.delete(serverId);
    
    // Could also log the rejection reason in a separate table if needed
    
    return res.json({
      success: true,
      message: 'Server rejected successfully'
    });
  } catch (err) {
    console.error(`Error in rejectServer for ID ${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject server',
      error: err.message
    });
  }
};

// GET /api/admin/claims/pending
// Get all pending server claims
exports.getPendingClaims = async (req, res) => {
  try {
    // Admin authentication should be checked in middleware
    const pendingClaims = await ServerClaim.getPendingClaims();
    
    return res.json({
      success: true,
      data: pendingClaims
    });
  } catch (err) {
    console.error('Error in getPendingClaims:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve pending claims',
      error: err.message
    });
  }
};

// POST /api/admin/claims/:id/approve
// Approve a server claim
exports.approveClaim = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Admin authentication should be checked in middleware
    const claimId = parseInt(id);
    
    // Get the claim to check if it exists and is pending
    const claim = await ServerClaim.getById(claimId);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }
    
    if (claim.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: `Claim is already ${claim.status}`
      });
    }
    
    // Approve the claim
    const result = await ServerClaim.approve(claimId);
    
    return res.json({
      success: true,
      message: 'Claim approved successfully',
      data: result
    });
  } catch (err) {
    console.error(`Error in approveClaim for ID ${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to approve claim',
      error: err.message
    });
  }
};

// POST /api/admin/claims/:id/reject
// Reject a server claim
exports.rejectClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Admin authentication should be checked in middleware
    const claimId = parseInt(id);
    
    // Get the claim to check if it exists and is pending
    const claim = await ServerClaim.getById(claimId);
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found'
      });
    }
    
    if (claim.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: `Claim is already ${claim.status}`
      });
    }
    
    // Reject the claim
    const result = await ServerClaim.reject(claimId, reason);
    
    return res.json({
      success: true,
      message: 'Claim rejected successfully',
      data: result
    });
  } catch (err) {
    console.error(`Error in rejectClaim for ID ${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to reject claim',
      error: err.message
    });
  }
};

// GET /api/admin/featured
// Get all featured servers configuration
exports.getFeaturedServers = async (req, res) => {
  try {
    // Admin authentication should be checked in middleware
    const result = await query(
      `SELECT fs.*, s.name AS server_name, s.ip AS server_ip
      FROM featured_servers fs
      JOIN servers s ON fs.server_id = s.id
      WHERE fs.active = true
      ORDER BY fs.position ASC`,
      []
    );
    
    return res.json({
      success: true,
      data: result.rows
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

// POST /api/admin/featured
// Add a server to featured servers
exports.addFeaturedServer = async (req, res) => {
  try {
    const { server_id, position, end_date } = req.body;
    
    // Admin authentication should be checked in middleware
    
    // Validate required fields
    if (!server_id || position === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Server ID and position are required'
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
    
    // Check if server is already featured
    const existingResult = await query(
      `SELECT * FROM featured_servers 
      WHERE server_id = $1 AND active = true`,
      [parseInt(server_id)]
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Server is already featured'
      });
    }
    
    // If adding at a specific position, update positions of other featured servers
    if (position !== null) {
      await query(
        `UPDATE featured_servers 
        SET position = position + 1 
        WHERE position >= $1 AND active = true`,
        [parseInt(position)]
      );
    }
    
    // Get the last position if position is null
    let finalPosition = position;
    if (finalPosition === null) {
      const lastPositionResult = await query(
        `SELECT MAX(position) AS max_position FROM featured_servers WHERE active = true`,
        []
      );
      finalPosition = (lastPositionResult.rows[0]?.max_position || 0) + 1;
    }
    
    // Add the server to featured servers
    const result = await query(
      `INSERT INTO featured_servers 
        (server_id, position, start_date, end_date, active) 
      VALUES 
        ($1, $2, NOW(), $3, true) 
      RETURNING *`,
      [parseInt(server_id), parseInt(finalPosition), end_date ? new Date(end_date) : null]
    );
    
    return res.status(201).json({
      success: true,
      message: 'Server added to featured servers',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error in addFeaturedServer:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to add server to featured servers',
      error: err.message
    });
  }
};

// PUT /api/admin/featured/:id
// Update a featured server
exports.updateFeaturedServer = async (req, res) => {
  try {
    const { id } = req.params;
    const { position, end_date, active } = req.body;
    
    // Admin authentication should be checked in middleware
    const featuredId = parseInt(id);
    
    // Check if featured server exists
    const existingResult = await query(
      `SELECT * FROM featured_servers WHERE id = $1`,
      [featuredId]
    );
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Featured server not found'
      });
    }
    
    // If updating position, handle reordering
    if (position !== undefined && position !== existingResult.rows[0].position) {
      await query(
        `UPDATE featured_servers 
        SET position = position + 1 
        WHERE position >= $1 AND active = true AND id != $2`,
        [parseInt(position), featuredId]
      );
    }
    
    // Update the featured server
    const updateFields = [];
    const queryParams = [];
    let paramIndex = 1;
    
    if (position !== undefined) {
      updateFields.push(`position = $${paramIndex}`);
      queryParams.push(parseInt(position));
      paramIndex++;
    }
    
    if (end_date !== undefined) {
      updateFields.push(`end_date = $${paramIndex}`);
      queryParams.push(end_date ? new Date(end_date) : null);
      paramIndex++;
    }
    
    if (active !== undefined) {
      updateFields.push(`active = $${paramIndex}`);
      queryParams.push(active);
      paramIndex++;
    }
    
    // If no fields to update, return the existing record
    if (updateFields.length === 0) {
      return res.json({
        success: true,
        message: 'No changes to apply',
        data: existingResult.rows[0]
      });
    }
    
    queryParams.push(featuredId);
    
    const result = await query(
      `UPDATE featured_servers 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING *`,
      queryParams
    );
    
    return res.json({
      success: true,
      message: 'Featured server updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error(`Error in updateFeaturedServer for ID ${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update featured server',
      error: err.message
    });
  }
};

// DELETE /api/admin/featured/:id
// Remove a server from featured servers
exports.removeFeaturedServer = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Admin authentication should be checked in middleware
    const featuredId = parseInt(id);
    
    // Check if featured server exists
    const existingResult = await query(
      `SELECT * FROM featured_servers WHERE id = $1`,
      [featuredId]
    );
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Featured server not found'
      });
    }
    
    // Get position before deleting for reordering
    const position = existingResult.rows[0].position;
    
    // Delete the featured server
    await query(
      `DELETE FROM featured_servers WHERE id = $1`,
      [featuredId]
    );
    
    // Reorder remaining featured servers
    await query(
      `UPDATE featured_servers 
      SET position = position - 1 
      WHERE position > $1 AND active = true`,
      [position]
    );
    
    return res.json({
      success: true,
      message: 'Server removed from featured servers'
    });
  } catch (err) {
    console.error(`Error in removeFeaturedServer for ID ${req.params.id}:`, err);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove server from featured servers',
      error: err.message
    });
  }
};

// GET /api/admin/stats
// Get admin dashboard statistics
exports.getAdminStats = async (req, res) => {
  try {
    // Admin authentication should be checked in middleware
    
    // Get total servers count
    const totalServersResult = await query(
      'SELECT COUNT(*) AS total FROM servers',
      []
    );
    
    // Get active servers count
    const activeServersResult = await query(
      'SELECT COUNT(*) AS total FROM servers WHERE is_active = true',
      []
    );
    
    // Get pending servers count
    const pendingServersResult = await query(
      'SELECT COUNT(*) AS total FROM servers WHERE is_active = false',
      []
    );
    
    // Get pending claims count
    const pendingClaimsResult = await query(
      'SELECT COUNT(*) AS total FROM server_claims WHERE status = \'pending\'',
      []
    );
    
    // Get total online players
    const totalPlayersResult = await query(
      `WITH latest_measurements AS (
        SELECT DISTINCT ON (server_id) server_id, player_count
        FROM server_measurements
        WHERE is_online = true
        ORDER BY server_id, timestamp DESC
      )
      SELECT SUM(player_count) AS total FROM latest_measurements`,
      []
    );
    
    // Get featured servers count
    const featuredServersResult = await query(
      'SELECT COUNT(*) AS total FROM featured_servers WHERE active = true',
      []
    );
    
    return res.json({
      success: true,
      data: {
        total_servers: parseInt(totalServersResult.rows[0].total),
        active_servers: parseInt(activeServersResult.rows[0].total),
        pending_servers: parseInt(pendingServersResult.rows[0].total),
        pending_claims: parseInt(pendingClaimsResult.rows[0].total),
        total_players: parseInt(totalPlayersResult.rows[0]?.total || 0),
        featured_servers: parseInt(featuredServersResult.rows[0].total)
      }
    });
  } catch (err) {
    console.error('Error in getAdminStats:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin statistics',
      error: err.message
    });
  }
};