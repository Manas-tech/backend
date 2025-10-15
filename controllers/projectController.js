import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';

// Get all projects for a user
export const getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, type, page = 1, limit = 10, search } = req.query;
    const db = getDatabase();

    // Build filter
    const filter = { userId };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get projects with pagination
    const projects = await db.collection('projects_new')
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count
    const total = await db.collection('projects_new').countDocuments(filter);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all projects (Admin only)
export const getAllProjects = async (req, res) => {
  try {
    const { status, type, userId, page = 1, limit = 10, search } = req.query;
    const db = getDatabase();

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (userId) filter.userId = userId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get projects with pagination
    const projects = await db.collection('projects_new')
      .find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count
    const total = await db.collection('projects_new').countDocuments(filter);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get project by ID
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const project = await db.collection('projects_new').findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if user has access to this project
    if (project.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { project }
    });

  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    console.log('🚀 Creating project with data:', JSON.stringify(req.body, null, 2));
    
    const {
      name,
      description,
      type,
      category,
      priority = 'medium',
      startDate,
      targetDate,
      budget,
      currency = 'USD',
      tags = [],
      technologies = [],
      services = [],
      settings = {}
    } = req.body;

    const db = getDatabase();

    // Use minimal required fields to avoid validation issues
    const projectData = {
      name,
      description,
      userId: req.user.id,
      status: 'planning',
      type,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📋 Final project data:', JSON.stringify(projectData, null, 2));
    console.log('📋 Project data keys:', Object.keys(projectData));

    const result = await db.collection('projects_new').insertOne(projectData);

    const newProject = await db.collection('projects_new').findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project: newProject }
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const db = getDatabase();

    // Check if project exists and user has access
    const existingProject = await db.collection('projects_new').findOne({ _id: new ObjectId(id) });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (existingProject.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.createdBy;

    // Add updated timestamp
    updateData.updatedAt = new Date();

    // Update project
    await db.collection('projects_new').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedProject = await db.collection('projects_new').findOne({ _id: new ObjectId(id) });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: updatedProject }
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if project exists and user has access
    const existingProject = await db.collection('projects_new').findOne({ _id: new ObjectId(id) });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions (only owner or admin can delete)
    if (existingProject.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete project
    await db.collection('projects_new').deleteOne({ _id: new ObjectId(id) });

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Add milestone to project
export const addMilestone = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority = 'medium', assignedTo, tags = [] } = req.body;
    const db = getDatabase();

    // Check if project exists and user has access
    const project = await db.collection('projects_new').findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (project.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const milestone = {
      id: new ObjectId().toString(),
      title,
      description,
      status: 'pending',
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      completedDate: null,
      assignedTo: assignedTo || req.user.id,
      progress: 0,
      tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('projects_new').updateOne(
      { _id: new ObjectId(id) },
      { 
        $push: { milestones: milestone },
        $set: { 
          updatedAt: new Date(),
          'metrics.lastActivity': new Date()
        }
      }
    );

    const updatedProject = await db.collection('projects_new').findOne({ _id: new ObjectId(id) });

    res.json({
      success: true,
      message: 'Milestone added successfully',
      data: { project: updatedProject }
    });

  } catch (error) {
    console.error('Add milestone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add milestone',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Update milestone
export const updateMilestone = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const updateData = req.body;
    const db = getDatabase();

    // Check if project exists and user has access
    const project = await db.collection('projects_new').findOne({ _id: new ObjectId(id) });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions
    if (project.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Find and update the milestone
    const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
    if (milestoneIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Update milestone
    const updatedMilestones = [...project.milestones];
    updatedMilestones[milestoneIndex] = {
      ...updatedMilestones[milestoneIndex],
      ...updateData,
      updatedAt: new Date()
    };

    await db.collection('projects_new').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          milestones: updatedMilestones,
          updatedAt: new Date(),
          'metrics.lastActivity': new Date()
        }
      }
    );

    const updatedProject = await db.collection('projects_new').findOne({ _id: new ObjectId(id) });

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: { project: updatedProject }
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

// Get project statistics
export const getProjectStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    const stats = await db.collection('projects_new').aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalProjects: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          planningProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'planning'] }, 1, 0] }
          },
          onHoldProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'on-hold'] }, 1, 0] }
          },
          averageProgress: { $avg: '$progress' },
          totalBudget: { $sum: '$budget' }
        }
      }
    ]).toArray();

    const result = stats[0] || {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      planningProjects: 0,
      onHoldProjects: 0,
      averageProgress: 0,
      totalBudget: 0
    };

    res.json({
      success: true,
      data: { stats: result }
    });

  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch project statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
