import { ObjectId } from 'mongodb';

// User Model Schema
export const userSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["email", "role", "isActive", "createdAt", "updatedAt"],
    properties: {
      email: {
        bsonType: "string",
        pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      },
      password: { bsonType: "string" },
      displayName: { bsonType: "string" },
      photoURL: { bsonType: "string" },
      bio: { bsonType: "string" },
      linkedin: { bsonType: "string" },
      website: { bsonType: "string" },
      role: { enum: ["user", "admin"] },
      isActive: { bsonType: "bool" },
      emailVerified: { bsonType: "bool" },
      hasCompletedOnboarding: { bsonType: "bool" },
      onboardingCompletedAt: { bsonType: "date" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      lastLoginAt: { bsonType: "date" },
      createdViaAdmin: { bsonType: "bool" },
      provider: { bsonType: "string" },
      emailNotifications: { bsonType: "bool" },
      marketingEmails: { bsonType: "bool" },
      projectUpdates: { bsonType: "bool" },
      securityAlerts: { bsonType: "bool" },
      darkMode: { bsonType: "bool" }
    }
  }
};

// User indexes
export const userIndexes = [
  { key: { email: 1 }, unique: true },
  { key: { role: 1 } },
  { key: { createdAt: -1 } },
  { key: { isActive: 1 } }
];

// User validation and transformation functions
export const validateUser = (userData) => {
  const errors = [];

  if (!userData.email || !userData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }

  if (userData.role && !['user', 'admin'].includes(userData.role)) {
    errors.push('Role must be either user or admin');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeUser = (user) => {
  if (!user) return null;

  // Remove sensitive fields
  const { password, ...sanitized } = user;

  // Convert ObjectId to string
  if (sanitized._id && sanitized._id instanceof ObjectId) {
    sanitized._id = sanitized._id.toString();
  }

  return sanitized;
};
