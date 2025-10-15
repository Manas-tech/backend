import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '_refresh';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// Helper function to generate access token
const generateAccessToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Helper function to generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
};

export const register = async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;
    const db = getDatabase();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      name,
      role: role,
      isActive: true,
      emailVerified: true, // Allow access without email verification
      hasCompletedOnboarding: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(userData);
    const userId = result.insertedId;

    // Create default onboarding data for new user
    const defaultOnboarding = {
      userId: userId.toString(),
      userType: 'founder',
      projectName: 'My Startup Project',
      projectDescription: 'A new startup idea I want to develop',
      industry: 'technology',
      timeline: '3-6 months',
      budget: 10000,
      services: ['mvp-development', 'ui-design', 'market-research'],
      primaryGoal: 'validate-idea',
      contactPreference: 'email',
      isComplete: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('userOnboarding').insertOne(defaultOnboarding);

    // Create default progress data for new user
    const defaultProgress = {
      userId: userId.toString(),
      overall: 0,
      phases: {
        discovery: 0,
        design: 0,
        development: 0,
        testing: 0,
        launch: 0,
        support: 0
      },
      milestonesCompleted: 0,
      totalMilestones: 12,
      lastUpdated: new Date(),
      currentStatus: {
        currentPhase: 'discovery',
        currentSubstep: 'market-research',
        phaseProgress: 0,
        substepProgress: 0,
        updatedAt: new Date(),
        updatedBy: 'system',
        notes: 'Getting started with your MVP journey'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('userProgress').insertOne(defaultProgress);

    // Generate JWT tokens
    const accessToken = generateAccessToken(userId.toString(), email, role);
    const refreshToken = generateRefreshToken(userId.toString());

    // Store refresh token in database
    await db.collection('users').updateOne(
      { _id: userId },
      { $set: { refreshToken, lastLoginAt: new Date() } }
    );

    // Return user data (without password)
    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { password: 0, refreshToken: 0 } }
    );

    // Emit real-time event to all connected admin clients
    const io = req.app.get('io');
    if (io) {
      io.to('admin-room').emit('user-created', {
        user,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDatabase();

    // Find user
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if user has a password (new system users) or is a Firebase user
    if (!user.password) {
      // This is a Firebase-migrated user - they need to set a password first
      return res.status(401).json({
        success: false,
        message: 'This account was migrated from Firebase. Please use the password reset feature to set a new password.',
        code: 'FIREBASE_MIGRATED_USER'
      });
    }
    
    // Verify password for new system users
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user._id.toString(), user.email, user.role);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Update last login and store refresh token
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date(), refreshToken } }
    );

    // Return user data (without password and refresh token)
    const { password: _, refreshToken: __, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const db = getDatabase();
    const { ObjectId } = await import('mongodb');

    // Handle both MongoDB ObjectIds and Firebase UIDs
    let user;
    try {
      // Try as MongoDB ObjectId first (new system users)
      user = await db.collection('users').findOne(
        { _id: new ObjectId(req.user.id) },
        { projection: { password: 0, refreshToken: 0 } }
      );
    } catch (error) {
      // If ObjectId conversion fails, try as string (Firebase users)
      user = await db.collection('users').findOne(
        { _id: req.user.id },
        { projection: { password: 0, refreshToken: 0 } }
      );
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('🔄 getProfile - returning user data:', {
      id: user._id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      updatedAt: user.updatedAt
    });

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      displayName, 
      bio, 
      photoURL, 
      linkedin, 
      website,
      emailNotifications,
      marketingEmails,
      projectUpdates,
      securityAlerts,
      darkMode
    } = req.body;
    const db = getDatabase();
    const { ObjectId } = await import('mongodb');

    // Handle both MongoDB ObjectIds and Firebase UIDs
    let userId;
    try {
      // Try as MongoDB ObjectId first (new system users)
      userId = new ObjectId(req.user.id);
    } catch (error) {
      // If ObjectId conversion fails, use as string (Firebase users)
      userId = req.user.id;
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await db.collection('users').findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken'
        });
      }
    }

    const updateData = {
      updatedAt: new Date()
    };

    // Update all provided fields
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (photoURL !== undefined) updateData.photoURL = photoURL;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (website !== undefined) updateData.website = website;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (marketingEmails !== undefined) updateData.marketingEmails = marketingEmails;
    if (projectUpdates !== undefined) updateData.projectUpdates = projectUpdates;
    if (securityAlerts !== undefined) updateData.securityAlerts = securityAlerts;
    if (darkMode !== undefined) updateData.darkMode = darkMode;

    await db.collection('users').updateOne(
      { _id: userId },
      { $set: updateData }
    );

    // Find the updated user - handle both ObjectId and string cases
    let updatedUser;
    try {
      // Try as ObjectId first
      updatedUser = await db.collection('users').findOne(
        { _id: new ObjectId(req.user.id) },
        { projection: { password: 0, refreshToken: 0 } }
      );
    } catch (error) {
      // If ObjectId conversion fails, try as string
      updatedUser = await db.collection('users').findOne(
        { _id: req.user.id },
        { projection: { password: 0, refreshToken: 0 } }
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const db = getDatabase();

    // Get user with password
    const user = await db.collection('users').findOne({ _id: req.user.id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.collection('users').updateOne(
      { _id: req.user.id },
      {
        $set: {
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const db = getDatabase();
    const { ObjectId } = await import('mongodb');

    // Find user and verify stored refresh token
    let user;
    try {
      user = await db.collection('users').findOne({
        _id: new ObjectId(decoded.userId),
        refreshToken,
        isActive: true
      });
    } catch (error) {
      user = await db.collection('users').findOne({
        _id: decoded.userId,
        refreshToken,
        isActive: true
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id.toString(), user.email, user.role);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const logout = async (req, res) => {
  try {
    const db = getDatabase();
    const { ObjectId } = await import('mongodb');

    // Remove refresh token from database
    let userId;
    try {
      userId = new ObjectId(req.user.id);
    } catch (error) {
      userId = req.user.id;
    }

    await db.collection('users').updateOne(
      { _id: userId },
      { $unset: { refreshToken: "" } }
    );

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

