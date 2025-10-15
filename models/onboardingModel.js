import { ObjectId } from 'mongodb';

// User Onboarding Model Schema
export const onboardingSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["userType", "projectName", "projectDescription", "industry", "timeline", "budget", "services", "primaryGoal", "contactPreference", "createdAt", "updatedAt"],
    properties: {
      userId: { bsonType: "string" },
      userType: { bsonType: "string" },
      projectName: { bsonType: "string" },
      projectDescription: { bsonType: "string" },
      industry: { bsonType: "string" },
      timeline: { bsonType: "string" },
      budget: { bsonType: "number" },
      services: { bsonType: "array" },
      primaryGoal: { bsonType: "string" },
      contactPreference: { bsonType: "string" },
      startupIdea: { bsonType: "string" },
      briefDescription: { bsonType: "string" },
      stage: { bsonType: "string" },
      incubationModel: { bsonType: "string" },
      thesis: { bsonType: "string" },
      domain: { bsonType: "string" },
      investmentType: { bsonType: "string" },
      companyName: { bsonType: "string" },
      rdProject: { bsonType: "string" },
      teamStructure: { bsonType: "string" },
      rdScope: { bsonType: "string" },
      pocBudget: { bsonType: "number" },
      isComplete: { bsonType: "bool" },
      completedAt: { bsonType: "date" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" }
    }
  }
};

// Onboarding indexes
export const onboardingIndexes = [
  { key: { userId: 1 }, unique: true },
  { key: { userType: 1 } },
  { key: { industry: 1 } },
  { key: { createdAt: -1 } },
  { key: { isComplete: 1 } }
];

// Onboarding validation
export const validateOnboarding = (onboardingData) => {
  const errors = [];

  if (!onboardingData.userType || onboardingData.userType.trim().length === 0) {
    errors.push('User type is required');
  }

  if (!onboardingData.projectName || onboardingData.projectName.trim().length === 0) {
    errors.push('Project name is required');
  }

  if (!onboardingData.projectDescription || onboardingData.projectDescription.trim().length === 0) {
    errors.push('Project description is required');
  }

  if (!onboardingData.industry || onboardingData.industry.trim().length === 0) {
    errors.push('Industry is required');
  }

  if (!onboardingData.timeline || onboardingData.timeline.trim().length === 0) {
    errors.push('Timeline is required');
  }

  if (onboardingData.budget === undefined || onboardingData.budget === null || isNaN(onboardingData.budget)) {
    errors.push('Valid budget is required');
  }

  if (!Array.isArray(onboardingData.services)) {
    errors.push('Services must be an array');
  }

  if (!onboardingData.primaryGoal || onboardingData.primaryGoal.trim().length === 0) {
    errors.push('Primary goal is required');
  }

  if (!onboardingData.contactPreference || onboardingData.contactPreference.trim().length === 0) {
    errors.push('Contact preference is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeOnboarding = (onboarding) => {
  if (!onboarding) return null;

  // Convert ObjectId to string
  if (onboarding._id && onboarding._id instanceof ObjectId) {
    onboarding._id = onboarding._id.toString();
  }

  return onboarding;
};
