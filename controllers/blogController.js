import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';

export const getAllBlogs = async (req, res) => {
  try {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      published = '', 
      featured = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    console.log("working")
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (published !== '') {
      query.published = published === 'true';
    }
    if (featured !== '') {
      query.featured = featured === 'true';
    }
    console.log("working2")

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const blogs = await db.collection('blogs')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    console.log("working3",blogs)
    const total = await db.collection('blogs').countDocuments(query);

    res.json({
      success: true,
      data: {
        blogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    
    console.error('Get all blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blogs',
      error
    });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }
    
    const blog = await db.collection('blogs').findOne({ _id: objectId });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      data: { blog }
    });

  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get blog',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, author, category, slug, image, tags, published, featured } = req.body;
    const db = getDatabase();

    const blogData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      author: author || req.user.name || 'Admin',
      category: category || 'All',
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      image: image || '',
      tags: tags || [],
      published: published || false,
      featured: featured || false,
      authorId: req.user.id,
      authorName: req.user.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: published ? new Date() : null,
      viewCount: 0
    };

    const result = await db.collection('blogs').insertOne(blogData);
    const blog = await db.collection('blogs').findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blog }
    });

  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, author, category, slug, image, tags, published, featured } = req.body;
    const db = getDatabase();

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }

    // Check if blog exists
    const existingBlog = await db.collection('blogs').findOne({ _id: objectId });
    if (!existingBlog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (author !== undefined) updateData.author = author;
    if (category !== undefined) updateData.category = category;
    if (slug !== undefined) updateData.slug = slug;
    if (image !== undefined) updateData.image = image;
    if (tags !== undefined) updateData.tags = tags;
    if (published !== undefined) {
      updateData.published = published;
      if (published && !existingBlog.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (featured !== undefined) updateData.featured = featured;

    await db.collection('blogs').updateOne(
      { _id: objectId },
      { $set: updateData }
    );

    const updatedBlog = await db.collection('blogs').findOne({ _id: objectId });

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: { blog: updatedBlog }
    });

  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }

    // Check if blog exists
    const blog = await db.collection('blogs').findOne({ _id: objectId });
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await db.collection('blogs').deleteOne({ _id: objectId });

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });

  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const incrementViewCount = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Convert string ID to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(id);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID format'
      });
    }

    await db.collection('blogs').updateOne(
      { _id: objectId },
      { $inc: { viewCount: 1 } }
    );

    res.json({
      success: true,
      message: 'View count updated'
    });

  } catch (error) {
    console.error('Increment view count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update view count',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

