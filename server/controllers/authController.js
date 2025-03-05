const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
require('dotenv').config();

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }
    
    // Check if email already exists
    const emailExistsResult = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (emailExistsResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already in use'
      });
    }
    
    // Check if username already exists
    const usernameExistsResult = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (usernameExistsResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username already in use'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUserResult = await query(
      `INSERT INTO users (username, email, password_hash, role, created_at) 
      VALUES ($1, $2, $3, 'user', NOW()) 
      RETURNING id, username, email, role, created_at`,
      [username, email, hashedPassword]
    );
    
    const user = newUserResult.rows[0];
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        }
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: err.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Check if user exists
    const userResult = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const user = userResult.rows[0];
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: err.message
    });
  }
};

// Check authentication status
exports.checkAuth = async (req, res) => {
  // If middleware passes, user is authenticated
  return res.json({
    success: true,
    message: 'Authentication valid',
    data: {
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        created_at: req.user.created_at
      }
    }
  });
};

// Logout user
exports.logout = async (req, res) => {
  // JWT tokens are stateless, so we can't invalidate them server-side
  // Client should remove the token from storage
  
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userResult = await query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get servers owned by user
    const ownedServersResult = await query(
      `SELECT s.* FROM servers s
      JOIN server_owners so ON s.id = so.server_id
      WHERE so.user_id = $1`,
      [req.user.id]
    );
    
    // Get pending claims
    const pendingClaimsResult = await query(
      `SELECT sc.*, s.name as server_name, s.ip as server_ip 
      FROM server_claims sc
      JOIN servers s ON sc.server_id = s.id
      WHERE sc.email = $1 AND sc.status = 'pending'`,
      [req.user.email]
    );
    
    return res.json({
      success: true,
      data: {
        user: userResult.rows[0],
        owned_servers: ownedServersResult.rows,
        pending_claims: pendingClaimsResult.rows
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: err.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, current_password, new_password } = req.body;
    const updateFields = [];
    const queryParams = [];
    let paramIndex = 1;
    
    // Check if user wants to update username
    if (username && username !== req.user.username) {
      // Check if username is already taken
      const usernameCheckResult = await query(
        'SELECT * FROM users WHERE username = $1 AND id != $2',
        [username, req.user.id]
      );
      
      if (usernameCheckResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Username already in use'
        });
      }
      
      updateFields.push(`username = $${paramIndex}`);
      queryParams.push(username);
      paramIndex++;
    }
    
    // Check if user wants to update email
    if (email && email !== req.user.email) {
      // Check if email is already taken
      const emailCheckResult = await query(
        'SELECT * FROM users WHERE email = $1 AND id != $2',
        [email, req.user.id]
      );
      
      if (emailCheckResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
      
      updateFields.push(`email = $${paramIndex}`);
      queryParams.push(email);
      paramIndex++;
    }
    
    // Check if user wants to update password
    if (new_password) {
      // Current password is required for changing password
      if (!current_password) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to set a new password'
        });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(current_password, req.user.password_hash);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(new_password, salt);
      
      updateFields.push(`password_hash = $${paramIndex}`);
      queryParams.push(hashedPassword);
      paramIndex++;
    }
    
    // If no fields to update
    if (updateFields.length === 0) {
      return res.json({
        success: true,
        message: 'No changes to apply',
        data: {
          user: {
            id: req.user.id,
            username: req.user.username,
            email: req.user.email,
            role: req.user.role,
            created_at: req.user.created_at
          }
        }
      });
    }
    
    // Add user ID as the last parameter
    queryParams.push(req.user.id);
    
    // Update user
    const updateResult = await query(
      `UPDATE users 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex} 
      RETURNING id, username, email, role, created_at`,
      queryParams
    );
    
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updateResult.rows[0]
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: err.message
    });
  }
};