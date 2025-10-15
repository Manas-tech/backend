import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user still exists and is active
    const db = getDatabase();
    const { ObjectId } = await import('mongodb');
    
    // Handle both MongoDB ObjectIds and Firebase UIDs
    let user;
    try {
      // Try as MongoDB ObjectId first (new system users)
      user = await db.collection('users').findOne({ 
        _id: new ObjectId(decoded.userId),
        isActive: true 
      });
    } catch (error) {
      // If ObjectId conversion fails, try as string (Firebase users)
      user = await db.collection('users').findOne({ 
        _id: decoded.userId,
        isActive: true 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive' 
      });
    }

    req.user = {
      _id: user._id,
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

export const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'User authentication required' 
    });
  }
  next();
};

// Default export for backward compatibility
export default authenticateToken;

