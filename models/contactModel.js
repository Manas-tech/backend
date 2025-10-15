import { ObjectId } from 'mongodb';

// Contact Submission Model Schema
export const contactSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["name", "email", "subject", "message", "type", "priority", "status", "source", "createdAt", "updatedAt"],
    properties: {
      name: { bsonType: "string" },
      email: { bsonType: "string" },
      company: { bsonType: "string" },
      phone: { bsonType: "string" },
      subject: { bsonType: "string" },
      message: { bsonType: "string" },
      type: { enum: ["general", "support", "partnership", "consultation"] },
      priority: { enum: ["low", "medium", "high"] },
      status: { enum: ["new", "in-progress", "resolved", "closed"] },
      userId: { bsonType: "string" },
      source: { enum: ["contact-form", "dashboard", "website"] },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      respondedAt: { bsonType: "date" }
    }
  }
};

// Contact indexes
export const contactIndexes = [
  { key: { status: 1 } },
  { key: { createdAt: -1 } },
  { key: { type: 1 } },
  { key: { priority: 1 } },
  { key: { email: 1 } }
];

// Service Consumption Model Schema
export const serviceConsumptionSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["userId", "userEmail", "userName", "serviceId", "serviceName", "serviceCategory", "serviceType", "purchaseId", "stripeProductId", "totalAmount", "currency", "status", "startDate", "purchasedAt", "createdAt", "updatedAt"],
    properties: {
      userId: { bsonType: "string" },
      userEmail: { bsonType: "string" },
      userName: { bsonType: "string" },
      serviceId: { bsonType: "string" },
      serviceName: { bsonType: "string" },
      serviceCategory: { bsonType: "string" },
      serviceType: { bsonType: "string" },
      purchaseId: { bsonType: "string" },
      stripeProductId: { bsonType: "string" },
      totalAmount: { bsonType: "number" },
      currency: { bsonType: "string" },
      status: { enum: ["purchased", "active", "completed", "cancelled"] },
      startDate: { bsonType: "date" },
      endDate: { bsonType: "date" },
      purchasedAt: { bsonType: "date" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" },
      notes: { bsonType: "string" }
    }
  }
};

// Service Consumption indexes
export const serviceConsumptionIndexes = [
  { key: { userId: 1 } },
  { key: { status: 1 } },
  { key: { serviceCategory: 1 } },
  { key: { purchasedAt: -1 } }
];

// Contact validation
export const validateContact = (contactData) => {
  const errors = [];

  if (!contactData.name || contactData.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!contactData.email || !contactData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Valid email is required');
  }

  if (!contactData.subject || contactData.subject.trim().length === 0) {
    errors.push('Subject is required');
  }

  if (!contactData.message || contactData.message.trim().length === 0) {
    errors.push('Message is required');
  }

  const validTypes = ["general", "support", "partnership", "consultation"];
  if (!contactData.type || !validTypes.includes(contactData.type)) {
    errors.push('Valid type is required');
  }

  const validPriorities = ["low", "medium", "high"];
  if (!contactData.priority || !validPriorities.includes(contactData.priority)) {
    errors.push('Valid priority is required');
  }

  const validSources = ["contact-form", "dashboard", "website"];
  if (!contactData.source || !validSources.includes(contactData.source)) {
    errors.push('Valid source is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeContact = (contact) => {
  if (!contact) return null;

  // Convert ObjectId to string
  if (contact._id && contact._id instanceof ObjectId) {
    contact._id = contact._id.toString();
  }

  return contact;
};

export const sanitizeServiceConsumption = (consumption) => {
  if (!consumption) return null;

  // Convert ObjectId to string
  if (consumption._id && consumption._id instanceof ObjectId) {
    consumption._id = consumption._id.toString();
  }

  return consumption;
};
