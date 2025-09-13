const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  console.log('Auth middleware called');
  console.log('Request headers:', req.headers);
  
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    console.log('Token from header:', token ? 'Token exists' : 'No token found');

    // Check if no token
    if (!token) {
      console.error('No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token, authorization denied' 
      });
    }

    try {
      // Verify token
      console.log('Verifying token...');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      console.log('Token decoded:', decoded);
      
      // Add user from payload
      console.log('Finding user with ID:', decoded.user.id);
      const user = await User.findById(decoded.user.id).select('-password');
      
      if (!user) {
        console.error('No user found for token');
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      console.log('User authenticated:', user._id);
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token',
        error: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
      });
    }
  } catch (err) {
    console.error('Auth middleware error:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = auth;
