import { getDatabase } from '../config/database.js';

export const getAllUsers = async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {}; // Show all users including inactive ones
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await db.collection('users')
      .find(query, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('users').countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const { ObjectId } = await import('mongodb');

    // Handle both MongoDB ObjectIds and string IDs
    let userId;
    try {
      userId = new ObjectId(id);
    } catch (error) {
      userId = id;
    }

    const user = await db.collection('users').findOne(
      { _id: userId },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;
    const db = getDatabase();
    const { ObjectId } = await import('mongodb');

    // Handle both MongoDB ObjectIds and string IDs (Firebase legacy)
    let userId;
    try {
      // Try as MongoDB ObjectId first
      userId = new ObjectId(id);
    } catch (error) {
      // If ObjectId conversion fails, use as string
      userId = id;
    }

    // Check if user exists
    const existingUser = await db.collection('users').findOne({ _id: userId });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailTaken = await db.collection('users').findOne({
        email,
        _id: { $ne: userId }
      });
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken'
        });
      }
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    await db.collection('users').updateOne(
      { _id: userId },
      { $set: updateData }
    );

    const updatedUser = await db.collection('users').findOne(
      { _id: userId },
      { projection: { password: 0 } }
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const { ObjectId } = await import('mongodb');

    // Handle both MongoDB ObjectIds and string IDs
    let userId;
    try {
      userId = new ObjectId(id);
    } catch (error) {
      userId = id;
    }

    // Check if user exists
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Hard delete - actually remove the user from database
    const deleteResult = await db.collection('users').deleteOne({ _id: userId });
    
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found or already deleted'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const db = getDatabase();

    const [
      totalUsers,
      activeUsers,
      adminUsers,
      recentUsers
    ] = await Promise.all([
      db.collection('users').countDocuments(), // Count all users including inactive ones
      db.collection('users').countDocuments({ isActive: true }),
      db.collection('users').countDocuments({ role: 'admin' }), // Count all admins including inactive ones
      db.collection('users').countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        adminUsers,
        recentUsers
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user stats',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getUsersLastUpdated = async (req, res) => {
  try {
    const db = getDatabase();

    // Get the most recently updated user
    const lastUpdatedUser = await db.collection('users')
      .find({}, { projection: { updatedAt: 1, createdAt: 1 } })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(1)
      .toArray();

    const lastUpdated = lastUpdatedUser.length > 0
      ? (lastUpdatedUser[0].updatedAt || lastUpdatedUser[0].createdAt)
      : new Date();

    res.json({
      success: true,
      data: {
        lastUpdated: lastUpdated.toISOString(),
        timestamp: lastUpdated.getTime()
      }
    });

  } catch (error) {
    console.error('Get users last updated error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get last updated timestamp',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

