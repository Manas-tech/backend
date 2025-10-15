import { ObjectId } from 'mongodb';

// Project Workflow Model Schema - Comprehensive project tracking
export const projectWorkflowSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["userId", "projectName", "status", "currentPhase", "progress"],
    properties: {
      userId: { bsonType: "string" },
      projectName: { bsonType: "string" },
      projectDescription: { bsonType: "string" },
      status: { enum: ["planning", "active", "on-hold", "completed", "cancelled"] },
      currentPhase: { enum: ["discovery", "design", "development", "testing", "launch", "support"] },
      currentSubstep: { bsonType: "string" },
      progress: {
        bsonType: "object",
        properties: {
          overall: { bsonType: "number", minimum: 0, maximum: 100 },
          phases: {
            bsonType: "object",
            properties: {
              discovery: { bsonType: "number", minimum: 0, maximum: 100 },
              design: { bsonType: "number", minimum: 0, maximum: 100 },
              development: { bsonType: "number", minimum: 0, maximum: 100 },
              testing: { bsonType: "number", minimum: 0, maximum: 100 },
              launch: { bsonType: "number", minimum: 0, maximum: 100 },
              support: { bsonType: "number", minimum: 0, maximum: 100 }
            }
          }
        }
      },
      milestones: { bsonType: "array" },
      deliverables: { bsonType: "array" },
      timeline: {
        bsonType: "object",
        properties: {
          startDate: { bsonType: "date" },
          endDate: { bsonType: "date" },
          estimatedCompletion: { bsonType: "date" }
        }
      },
      teamMembers: { bsonType: "array" },
      budget: {
        bsonType: "object",
        properties: {
          total: { bsonType: "number" },
          allocated: { bsonType: "number" },
          spent: { bsonType: "number" },
          remaining: { bsonType: "number" }
        }
      },
      communications: { bsonType: "array" },
      adminNotes: { bsonType: "string" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      lastUpdatedBy: { bsonType: "string" }
    }
  }
};

// Milestone Schema
export const milestoneSchema = {
  id: String,
  title: String,
  description: String,
  phase: String,
  substep: String,
  status: String, // 'pending' | 'in-progress' | 'completed' | 'blocked'
  dueDate: Date,
  completedDate: Date,
  assignedTo: String,
  dependencies: Array,
  progress: Number,
  notes: String,
  weight: Number, // For progress calculation
  createdAt: Date,
  updatedAt: Date
};

// Deliverable Schema
export const deliverableSchema = {
  id: String,
  projectId: String,
  milestoneId: String,
  title: String,
  description: String,
  type: String, // 'document' | 'design' | 'code' | 'test' | 'deployment'
  status: String, // 'pending' | 'in-progress' | 'completed' | 'review'
  fileUrl: String,
  fileSize: Number,
  uploadedBy: String,
  uploadedAt: Date,
  reviewedBy: String,
  reviewedAt: Date,
  createdAt: Date,
  updatedAt: Date
};

// Timeline Entry Schema
export const timelineEntrySchema = {
  id: String,
  phase: String,
  substep: String,
  startDate: Date,
  endDate: Date,
  estimatedDuration: Number, // in days
  actualDuration: Number, // in days
  status: String, // 'planned' | 'in-progress' | 'completed' | 'delayed'
  dependencies: Array,
  blockers: Array,
  notes: String,
  createdAt: Date,
  updatedAt: Date
};

// Team Member Schema
export const teamMemberSchema = {
  id: String,
  userId: String,
  name: String,
  email: String,
  role: String,
  responsibilities: Array,
  hourlyRate: Number,
  startDate: Date,
  endDate: Date,
  status: String, // 'active' | 'inactive' | 'completed'
  createdAt: Date,
  updatedAt: Date
};

// Communication Schema
export const communicationSchema = {
  id: String,
  type: String, // 'meeting' | 'email' | 'message' | 'call' | 'note'
  subject: String,
  content: String,
  fromUserId: String,
  fromUserName: String,
  toUserId: String,
  toUserName: String,
  isInternal: Boolean,
  attachments: Array,
  createdAt: Date,
  updatedAt: Date
};

// Project Workflow indexes
export const projectWorkflowIndexes = [
  { key: { userId: 1 } },
  { key: { status: 1 } },
  { key: { currentPhase: 1 } },
  { key: { updatedAt: -1 } },
  { key: { 'timeline.startDate': 1 } },
  { key: { 'progress.overall': -1 } }
];

// Validation functions
export const validateProjectWorkflow = (projectData) => {
  const errors = [];

  if (!projectData.userId || projectData.userId.trim().length === 0) {
    errors.push('User ID is required');
  }

  if (!projectData.projectName || projectData.projectName.trim().length === 0) {
    errors.push('Project name is required');
  }

  const validStatuses = ['planning', 'active', 'on-hold', 'completed', 'cancelled'];
  if (!projectData.status || !validStatuses.includes(projectData.status)) {
    errors.push('Valid status is required');
  }

  const validPhases = ['discovery', 'design', 'development', 'testing', 'launch', 'support'];
  if (!projectData.currentPhase || !validPhases.includes(projectData.currentPhase)) {
    errors.push('Valid current phase is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMilestone = (milestoneData) => {
  const errors = [];

  if (!milestoneData.title || milestoneData.title.trim().length === 0) {
    errors.push('Milestone title is required');
  }

  if (!milestoneData.phase) {
    errors.push('Milestone phase is required');
  }

  const validStatuses = ['pending', 'in-progress', 'completed', 'blocked'];
  if (!milestoneData.status || !validStatuses.includes(milestoneData.status)) {
    errors.push('Valid milestone status is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Sanitization functions
export const sanitizeProjectWorkflow = (project) => {
  if (!project) return null;

  // Convert ObjectId to string
  if (project._id && project._id instanceof ObjectId) {
    project._id = project._id.toString();
  }

  // Convert dates
  if (project.timeline) {
    if (project.timeline.startDate) project.timeline.startDate = new Date(project.timeline.startDate);
    if (project.timeline.endDate) project.timeline.endDate = new Date(project.timeline.endDate);
    if (project.timeline.estimatedCompletion) project.timeline.estimatedCompletion = new Date(project.timeline.estimatedCompletion);
  }

  // Convert milestone dates
  if (project.milestones && Array.isArray(project.milestones)) {
    project.milestones = project.milestones.map(m => ({
      ...m,
      dueDate: m.dueDate ? new Date(m.dueDate) : null,
      completedDate: m.completedDate ? new Date(m.completedDate) : null,
      createdAt: m.createdAt ? new Date(m.createdAt) : null,
      updatedAt: m.updatedAt ? new Date(m.updatedAt) : null
    }));
  }

  return project;
};

// Helper functions
export const calculateOverallProgress = (milestones) => {
  if (!milestones || milestones.length === 0) return 0;

  const totalWeight = milestones.reduce((sum, m) => sum + (m.weight || 1), 0);
  const completedWeight = milestones
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + (m.weight || 1), 0);

  return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
};

export const calculatePhaseProgress = (milestones, phase) => {
  const phaseMilestones = milestones.filter(m => m.phase === phase);
  return calculateOverallProgress(phaseMilestones);
};

export const generateMilestoneId = () => {
  return `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateDeliverableId = () => {
  return `deliverable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateTimelineId = () => {
  return `timeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateCommunicationId = () => {
  return `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
