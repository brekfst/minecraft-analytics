const { query, getCache, setCache, clearCache } = require('../config/database');

class AIPrediction {
  // Get the latest predictions for a server by prediction type
  static async getLatestForServer(serverId, predictionType, limit = 5) {
    const cacheKey = `predictions:latest:${serverId}:${predictionType}:${limit}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await query(
        `SELECT * FROM ai_predictions
        WHERE 
          server_id = $1 AND 
          prediction_type = $2 AND
          prediction_timestamp > NOW()
        ORDER BY prediction_timestamp ASC
        LIMIT $3`,
        [serverId, predictionType, limit]
      );

      // Cache the result for 5 minutes
      await setCache(cacheKey, result.rows, 300);
      
      return result.rows;
    } catch (err) {
      console.error(`Error getting latest ${predictionType} predictions for server ${serverId}:`, err);
      throw err;
    }
  }

  // Get predictions for a server within a time range
  static async getForServerInRange(serverId, predictionType, startTime, endTime) {
    const cacheKey = `predictions:range:${serverId}:${predictionType}:${startTime}:${endTime}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await query(
        `SELECT * FROM ai_predictions
        WHERE 
          server_id = $1 AND 
          prediction_type = $2 AND
          prediction_timestamp BETWEEN $3 AND $4
        ORDER BY prediction_timestamp ASC`,
        [serverId, predictionType, startTime, endTime]
      );

      // Cache the result for 15 minutes
      await setCache(cacheKey, result.rows, 900);
      
      return result.rows;
    } catch (err) {
      console.error(`Error getting ${predictionType} predictions for server ${serverId} in range:`, err);
      throw err;
    }
  }

  // Get predicted player counts for the next 24 hours
  static async getNext24HoursPlayerCounts(serverId) {
    const cacheKey = `predictions:next24hours:${serverId}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await query(
        `SELECT 
          prediction_timestamp AS time,
          prediction_value::integer AS player_count
        FROM ai_predictions
        WHERE 
          server_id = $1 AND 
          prediction_type = 'player_count' AND
          prediction_timestamp > NOW() AND
          prediction_timestamp <= NOW() + INTERVAL '24 hours'
        ORDER BY prediction_timestamp ASC`,
        [serverId]
      );

      // Cache the result for 15 minutes
      await setCache(cacheKey, result.rows, 900);
      
      return result.rows;
    } catch (err) {
      console.error(`Error getting 24-hour predicted player counts for server ${serverId}:`, err);
      throw err;
    }
  }

  // Create a new prediction
  static async create(predictionData) {
    const {
      server_id,
      prediction_timestamp,
      prediction_type,
      prediction_value,
      insight
    } = predictionData;

    try {
      const result = await query(
        `INSERT INTO ai_predictions 
          (server_id, prediction_timestamp, prediction_type, prediction_value, insight, created_at) 
        VALUES 
          ($1, $2, $3, $4, $5, NOW()) 
        RETURNING *`,
        [server_id, prediction_timestamp, prediction_type, prediction_value, insight]
      );

      // Clear relevant caches
      await clearCache(`predictions:latest:${server_id}:${prediction_type}:*`);
      await clearCache(`predictions:range:${server_id}:${prediction_type}:*`);
      if (prediction_type === 'player_count') {
        await clearCache(`predictions:next24hours:${server_id}`);
      }
      
      return result.rows[0];
    } catch (err) {
      console.error('Error creating prediction:', err);
      throw err;
    }
  }

  // Get the predicted peak time for the next 24 hours
  static async getPredictedPeakTime(serverId) {
    const cacheKey = `predictions:peak:${serverId}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await query(
        `SELECT 
          prediction_timestamp AS peak_time,
          prediction_value::integer AS peak_players
        FROM ai_predictions
        WHERE 
          server_id = $1 AND 
          prediction_type = 'player_count' AND
          prediction_timestamp > NOW() AND
          prediction_timestamp <= NOW() + INTERVAL '24 hours'
        ORDER BY prediction_value::integer DESC
        LIMIT 1`,
        [serverId]
      );

      const peakData = result.rows[0] || null;
      
      // Cache the result for 30 minutes
      await setCache(cacheKey, peakData, 1800);
      
      return peakData;
    } catch (err) {
      console.error(`Error getting predicted peak time for server ${serverId}:`, err);
      throw err;
    }
  }

  // Get predicted downtime (if any) in the next 24 hours
  static async getPredictedDowntime(serverId) {
    const cacheKey = `predictions:downtime:${serverId}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await query(
        `SELECT * 
        FROM ai_predictions
        WHERE 
          server_id = $1 AND 
          prediction_type = 'downtime' AND
          prediction_timestamp > NOW() AND
          prediction_timestamp <= NOW() + INTERVAL '24 hours'
        ORDER BY prediction_timestamp ASC`,
        [serverId]
      );

      // Cache the result for 30 minutes
      await setCache(cacheKey, result.rows, 1800);
      
      return result.rows;
    } catch (err) {
      console.error(`Error getting predicted downtime for server ${serverId}:`, err);
      throw err;
    }
  }

  // Get top 5 insights for a server
  static async getTopInsights(serverId, limit = 5) {
    const cacheKey = `predictions:insights:${serverId}:${limit}`;
    
    // Try to get from cache first
    const cachedResult = await getCache(cacheKey);
    if (cachedResult) return cachedResult;

    try {
      const result = await query(
        `SELECT 
          prediction_type,
          insight,
          prediction_timestamp,
          prediction_value
        FROM ai_predictions
        WHERE 
          server_id = $1 AND
          prediction_timestamp > NOW()
        ORDER BY created_at DESC
        LIMIT $2`,
        [serverId, limit]
      );

      // Cache the result for 15 minutes
      await setCache(cacheKey, result.rows, 900);
      
      return result.rows;
    } catch (err) {
      console.error(`Error getting top insights for server ${serverId}:`, err);
      throw err;
    }
  }
  
  // Delete old predictions to manage database size
  static async deleteOlderThan(days = 7) {
    try {
      const result = await query(
        `DELETE FROM ai_predictions 
        WHERE prediction_timestamp < NOW() - INTERVAL '${days} days'
        RETURNING COUNT(*) as deleted_count`,
        []
      );

      // Clear all prediction caches since this is a major change
      await clearCache('predictions:*');
      
      return parseInt(result.rows[0]?.deleted_count || 0);
    } catch (err) {
      console.error(`Error deleting predictions older than ${days} days:`, err);
      throw err;
    }
  }
}

module.exports = AIPrediction;