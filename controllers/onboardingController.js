import { getDatabase } from '../config/database.js';

export const getUserOnboarding = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    const onboarding = await db.collection('userOnboarding').findOne({ userId });

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding data not found'
      });
    }

    res.json({
      success: true,
      data: { onboarding }
    });

  } catch (error) {
    console.error('Get user onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createUserOnboarding = async (req, res) => {
  try {
    const {
      userId,
      userType,
      projectName,
      projectDescription,
      industry,
      timeline,
      budget,
      services,
      primaryGoal,
      contactPreference,
      startupIdea,
      briefDescription,
      stage,
      incubationModel,
      thesis,
      domain,
      investmentType,
      companyName,
      rdProject,
      teamStructure,
      rdScope,
      pocBudget,
      isComplete
    } = req.body;
    
    const db = getDatabase();

    // Check if onboarding already exists
    const existingOnboarding = await db.collection('userOnboarding').findOne({ userId });
    if (existingOnboarding) {
      return res.status(400).json({
        success: false,
        message: 'Onboarding data already exists for this user'
      });
    }

    const onboardingData = {
      userId,
      userType,
      projectName,
      projectDescription,
      industry,
      timeline,
      budget,
      services: services || [],
      primaryGoal,
      contactPreference,
      startupIdea,
      briefDescription,
      stage,
      incubationModel,
      thesis,
      domain,
      investmentType,
      companyName,
      rdProject,
      teamStructure,
      rdScope,
      pocBudget,
      isComplete: isComplete || false,
      completedAt: isComplete ? new Date() : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('userOnboarding').insertOne(onboardingData);
    const onboarding = await db.collection('userOnboarding').findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'Onboarding data created successfully',
      data: { onboarding }
    });

  } catch (error) {
    console.error('Create user onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create onboarding data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateUserOnboarding = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const db = getDatabase();

    // Check if onboarding exists
    const existingOnboarding = await db.collection('userOnboarding').findOne({ userId });
    if (!existingOnboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding data not found'
      });
    }

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // If marking as complete, set completedAt
    if (updates.isComplete === true && !existingOnboarding.isComplete) {
      updateData.completedAt = new Date();
    }

    await db.collection('userOnboarding').updateOne(
      { userId },
      { $set: updateData }
    );

    const updatedOnboarding = await db.collection('userOnboarding').findOne({ userId });

    res.json({
      success: true,
      message: 'Onboarding data updated successfully',
      data: { onboarding: updatedOnboarding }
    });

  } catch (error) {
    console.error('Update user onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update onboarding data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deleteUserOnboarding = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    // Check if onboarding exists
    const onboarding = await db.collection('userOnboarding').findOne({ userId });
    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding data not found'
      });
    }

    await db.collection('userOnboarding').deleteOne({ userId });

    res.json({
      success: true,
      message: 'Onboarding data deleted successfully'
    });

  } catch (error) {
    console.error('Delete user onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete onboarding data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getAllOnboarding = async (req, res) => {
  try {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      userType = '',
      isComplete = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { projectDescription: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } }
      ];
    }
    if (userType) {
      query.userType = userType;
    }
    if (isComplete !== '') {
      query.isComplete = isComplete === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const onboarding = await db.collection('userOnboarding')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('userOnboarding').countDocuments(query);

    res.json({
      success: true,
      data: {
        onboarding,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get onboarding data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};