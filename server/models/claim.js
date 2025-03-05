const { query } = require('../config/database');

class ServerClaim {
  // Create a new server claim request
  static async create(claimData) {
    const {
      server_id,
      username,
      email
    } = claimData;

    try {
      // First check if server is already claimed
      const existingOwner = await query(
        `SELECT * FROM server_owners WHERE server_id = $1`,
        [server_id]
      );

      if (existingOwner.rows.length > 0) {
        throw new Error('Server is already claimed');
      }

      // Check if there's already a pending claim for this server
      const existingClaim = await query(
        `SELECT * FROM server_claims 
        WHERE server_id = $1 AND status = 'pending'`,
        [server_id]
      );

      if (existingClaim.rows.length > 0) {
        throw new Error('There is already a pending claim for this server');
      }

      // Create the claim
      const result = await query(
        `INSERT INTO server_claims 
          (server_id, username, email, status, created_at, updated_at) 
        VALUES 
          ($1, $2, $3, 'pending', NOW(), NOW()) 
        RETURNING *`,
        [server_id, username, email]
      );
      
      return result.rows[0];
    } catch (err) {
      console.error('Error creating server claim:', err);
      throw err;
    }
  }

  // Get all pending claims
  static async getPendingClaims() {
    try {
      const result = await query(
        `SELECT sc.*, s.name AS server_name, s.ip AS server_ip
        FROM server_claims sc
        JOIN servers s ON sc.server_id = s.id
        WHERE sc.status = 'pending'
        ORDER BY sc.created_at ASC`,
        []
      );
      
      return result.rows;
    } catch (err) {
      console.error('Error getting pending claims:', err);
      throw err;
    }
  }

  // Get a specific claim by ID
  static async getById(id) {
    try {
      const result = await query(
        `SELECT * FROM server_claims WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (err) {
      console.error(`Error getting claim with ID ${id}:`, err);
      throw err;
    }
  }

  // Approve a claim
  static async approve(id, userId) {
    try {
      // Start a transaction
      await query('BEGIN');

      // Get the claim
      const claimResult = await query(
        `SELECT * FROM server_claims WHERE id = $1`,
        [id]
      );

      if (claimResult.rows.length === 0) {
        await query('ROLLBACK');
        throw new Error('Claim not found');
      }

      const claim = claimResult.rows[0];

      // Update claim status
      await query(
        `UPDATE server_claims 
        SET status = 'approved', updated_at = NOW() 
        WHERE id = $1`,
        [id]
      );

      // First check if the user exists
      const userResult = await query(
        `SELECT * FROM users WHERE email = $1`,
        [claim.email]
      );

      let userId;
      
      if (userResult.rows.length === 0) {
        // Create a new user if not exists
        const newUserResult = await query(
          `INSERT INTO users 
            (username, email, password_hash, role, created_at) 
          VALUES 
            ($1, $2, $3, 'user', NOW()) 
          RETURNING id`,
          [claim.username, claim.email, 'PLACEHOLDER_REQUIRE_RESET'] // This would be replaced with a proper password hash in a real application
        );
        
        userId = newUserResult.rows[0].id;
      } else {
        userId = userResult.rows[0].id;
      }

      // Create server ownership
      await query(
        `INSERT INTO server_owners 
          (server_id, user_id, created_at) 
        VALUES 
          ($1, $2, NOW())`,
        [claim.server_id, userId]
      );

      // Commit the transaction
      await query('COMMIT');
      
      return { success: true, userId };
    } catch (err) {
      await query('ROLLBACK');
      console.error(`Error approving claim ${id}:`, err);
      throw err;
    }
  }

  // Reject a claim
  static async reject(id, reason = '') {
    try {
      const result = await query(
        `UPDATE server_claims 
        SET status = 'rejected', updated_at = NOW() 
        WHERE id = $1
        RETURNING *`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error('Claim not found');
      }
      
      return result.rows[0];
    } catch (err) {
      console.error(`Error rejecting claim ${id}:`, err);
      throw err;
    }
  }

  // Check if a user has a pending claim for a server
  static async hasPendingClaim(serverId, email) {
    try {
      const result = await query(
        `SELECT * FROM server_claims 
        WHERE server_id = $1 AND email = $2 AND status = 'pending'`,
        [serverId, email]
      );
      
      return result.rows.length > 0;
    } catch (err) {
      console.error(`Error checking pending claim for server ${serverId} and email ${email}:`, err);
      throw err;
    }
  }

  // Get claims history for a server
  static async getServerClaimsHistory(serverId) {
    try {
      const result = await query(
        `SELECT * FROM server_claims 
        WHERE server_id = $1
        ORDER BY created_at DESC`,
        [serverId]
      );
      
      return result.rows;
    } catch (err) {
      console.error(`Error getting claims history for server ${serverId}:`, err);
      throw err;
    }
  }

  // Get claims by user email
  static async getUserClaims(email) {
    try {
      const result = await query(
        `SELECT sc.*, s.name AS server_name, s.ip AS server_ip
        FROM server_claims sc
        JOIN servers s ON sc.server_id = s.id
        WHERE sc.email = $1
        ORDER BY sc.created_at DESC`,
        [email]
      );
      
      return result.rows;
    } catch (err) {
      console.error(`Error getting claims for user ${email}:`, err);
      throw err;
    }
  }
}

module.exports = ServerClaim;