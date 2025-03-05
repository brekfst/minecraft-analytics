const { query, getCache, setCache, clearCache } = require('../config/database');

class Server {
  // Get all servers with optional filtering and pagination
  static async getAll(options = {}) {
    const {
      limit = 20,
      offset = 0,
      search = '',
      sort = 'name',
      order = 'ASC',
      isActive = true,
      gamemode = null,
      country = null
    } = options;

    // Create cache key based on query parameters
    const cacheKey = `servers:all:${JSON.stringify(options)}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    // Build the query
    let queryText = `
      SELECT s.*, 
        (SELECT COUNT(*) FROM server_owners so WHERE so.server_id = s.id) AS has_owner
      FROM servers s
      WHERE is_active = $1
    `;
    
    const queryParams = [isActive];
    let paramIndex = 2;

    // Add search condition if provided
    if (search) {
      queryText += ` AND (s.name ILIKE $${paramIndex} OR s.ip ILIKE $${paramIndex} OR s.hostname ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Add gamemode filter if provided
    if (gamemode) {
      queryText += ` AND $${paramIndex} = ANY(s.gamemode)`;
      queryParams.push(gamemode);
      paramIndex++;
    }

    // Add country filter if provided
    if (country) {
      queryText += ` AND s.country = $${paramIndex}`;
      queryParams.push(country);
      paramIndex++;
    }

    // Add sorting
    queryText += ` ORDER BY ${sort} ${order}`;

    // Add pagination
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit, offset);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM servers s
      WHERE is_active = $1
      ${search ? ` AND (s.name ILIKE $2 OR s.ip ILIKE $2 OR s.hostname ILIKE $2)` : ''}
      ${gamemode ? ` AND $${search ? 3 : 2} = ANY(s.gamemode)` : ''}
      ${country ? ` AND s.country = $${search ? (gamemode ? 4 : 3) : (gamemode ? 3 : 2)}` : ''}
    `;
    
    const countParams = [isActive];
    if (search) countParams.push(`%${search}%`);
    if (gamemode) countParams.push(gamemode);
    if (country) countParams.push(country);

    try {
      // Execute queries
      const [serversResult, countResult] = await Promise.all([
        query(queryText, queryParams),
        query(countQuery, countParams)
      ]);

      const result = {
        servers: serversResult.rows,
        total: parseInt(countResult.rows[0].count),
        limit,
        offset
      };

      // Cache the result for 5 minutes
      await setCache(cacheKey, result, 300);
      
      return result;
    } catch (err) {
      console.error('Error getting servers:', err);
      throw err;
    }
  }

  // Get a single server by ID
  static async getById(id) {
    const cacheKey = `servers:id:${id}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await query(
        `SELECT s.*, 
          (SELECT COUNT(*) FROM server_owners so WHERE so.server_id = s.id) AS has_owner
        FROM servers s 
        WHERE s.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      // Cache the result for 5 minutes
      await setCache(cacheKey, result.rows[0], 300);
      
      return result.rows[0];
    } catch (err) {
      console.error(`Error getting server with ID ${id}:`, err);
      throw err;
    }
  }

  // Get a single server by IP or hostname
  static async getByIpOrHostname(identifier) {
    const cacheKey = `servers:identifier:${identifier}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await query(
        `SELECT s.*, 
          (SELECT COUNT(*) FROM server_owners so WHERE so.server_id = s.id) AS has_owner
        FROM servers s 
        WHERE s.ip = $1 OR s.hostname = $1`,
        [identifier]
      );

      if (result.rows.length === 0) {
        return null;
      }

      // Cache the result for 5 minutes
      await setCache(cacheKey, result.rows[0], 300);
      
      return result.rows[0];
    } catch (err) {
      console.error(`Error getting server with identifier ${identifier}:`, err);
      throw err;
    }
  }

  // Create a new server
  static async create(serverData) {
    const {
      ip,
      hostname,
      name,
      website_url,
      country,
      gamemode,
      max_players,
      is_active = false // Default to inactive until approved
    } = serverData;

    try {
      const result = await query(
        `INSERT INTO servers 
          (ip, hostname, name, website_url, country, gamemode, max_players, first_seen, last_seen, is_active) 
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8) 
        RETURNING *`,
        [ip, hostname, name, website_url, country, gamemode, max_players, is_active]
      );

      // Clear relevant caches
      await clearCache('servers:all:*');
      
      return result.rows[0];
    } catch (err) {
      console.error('Error creating server:', err);
      throw err;
    }
  }

  // Update a server
  static async update(id, serverData) {
    // Build dynamic update query
    const updateFields = [];
    const queryParams = [];
    let paramIndex = 1;

    // Add each field to update
    for (const [key, value] of Object.entries(serverData)) {
      // Skip undefined values
      if (value === undefined) continue;
      
      updateFields.push(`${key} = $${paramIndex}`);
      queryParams.push(value);
      paramIndex++;
    }

    // Always update last_seen
    updateFields.push(`last_seen = NOW()`);

    // Add server ID as the last parameter
    queryParams.push(id);

    // If no fields to update, just return the server
    if (updateFields.length === 0) {
      return this.getById(id);
    }

    try {
      const result = await query(
        `UPDATE servers 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramIndex} 
        RETURNING *`,
        queryParams
      );

      if (result.rows.length === 0) {
        return null;
      }

      // Clear relevant caches
      await clearCache(`servers:id:${id}`);
      await clearCache('servers:all:*');
      await clearCache(`servers:identifier:${result.rows[0].ip}`);
      await clearCache(`servers:identifier:${result.rows[0].hostname}`);
      
      return result.rows[0];
    } catch (err) {
      console.error(`Error updating server with ID ${id}:`, err);
      throw err;
    }
  }

  // Delete a server
  static async delete(id) {
    try {
      // Get server details before deletion for cache clearing
      const server = await this.getById(id);
      if (!server) return false;

      const result = await query(
        'DELETE FROM servers WHERE id = $1 RETURNING id',
        [id]
      );

      // Clear relevant caches
      await clearCache(`servers:id:${id}`);
      await clearCache('servers:all:*');
      await clearCache(`servers:identifier:${server.ip}`);
      await clearCache(`servers:identifier:${server.hostname}`);
      
      return result.rows.length > 0;
    } catch (err) {
      console.error(`Error deleting server with ID ${id}:`, err);
      throw err;
    }
  }

  // Get featured servers
  static async getFeatured(limit = 6) {
    const cacheKey = `servers:featured:${limit}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await query(
        `SELECT s.* 
        FROM servers s
        JOIN featured_servers fs ON s.id = fs.server_id
        WHERE fs.active = true 
          AND (fs.end_date IS NULL OR fs.end_date > NOW())
        ORDER BY fs.position ASC
        LIMIT $1`,
        [limit]
      );

      // Cache the result for 15 minutes
      await setCache(cacheKey, result.rows, 900);
      
      return result.rows;
    } catch (err) {
      console.error('Error getting featured servers:', err);
      throw err;
    }
  }

  // Get servers with most players
  static async getTopByPlayers(limit = 5) {
    const cacheKey = `servers:top:${limit}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await query(
        `SELECT s.*, sm.player_count
        FROM servers s
        JOIN (
          SELECT DISTINCT ON (server_id) server_id, player_count, timestamp
          FROM server_measurements
          WHERE is_online = true
          ORDER BY server_id, timestamp DESC
        ) sm ON s.id = sm.server_id
        WHERE s.is_active = true
        ORDER BY sm.player_count DESC
        LIMIT $1`,
        [limit]
      );

      // Cache the result for 5 minutes
      await setCache(cacheKey, result.rows, 300);
      
      return result.rows;
    } catch (err) {
      console.error('Error getting top servers by players:', err);
      throw err;
    }
  }

  // Get rising servers (growth in the last 24 hours)
  static async getRising(limit = 4) {
    const cacheKey = `servers:rising:${limit}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      // This query calculates the player growth in the last 24 hours
      const result = await query(
        `WITH current_counts AS (
          SELECT DISTINCT ON (server_id) server_id, player_count, timestamp
          FROM server_measurements
          WHERE timestamp > NOW() - INTERVAL '1 hour'
          ORDER BY server_id, timestamp DESC
        ),
        past_counts AS (
          SELECT DISTINCT ON (server_id) server_id, player_count, timestamp
          FROM server_measurements
          WHERE timestamp BETWEEN NOW() - INTERVAL '25 hours' AND NOW() - INTERVAL '24 hours'
          ORDER BY server_id, timestamp DESC
        )
        SELECT 
          s.*, 
          c.player_count AS current_players,
          p.player_count AS past_players,
          c.player_count - p.player_count AS growth
        FROM servers s
        JOIN current_counts c ON s.id = c.server_id
        JOIN past_counts p ON s.id = p.server_id
        WHERE s.is_active = true
        ORDER BY growth DESC
        LIMIT $1`,
        [limit]
      );

      // Cache the result for 15 minutes
      await setCache(cacheKey, result.rows, 900);
      
      return result.rows;
    } catch (err) {
      console.error('Error getting rising servers:', err);
      throw err;
    }
  }

  // Get total active servers count
  static async getTotalActive() {
    const cacheKey = 'servers:count:active';
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult !== null) return cachedResult;

    try {
      const result = await query(
        'SELECT COUNT(*) FROM servers WHERE is_active = true',
        []
      );

      const count = parseInt(result.rows[0].count);
      
      // Cache the result for 30 minutes
      await setCache(cacheKey, count, 1800);
      
      return count;
    } catch (err) {
      console.error('Error getting total active servers count:', err);
      throw err;
    }
  }
}

module.exports = Server;