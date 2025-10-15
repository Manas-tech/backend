import { ObjectId } from 'mongodb';

// User Progress Model Schema
export const progressSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["userId", "overall", "phases", "milestonesCompleted", "totalMilestones"],
    properties: {
      userId: { bsonType: "string" },
      overall: { bsonType: "number", minimum: 0, maximum: 100 },
      phases: {
        bsonType: "object",
        required: ["discovery", "design", "development", "testing", "launch", "support"],
        properties: {
          discovery: { bsonType: "number", minimum: 0, maximum: 100 },
          design: { bsonType: "number", minimum: 0, maximum: 100 },
          development: { bsonType: "number", minimum: 0, maximum: 100 },
          testing: { bsonType: "number", minimum: 0, maximum: 100 },
          launch: { bsonType: "number", minimum: 0, maximum: 100 },
          support: { bsonType: "number", minimum: 0, maximum: 100 }
        }
      },
      milestonesCompleted: { bsonType: "number" },
      totalMilestones: { bsonType: "number" },
      lastUpdated: { bsonType: "date" },
      currentStatus: {
        bsonType: "object",
        properties: {
          currentPhase: { bsonType: "string" },
          currentSubstep: { bsonType: "string" },
          phaseProgress: { bsonType: "number" },
          substepProgress: { bsonType: "number" },
          updatedAt: { bsonType: "date" },
          updatedBy: { bsonType: "string" },
          notes: { bsonType: "string" }
        }
      }
    }
  }
};

// Progress indexes
export const progressIndexes = [
  { key: { userId: 1 }, unique: true },
  { key: { overall: -1 } },
  { key: { lastUpdated: -1 } }
];

// Project Tracking Model Schema
export const projectTrackingSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["projectId", "userId", "projectName", "status", "progress", "milestones", "lastUpdated"],
    properties: {
      projectId: { bsonType: "string" },
      userId: { bsonType: "string" },
      projectName: { bsonType: "string" },
      status: { enum: ["planning", "active", "on-hold", "completed", "cancelled"] },
      progress: { bsonType: "number", minimum: 0, maximum: 100 },
      milestones: { bsonType: "array" },
      lastUpdated: { bsonType: "date" },
      adminNotes: { bsonType: "string" }
    }
  }
};

// Project Tracking indexes
export const projectTrackingIndexes = [
  { key: { userId: 1 } },
  { key: { projectId: 1 } },
  { key: { status: 1 } },
  { key: { lastUpdated: -1 } }
];

// Progress validation
export const validateProgress = (progressData) => {
  const errors = [];

  if (!progressData.userId || progressData.userId.trim().length === 0) {
    errors.push('User ID is required');
  }

  if (progressData.overall === undefined || progressData.overall < 0 || progressData.overall > 100) {
    errors.push('Overall progress must be between 0 and 100');
  }

  if (!progressData.phases || typeof progressData.phases !== 'object') {
    errors.push('Phases object is required');
  } else {
    const requiredPhases = ['discovery', 'design', 'development', 'testing', 'launch', 'support'];
    for (const phase of requiredPhases) {
      if (progressData.phases[phase] === undefined) {
        errors.push(`Phase ${phase} is required`);
      } else if (progressData.phases[phase] < 0 || progressData.phases[phase] > 100) {
        errors.push(`Phase ${phase} must be between 0 and 100`);
      }
    }
  }

  if (progressData.milestonesCompleted === undefined || progressData.milestonesCompleted < 0) {
    errors.push('Valid milestones completed count is required');
  }

  if (progressData.totalMilestones === undefined || progressData.totalMilestones < 0) {
    errors.push('Valid total milestones count is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeProgress = (progress) => {
  if (!progress) return null;

  // Convert ObjectId to string
  if (progress._id && progress._id instanceof ObjectId) {
    progress._id = progress._id.toString();
  }

  return progress;
};

export const sanitizeProjectTracking = (project) => {
  if (!project) return null;

  // Convert ObjectId to string
  if (project._id && project._id instanceof ObjectId) {
    project._id = project._id.toString();
  }

  return project;
};
