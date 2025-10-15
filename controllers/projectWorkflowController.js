import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';
import {
  validateProjectWorkflow,
  validateMilestone,
  sanitizeProjectWorkflow,
  calculateOverallProgress,
  calculatePhaseProgress,
  generateMilestoneId,
  generateDeliverableId,
  generateTimelineId,
  generateCommunicationId
} from '../models/projectWorkflowModel.js';
import {
  initializeSubsteps,
  toggleSubstep,
  calculatePhaseProgressFromSubsteps,
  calculateOverallProgressFromPhases
} from '../models/substepsHelper.js';

// Get all projects for a user
export const getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    const projects = await db.collection('projectWorkflow')
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    const sanitizedProjects = projects.map(sanitizeProjectWorkflow);

    res.json({
      success: true,
      data: { projects: sanitizedProjects }
    });

  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user projects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all projects (admin only)
export const getAllProjects = async (req, res) => {
  try {
    const db = getDatabase();
    const {
      page = 1,
      limit = 1000, // Increased default limit to get more projects
      search = '',
      status = '',
      phase = '',
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { projectName: { $regex: search, $options: 'i' } },
        { projectDescription: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }
    if (phase) {
      query.currentPhase = phase;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const projects = await db.collection('projectWorkflow')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('projectWorkflow').countDocuments(query);

    // Enrich with user data
    const userIds = [...new Set(projects.map(p => p.userId))];
    const users = await db.collection('users')
      .find({ _id: { $in: userIds.map(id => new ObjectId(id)) } })
      .toArray();

    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = {
        displayName: user.displayName,
        email: user.email
      };
    });

    const enrichedProjects = projects.map(project => {
      const sanitized = sanitizeProjectWorkflow(project);
      const user = userMap[project.userId];
      return {
        ...sanitized,
        owner: user?.displayName || user?.email || 'Unknown User',
        ownerEmail: user?.email || 'Unknown'
      };
    });

    res.json({
      success: true,
      data: {
        projects: enrichedProjects,
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
      message: 'Failed to get projects',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get single project
export const getProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const db = getDatabase();

    const project = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization (user can only access their own projects unless admin)
    if (req.user.role !== 'admin' && project.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to project'
      });
    }

    const sanitized = sanitizeProjectWorkflow(project);

    res.json({
      success: true,
      data: { project: sanitized }
    });

  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Create new project
export const createProject = async (req, res) => {
  try {
    const {
      userId,
      projectName,
      projectDescription,
      status = 'planning',
      currentPhase = 'discovery',
      currentSubstep = 'first-call',
      projectType = 'mvp-development',
      category = 'development',
      tags = [],
      technologies = [],
      priority = 'medium'
    } = req.body;

    const db = getDatabase();

    const projectData = {
      userId: userId || req.user._id.toString(),
      projectName,
      projectDescription: projectDescription || '',
      status,
      currentPhase,
      currentSubstep,
      projectType,
      category,
      tags,
      technologies,
      priority,
      progress: {
        overall: 0,
        phases: {
          discovery: 0,
          design: 0,
          development: 0,
          testing: 0,
          launch: 0,
          support: 0
        }
      },
      milestones: [],
      deliverables: [],
      timeline: {
        startDate: new Date(),
        endDate: null,
        estimatedCompletion: null
      },
      teamMembers: [],
      budget: {
        total: 0,
        allocated: 0,
        spent: 0,
        remaining: 0
      },
      communications: [],
      adminNotes: '',
      substeps: initializeSubsteps(), // Initialize all substeps as incomplete
      createdAt: new Date(),
      updatedAt: new Date(),
      lastUpdatedBy: req.user._id.toString()
    };

    // Validate
    const validation = validateProjectWorkflow(projectData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const result = await db.collection('projectWorkflow').insertOne(projectData);
    const project = await db.collection('projectWorkflow').findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project: sanitizeProjectWorkflow(project) }
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
    const { projectId } = req.params;
    const updates = req.body;
    const db = getDatabase();

    // Check if project exists
    const project = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && project.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update project'
      });
    }

    const updateData = {
      ...updates,
      updatedAt: new Date(),
      lastUpdatedBy: req.user._id.toString()
    };

    // Remove immutable fields
    delete updateData._id;
    delete updateData.userId;
    delete updateData.createdAt;

    await db.collection('projectWorkflow').updateOne(
      { _id: new ObjectId(projectId) },
      { $set: updateData }
    );

    const updatedProject = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: sanitizeProjectWorkflow(updatedProject) }
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
    const { projectId } = req.params;
    const db = getDatabase();

    const project = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization (admin or project owner can delete)
    if (req.user.role !== 'admin' && project.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own projects'
      });
    }

    await db.collection('projectWorkflow').deleteOne({
      _id: new ObjectId(projectId)
    });

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

// Update project phase/substep
export const updateProjectPhase = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { currentPhase, currentSubstep, phaseProgress, notes } = req.body;
    const db = getDatabase();

    const project = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && project.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update project'
      });
    }

    const updateData = {
      currentPhase,
      currentSubstep,
      [`progress.phases.${currentPhase}`]: phaseProgress || 0,
      updatedAt: new Date(),
      lastUpdatedBy: req.user._id.toString()
    };

    if (notes) {
      updateData.adminNotes = notes;
    }

    // Recalculate overall progress
    const newProgress = { ...project.progress.phases, [currentPhase]: phaseProgress || 0 };
    const overallProgress = Math.round(
      Object.values(newProgress).reduce((sum, val) => sum + val, 0) / 6
    );
    updateData['progress.overall'] = overallProgress;

    await db.collection('projectWorkflow').updateOne(
      { _id: new ObjectId(projectId) },
      { $set: updateData }
    );

    const updatedProject = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    // Also update user progress if it exists
    await db.collection('userProgress').updateOne(
      { userId: project.userId },
      {
        $set: {
          currentStatus: {
            currentPhase,
            currentSubstep,
            phaseProgress: phaseProgress || 0,
            substepProgress: 0,
            updatedAt: new Date(),
            updatedBy: req.user.role === 'admin' ? 'admin' : 'user',
            notes: notes || ''
          },
          updatedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Project phase updated successfully',
      data: { project: sanitizeProjectWorkflow(updatedProject) }
    });

  } catch (error) {
    console.error('Update project phase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update project phase',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Milestone operations
export const addMilestone = async (req, res) => {
  try {
    const { projectId } = req.params;
    const milestoneData = req.body;
    const db = getDatabase();

    const project = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && project.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to add milestone'
      });
    }

    const milestone = {
      id: generateMilestoneId(),
      ...milestoneData,
      status: milestoneData.status || 'pending',
      progress: milestoneData.progress || 0,
      weight: milestoneData.weight || 1,
      dependencies: milestoneData.dependencies || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate
    const validation = validateMilestone(milestone);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    await db.collection('projectWorkflow').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $push: { milestones: milestone },
        $set: { updatedAt: new Date(), lastUpdatedBy: req.user._id.toString() }
      }
    );

    const updatedProject = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    // Recalculate progress
    const overallProgress = calculateOverallProgress(updatedProject.milestones);
    await db.collection('projectWorkflow').updateOne(
      { _id: new ObjectId(projectId) },
      { $set: { 'progress.overall': overallProgress } }
    );

    res.json({
      success: true,
      message: 'Milestone added successfully',
      data: {
        milestone,
        project: sanitizeProjectWorkflow(updatedProject)
      }
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

export const updateMilestone = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const updates = req.body;
    const db = getDatabase();

    const project = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && project.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update milestone'
      });
    }

    const milestoneIndex = project.milestones.findIndex(m => m.id === milestoneId);
    if (milestoneIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found'
      });
    }

    // Update milestone
    const updatedMilestone = {
      ...project.milestones[milestoneIndex],
      ...updates,
      updatedAt: new Date()
    };

    // If completed, set completedDate
    if (updates.status === 'completed' && !updatedMilestone.completedDate) {
      updatedMilestone.completedDate = new Date();
    }

    project.milestones[milestoneIndex] = updatedMilestone;

    await db.collection('projectWorkflow').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          milestones: project.milestones,
          updatedAt: new Date(),
          lastUpdatedBy: req.user._id.toString()
        }
      }
    );

    // Recalculate progress
    const overallProgress = calculateOverallProgress(project.milestones);
    const phaseProgress = {};
    ['discovery', 'design', 'development', 'testing', 'launch', 'support'].forEach(phase => {
      phaseProgress[`progress.phases.${phase}`] = calculatePhaseProgress(project.milestones, phase);
    });

    await db.collection('projectWorkflow').updateOne(
      { _id: new ObjectId(projectId) },
      { $set: { 'progress.overall': overallProgress, ...phaseProgress } }
    );

    const updatedProject = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      data: {
        milestone: updatedMilestone,
        project: sanitizeProjectWorkflow(updatedProject)
      }
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

export const deleteMilestone = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const db = getDatabase();

    const project = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && project.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete milestone'
      });
    }

    await db.collection('projectWorkflow').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $pull: { milestones: { id: milestoneId } },
        $set: { updatedAt: new Date(), lastUpdatedBy: req.user._id.toString() }
      }
    );

    const updatedProject = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    // Recalculate progress
    const overallProgress = calculateOverallProgress(updatedProject.milestones);
    await db.collection('projectWorkflow').updateOne(
      { _id: new ObjectId(projectId) },
      { $set: { 'progress.overall': overallProgress } }
    );

    res.json({
      success: true,
      message: 'Milestone deleted successfully'
    });

  } catch (error) {
    console.error('Delete milestone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete milestone',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Deliverable operations
export const addDeliverable = async (req, res) => {
  try {
    const { projectId } = req.params;
    const deliverableData = req.body;
    const db = getDatabase();

    const project = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const deliverable = {
      id: generateDeliverableId(),
      projectId,
      ...deliverableData,
      status: deliverableData.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('projectWorkflow').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $push: { deliverables: deliverable },
        $set: { updatedAt: new Date(), lastUpdatedBy: req.user._id.toString() }
      }
    );

    res.json({
      success: true,
      message: 'Deliverable added successfully',
      data: { deliverable }
    });

  } catch (error) {
    console.error('Add deliverable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add deliverable',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Communication operations
export const addCommunication = async (req, res) => {
  try {
    const { projectId } = req.params;
    const communicationData = req.body;
    const db = getDatabase();

    const project = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const communication = {
      id: generateCommunicationId(),
      ...communicationData,
      fromUserId: req.user._id.toString(),
      fromUserName: req.user.displayName || req.user.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('projectWorkflow').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $push: { communications: communication },
        $set: { updatedAt: new Date() }
      }
    );

    res.json({
      success: true,
      message: 'Communication added successfully',
      data: { communication }
    });

  } catch (error) {
    console.error('Add communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add communication',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get project statistics (admin)
export const getProjectStatistics = async (req, res) => {
  try {
    const db = getDatabase();

    const stats = await db.collection('projectWorkflow').aggregate([
      {
        $facet: {
          statusCounts: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          phaseCounts: [
            { $group: { _id: '$currentPhase', count: { $sum: 1 } } }
          ],
          averageProgress: [
            { $group: { _id: null, avg: { $avg: '$progress.overall' } } }
          ],
          totalProjects: [
            { $count: 'count' }
          ]
        }
      }
    ]).toArray();

    res.json({
      success: true,
      data: { statistics: stats[0] }
    });

  } catch (error) {
    console.error('Get project statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Toggle substep completion
export const toggleProjectSubstep = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { phase, substepName } = req.body;
    const db = getDatabase();

    const project = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && project.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Use existing substeps or initialize if they don't exist
    let substeps = project.substeps;
    if (!substeps) {
      substeps = initializeSubsteps();
    }

    // Toggle the substep
    substeps = toggleSubstep(substeps, phase, substepName);

    // Calculate phase progress
    const phaseProgressUpdate = {};
    Object.keys(substeps).forEach(p => {
      phaseProgressUpdate[`progress.phases.${p}`] = calculatePhaseProgressFromSubsteps(substeps[p]);
    });

    // Calculate overall progress
    const overallProgress = calculateOverallProgressFromPhases(substeps);

    // Update database
    await db.collection('projectWorkflow').updateOne(
      { _id: new ObjectId(projectId) },
      {
        $set: {
          substeps,
          'progress.overall': overallProgress,
          ...phaseProgressUpdate,
          updatedAt: new Date(),
          lastUpdatedBy: req.user._id.toString()
        }
      }
    );

    const updatedProject = await db.collection('projectWorkflow').findOne({
      _id: new ObjectId(projectId)
    });

    res.json({
      success: true,
      message: 'Substep updated successfully',
      data: { project: sanitizeProjectWorkflow(updatedProject) }
    });

  } catch (error) {
    console.error('Toggle substep error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update substep',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
