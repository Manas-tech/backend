import { getDatabase } from '../config/database.js';

export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    const progress = await db.collection('userProgress').findOne({ userId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    res.json({
      success: true,
      data: { progress }
    });

  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createUserProgress = async (req, res) => {
  try {
    const {
      userId,
      overall,
      phases,
      milestonesCompleted,
      totalMilestones,
      lastUpdated,
      currentStatus
    } = req.body;
    
    const db = getDatabase();

    // Check if progress already exists
    const existingProgress = await db.collection('userProgress').findOne({ userId });
    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'User progress already exists for this user'
      });
    }

    const progressData = {
      userId,
      overall: overall || 0,
      phases: phases || {
        discovery: 0,
        design: 0,
        development: 0,
        testing: 0,
        launch: 0,
        support: 0
      },
      milestonesCompleted: milestonesCompleted || 0,
      totalMilestones: totalMilestones || 0,
      lastUpdated: lastUpdated || new Date(),
      currentStatus: currentStatus || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('userProgress').insertOne(progressData);
    const progress = await db.collection('userProgress').findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'User progress created successfully',
      data: { progress }
    });

  } catch (error) {
    console.error('Create user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const db = getDatabase();

    // Check if progress exists
    const existingProgress = await db.collection('userProgress').findOne({ userId });
    if (!existingProgress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    const updateData = {
      ...updates,
      lastUpdated: new Date(),
      updatedAt: new Date()
    };

    await db.collection('userProgress').updateOne(
      { userId },
      { $set: updateData }
    );

    const updatedProgress = await db.collection('userProgress').findOne({ userId });

    res.json({
      success: true,
      message: 'User progress updated successfully',
      data: { progress: updatedProgress }
    });

  } catch (error) {
    console.error('Update user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateCurrentPhaseSubstep = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPhase, currentSubstep, phaseProgress, substepProgress, notes, updatedBy } = req.body;
    const db = getDatabase();

    // Check if progress exists
    const existingProgress = await db.collection('userProgress').findOne({ userId });
    if (!existingProgress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    const currentStatus = {
      currentPhase,
      currentSubstep,
      phaseProgress: phaseProgress || 0,
      substepProgress: substepProgress || 0,
      updatedAt: new Date(),
      updatedBy: updatedBy || 'system',
      notes: notes || ''
    };

    const updateData = {
      currentStatus,
      lastUpdated: new Date(),
      updatedAt: new Date()
    };

    await db.collection('userProgress').updateOne(
      { userId },
      { $set: updateData }
    );

    const updatedProgress = await db.collection('userProgress').findOne({ userId });

    res.json({
      success: true,
      message: 'Current phase substep updated successfully',
      data: { progress: updatedProgress }
    });

  } catch (error) {
    console.error('Update current phase substep error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update current phase substep',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateMilestone = async (req, res) => {
  try {
    const { userId } = req.params;
    const { milestoneId, completed } = req.body;
    const db = getDatabase();

    // Check if progress exists
    const existingProgress = await db.collection('userProgress').findOne({ userId });
    if (!existingProgress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    // Update milestone completion
    const updateData = {
      lastUpdated: new Date(),
      updatedAt: new Date()
    };

    if (completed) {
      updateData.$inc = { milestonesCompleted: 1 };
    } else {
      updateData.$inc = { milestonesCompleted: -1 };
    }

    await db.collection('userProgress').updateOne(
      { userId },
      { $set: updateData }
    );

    const updatedProgress = await db.collection('userProgress').findOne({ userId });

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: { progress: updatedProgress }
    });

  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update milestone',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getAllUserProgress = async (req, res) => {
  try {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      currentPhase = '',
      sortBy = 'lastUpdated',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { userId: { $regex: search, $options: 'i' } }
      ];
    }
    if (currentPhase) {
      query['currentStatus.currentPhase'] = currentPhase;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const progress = await db.collection('userProgress')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('userProgress').countDocuments(query);

    res.json({
      success: true,
      data: {
        progress,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deleteUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    // Check if progress exists
    const progress = await db.collection('userProgress').findOne({ userId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'User progress not found'
      });
    }

    await db.collection('userProgress').deleteOne({ userId });

    res.json({
      success: true,
      message: 'User progress deleted successfully'
    });

  } catch (error) {
    console.error('Delete user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user progress',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};