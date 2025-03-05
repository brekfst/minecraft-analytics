const Server = require('../models/server');
const ServerClaim = require('../models/claim');
const { query } = require('../config/database');

class AdminService {
  // Get pending server submissions
  static async getPendingServers() {
    try {
      const result = await query(
        `SELECT * FROM servers WHERE is_active = false ORDER BY first_seen ASC`,
        []
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error in getPendingServers:', error);
      throw error;
    }
  }

  // Approve a pending server
  static async approveServer(serverId) {
    try {
      // Get the server to check if it exists and is pending
      const server = await Server.getById(serverId);
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }
      
      if (server.is_active) {
        const error = new Error('Server is already active');
        error.statusCode = 409;
        throw error;
      }
      
      // Update server to active
      return await Server.update(serverId, { is_active: true });
    } catch (error) {
      console.error(`Error in approveServer for ID ${serverId}:`, error);
      throw error;
    }
  }

  // Reject a pending server
  static async rejectServer(serverId, reason = null) {
    try {
      // Get the server to check if it exists and is pending
      const server = await Server.getById(serverId);
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }
      
      if (server.is_active) {
        const error = new Error('Cannot reject an active server');
        error.statusCode = 409;
        throw error;
      }
      
      // Delete the server
      await Server.delete(serverId);
      
      // Could log the rejection reason if needed
      return { message: 'Server rejected successfully' };
    } catch (error) {
      console.error(`Error in rejectServer for ID ${serverId}:`, error);
      throw error;
    }
  }

  // Get pending server claims
  static async getPendingClaims() {
    try {
      return await ServerClaim.getPendingClaims();
    } catch (error) {
      console.error('Error in getPendingClaims:', error);
      throw error;
    }
  }

  // Approve a server claim
  static async approveClaim(claimId) {
    try {
      // Get the claim to check if it exists and is pending
      const claim = await ServerClaim.getById(claimId);
      if (!claim) {
        const error = new Error('Claim not found');
        error.statusCode = 404;
        throw error;
      }
      
      if (claim.status !== 'pending') {
        const error = new Error(`Claim is already ${claim.status}`);
        error.statusCode = 409;
        throw error;
      }
      
      // Approve the claim
      return await ServerClaim.approve(claimId);
    } catch (error) {
      console.error(`Error in approveClaim for ID ${claimId}:`, error);
      throw error;
    }
  }

  // Reject a server claim
  static async rejectClaim(claimId, reason = '') {
    try {
      // Get the claim to check if it exists and is pending
      const claim = await ServerClaim.getById(claimId);
      if (!claim) {
        const error = new Error('Claim not found');
        error.statusCode = 404;
        throw error;
      }
      
      if (claim.status !== 'pending') {
        const error = new Error(`Claim is already ${claim.status}`);
        error.statusCode = 409;
        throw error;
      }
      
      // Reject the claim
      return await ServerClaim.reject(claimId, reason);
    } catch (error) {
      console.error(`Error in rejectClaim for ID ${claimId}:`, error);
      throw error;
    }
  }

  // Get featured servers
  static async getFeaturedServers() {
    try {
      const result = await query(
        `SELECT fs.*, s.name AS server_name, s.ip AS server_ip
        FROM featured_servers fs
        JOIN servers s ON fs.server_id = s.id
        WHERE fs.active = true
        ORDER BY fs.position ASC`,
        []
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error in getFeaturedServers:', error);
      throw error;
    }
  }

  // Add a server to featured servers
  static async addFeaturedServer(serverData) {
    try {
      const { server_id, position, end_date } = serverData;
      
      // Validate required fields
      if (!server_id || position === undefined) {
        const error = new Error('Server ID and position are required');
        error.statusCode = 400;
        throw error;
      }
      
      // Check if server exists
      const server = await Server.getById(parseInt(server_id));
      if (!server) {
        const error = new Error('Server not found');
        error.statusCode = 404;
        throw error;
      }
      
      // Check if server is already featured
      const existingResult = await query(
        `SELECT * FROM featured_servers 
        WHERE server_id = $1 AND active = true`,
        [parseInt(server_id)]
      );
      
      if (existingResult.rows.length > 0) {
        const error = new Error('Server is already featured');
        error.statusCode = 409;
        throw error;
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
      
      return result.rows[0];
    } catch (error) {
      console.error('Error in addFeaturedServer:', error);
      throw error;
    }
  }

  // Update a featured server
  static async updateFeaturedServer(featuredId, updateData) {
    try {
      // Check if featured server exists
      const existingResult = await query(
        `SELECT * FROM featured_servers WHERE id = $1`,
        [featuredId]
      );
      
      if (existingResult.rows.length === 0) {
        const error = new Error('Featured server not found');
        error.statusCode = 404;
        throw error;
      }
      
      const { position, end_date, active } = updateData;
      
      // If updating position, handle reordering
      if (position !== undefined && position !== existingResult.rows[0].position) {
        await query(
          `UPDATE featured_servers 
          SET position = position + 1 
          WHERE position >= $1 AND active = true AND id != $2`,
          [parseInt(position), featuredId]
        );
      }
      
      // Prepare update fields
      const updateFields = [];
      const queryParams = [];
      let paramIndex = 1;
      
      if (position !== undefined) {
        updateFields.push(`position = ${paramIndex}`);
        queryParams.push(parseInt(position));
        paramIndex++;
      }
      
      if (end_date !== undefined) {
        updateFields.push(`end_date = ${paramIndex}`);
        queryParams.push(end_date ? new Date(end_date) : null);
        paramIndex++;
      }
      
      if (active !== undefined) {
        updateFields.push(`active = ${paramIndex}`);
        queryParams.push(active);
        paramIndex++;
      }
      
      // If no fields to update, return the existing record
      if (updateFields.length === 0) {
        return existingResult.rows[0];
      }
      
      queryParams.push(featuredId);
      
      const result = await query(
        `UPDATE featured_servers 
        SET ${updateFields.join(', ')} 
        WHERE id = ${paramIndex} 
        RETURNING *`,
        queryParams
      );
      
      return result.rows[0];
    } catch (error) {
      console.error(`Error in updateFeaturedServer for ID ${featuredId}:`, error);
      throw error;
    }
  }

  // Remove a server from featured servers
  static async removeFeaturedServer(featuredId) {
    try {
      // Check if featured server exists
      const existingResult = await query(
        `SELECT * FROM featured_servers WHERE id = $1`,
        [featuredId]
      );
      
      if (existingResult.rows.length === 0) {
        const error = new Error('Featured server not found');
        error.statusCode = 404;
        throw error;
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
      
      return { message: 'Server removed from featured servers' };
    } catch (error) {
      console.error(`Error in removeFeaturedServer for ID ${featuredId}:`, error);
      throw error;
    }
  }

  // Get admin dashboard statistics
  static async getAdminStats() {
    try {
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
      
      return {
        total_servers: parseInt(totalServersResult.rows[0].total),
        active_servers: parseInt(activeServersResult.rows[0].total),
        pending_servers: parseInt(pendingServersResult.rows[0].total),
        pending_claims: parseInt(pendingClaimsResult.rows[0].total),
        total_players: parseInt(totalPlayersResult.rows[0]?.total || 0),
        featured_servers: parseInt(featuredServersResult.rows[0].total)
      };
    } catch (error) {
      console.error('Error in getAdminStats:', error);
      throw error;
    }
  }
}

module.exports = AdminService;