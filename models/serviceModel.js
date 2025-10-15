import { ObjectId } from 'mongodb';

// Service Model Schema
export const serviceSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["title", "description", "icon", "category", "order", "createdAt", "updatedAt"],
    properties: {
      title: { bsonType: "string" },
      description: { bsonType: "string" },
      icon: { bsonType: "string" },
      category: { bsonType: "string" },
      order: { bsonType: "number" },
      serviceDetails: { bsonType: "object" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" }
    }
  }
};

// Service indexes
export const serviceIndexes = [
  { key: { order: 1 } },
  { key: { category: 1 } },
  { key: { createdAt: -1 } }
];

// Service validation
export const validateService = (serviceData) => {
  const errors = [];

  if (!serviceData.title || serviceData.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!serviceData.description || serviceData.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (serviceData.order === undefined || serviceData.order === null || isNaN(serviceData.order)) {
    errors.push('Valid order number is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeService = (service) => {
  if (!service) return null;

  // Convert ObjectId to string
  if (service._id && service._id instanceof ObjectId) {
    service._id = service._id.toString();
  }

  return service;
};
