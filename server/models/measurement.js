const { query, getCache, setCache, clearCache } = require('../config/database');

class ServerMeasurement {
  // Get the latest measurement for a server
  static async getLatestForServer(serverId) {
    const cacheKey = `measurements:latest:${serverId}`;
    
    // Try to get from cache first (short TTL for real-time data)
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await query(
        `SELECT * FROM server_measurements 
        WHERE server_id = $1 
        ORDER BY timestamp DESC 
        LIMIT 1`,
        [serverId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      // Cache the result for a short time (1 minute) due to real-time nature
      await setCache(cacheKey, result.rows[0], 60);
      
      return result.rows[0];
    } catch (err) {
      console.error(`Error getting latest measurement for server ${serverId}:`, err);
      throw err;
    }
  }

  // Get measurements for a server within a time range
  static async getForServerInRange(serverId, startTime, endTime, interval = null) {
    // Generate cache key based on parameters
    const cacheKey = `measurements:range:${serverId}:${startTime}:${endTime}:${interval}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      let queryText;
      const queryParams = [serverId, startTime, endTime];

      // If interval is provided, perform time-bucketed aggregation
      if (interval) {
        queryText = `
          SELECT 
            time_bucket($4, timestamp) AS time,
            AVG(player_count) AS avg_player_count,
            MAX(player_count) AS max_player_count,
            MIN(player_count) AS min_player_count,
            SUM(CASE WHEN is_online THEN 1 ELSE 0 END)::float / COUNT(*) * 100 AS uptime_percentage,
            AVG(latency_ms) AS avg_latency
          FROM server_measurements
          WHERE server_id = $1 AND timestamp BETWEEN $2 AND $3
          GROUP BY time
          ORDER BY time ASC
        `;
        queryParams.push(interval);
      } else {
        // Otherwise return all measurements
        queryText = `
          SELECT * FROM server_measurements
          WHERE server_id = $1 AND timestamp BETWEEN $2 AND $3
          ORDER BY timestamp ASC
        `;
      }

      const result = await query(queryText, queryParams);

      // Cache the result for 5 minutes
      await setCache(cacheKey, result.rows, 300);
      
      return result.rows;
    } catch (err) {
      console.error(`Error getting measurements for server ${serverId} in range:`, err);
      throw err;
    }
  }

  // Get hourly player counts for the last 24 hours
  static async getLast24HoursPlayerCounts(serverId) {
    const cacheKey = `measurements:24hours:${serverId}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await query(
        `SELECT 
          date_trunc('hour', timestamp) AS hour,
          AVG(player_count)::integer AS avg_player_count
        FROM server_measurements
        WHERE 
          server_id = $1 AND 
          timestamp > NOW() - INTERVAL '24 hours'
        GROUP BY hour
        ORDER BY hour ASC`,
        [serverId]
      );

      // Cache the result for 15 minutes
      await setCache(cacheKey, result.rows, 900);
      
      return result.rows;
    } catch (err) {
      console.error(`Error getting 24-hour player counts for server ${serverId}:`, err);
      throw err;
    }
  }

  // Create a new measurement
  static async create(measurementData) {
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
    } = measurementData;

    try {
      const result = await query(
        `INSERT INTO server_measurements 
          (server_id, timestamp, is_online, player_count, motd, version, 
           latency_ms, players_sample, favicon_hash, protocol_version, 
           description, tags, whitelist_status, modded_status, forge_data, server_software) 
        VALUES 
          ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
        RETURNING *`,
        [
          server_id, is_online, player_count, motd, version, 
          latency_ms, players_sample, favicon_hash, protocol_version, 
          description, tags, whitelist_status, modded_status, forge_data, server_software
        ]
      );

      // Clear relevant caches
      await clearCache(`measurements:latest:${server_id}`);
      await clearCache(`measurements:24hours:${server_id}`);
      await clearCache(`measurements:range:${server_id}:*`);
      
      return result.rows[0];
    } catch (err) {
      console.error('Error creating measurement:', err);
      throw err;
    }
  }

  // Get server uptime percentage for a time period
  static async getUptimePercentage(serverId, days = 1) {
    const cacheKey = `measurements:uptime:${serverId}:${days}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult !== null) return cachedResult;

    try {
      const result = await query(
        `SELECT 
          SUM(CASE WHEN is_online THEN 1 ELSE 0 END)::float / COUNT(*) * 100 AS uptime_percentage
        FROM server_measurements
        WHERE 
          server_id = $1 AND 
          timestamp > NOW() - INTERVAL '${days} days'`,
        [serverId]
      );

      const uptime = result.rows[0]?.uptime_percentage || 0;
      
      // Cache the result for 15 minutes
      await setCache(cacheKey, uptime, 900);
      
      return uptime;
    } catch (err) {
      console.error(`Error getting uptime percentage for server ${serverId}:`, err);
      throw err;
    }
  }

  // Get total online players across all active servers
  static async getTotalOnlinePlayers() {
    const cacheKey = 'measurements:total_players';
    
    // Try to get from cache first (short TTL for real-time data)
    const cachedResult = await getCache(cacheKey);
    if (cachedResult !== null) return cachedResult;

    try {
      const result = await query(
        `WITH latest_measurements AS (
          SELECT DISTINCT ON (server_id) server_id, player_count
          FROM server_measurements
          WHERE is_online = true
          ORDER BY server_id, timestamp DESC
        )
        SELECT SUM(player_count) AS total_players
        FROM latest_measurements`,
        []
      );

      const totalPlayers = parseInt(result.rows[0]?.total_players || 0);
      
      // Cache the result for a short time (1 minute) due to real-time nature
      await setCache(cacheKey, totalPlayers, 60);
      
      return totalPlayers;
    } catch (err) {
      console.error('Error getting total online players:', err);
      throw err;
    }
  }

  // Get server peak hour based on historical data
  static async getPeakHour(serverId) {
    const cacheKey = `measurements:peak_hour:${serverId}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult !== null) return cachedResult;

    try {
      const result = await query(
        `SELECT 
          EXTRACT(HOUR FROM timestamp) AS hour,
          AVG(player_count)::integer AS avg_player_count
        FROM server_measurements
        WHERE 
          server_id = $1 AND 
          timestamp > NOW() - INTERVAL '7 days'
        GROUP BY hour
        ORDER BY avg_player_count DESC
        LIMIT 1`,
        [serverId]
      );

      const peakHour = result.rows[0] || { hour: null, avg_player_count: 0 };
      
      // Cache the result for 1 day
      await setCache(cacheKey, peakHour, 86400);
      
      return peakHour;
    } catch (err) {
      console.error(`Error getting peak hour for server ${serverId}:`, err);
      throw err;
    }
  }

  // Delete old measurements to manage database size
  static async deleteOlderThan(days = 30) {
    try {
      const result = await query(
        `DELETE FROM server_measurements 
        WHERE timestamp < NOW() - INTERVAL '${days} days'
        RETURNING COUNT(*) as deleted_count`,
        []
      );

      // Clear all measurement caches since this is a major change
      await clearCache('measurements:*');
      
      return parseInt(result.rows[0]?.deleted_count || 0);
    } catch (err) {
      console.error(`Error deleting measurements older than ${days} days:`, err);
      throw err;
    }
  }
}

module.exports = ServerMeasurement;