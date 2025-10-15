import { ObjectId } from 'mongodb';

// Blog Model Schema
export const blogSchema = {
  $jsonSchema: {
    bsonType: "object",
    required: ["title", "excerpt", "content", "author", "category", "slug", "image", "featured", "published", "createdAt", "updatedAt"],
    properties: {
      title: { bsonType: "string" },
      excerpt: { bsonType: "string" },
      content: { bsonType: "string" },
      author: { bsonType: "string" },
      category: { enum: ["All", "Web App", "Mobile App", "SaaS Platform"] },
      slug: { bsonType: "string" },
      image: { bsonType: "string" },
      featured: { bsonType: "bool" },
      published: { bsonType: "bool" },
      createdAt: { bsonType: "date" },
      updatedAt: { bsonType: "date" }
    }
  }
};

// Blog indexes
export const blogIndexes = [
  { key: { slug: 1 }, unique: true },
  { key: { published: 1, createdAt: -1 } },
  { key: { category: 1 } },
  { key: { featured: 1 } },
  { key: { author: 1 } }
];

// Blog validation
export const validateBlog = (blogData) => {
  const errors = [];

  if (!blogData.title || blogData.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!blogData.excerpt || blogData.excerpt.trim().length === 0) {
    errors.push('Excerpt is required');
  }

  if (!blogData.content || blogData.content.trim().length === 0) {
    errors.push('Content is required');
  }

  if (!blogData.slug || blogData.slug.trim().length === 0) {
    errors.push('Slug is required');
  }

  const validCategories = ["All", "Web App", "Mobile App", "SaaS Platform"];
  if (!blogData.category || !validCategories.includes(blogData.category)) {
    errors.push('Valid category is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const sanitizeBlog = (blog) => {
  if (!blog) return null;

  // Convert ObjectId to string
  if (blog._id && blog._id instanceof ObjectId) {
    blog._id = blog._id.toString();
  }

  return blog;
};
