import { ObjectId } from 'mongodb';

// Portfolio Model Schema
export const portfolioSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["title", "category", "description", "image", "client", "timeline", "teamSize", "technologies", "featured", "published", "slug", "createdAt", "updatedAt"],
    properties: {
      title: { bsonType: "string" },
      category: { enum: ["Web App", "Mobile App", "SaaS Platform"] },
      description: { bsonType: "string" },
      image: { bsonType: "string" },
      client: { bsonType: "string" },
      timeline: { bsonType: "string" },
      teamSize: { bsonType: "string" },
      technologies: { bsonType: "array" },
      metrics: { bsonType: "object" },
      testimonial: { bsonType: "object" },
      process: { bsonType: "array" },
      mockups: { bsonType: "array" },
      results: { bsonType: "array" },
      featured: { bsonType: "bool" },
      published: { bsonType: "bool" },
      slug: { bsonType: "string" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" }
    }
  }
};

// Portfolio indexes
export const portfolioIndexes = [
  { key: { slug: 1 }, unique: true },
  { key: { published: 1, featured: 1 } },
  { key: { category: 1 } },
  { key: { createdAt: -1 } }
];

// Portfolio validation
export const validatePortfolio = (portfolioData) => {
  const errors = [];

  if (!portfolioData.title || portfolioData.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!portfolioData.description || portfolioData.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!portfolioData.slug || portfolioData.slug.trim().length === 0) {
    errors.push('Slug is required');
  }

  const validCategories = ["Web App", "Mobile App", "SaaS Platform"];
  if (!portfolioData.category || !validCategories.includes(portfolioData.category)) {
    errors.push('Valid category is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizePortfolio = (portfolio) => {
  if (!portfolio) return null;

  // Convert ObjectId to string
  if (portfolio._id && portfolio._id instanceof ObjectId) {
    portfolio._id = portfolio._id.toString();
  }

  return portfolio;
};
