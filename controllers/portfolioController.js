import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';

export const getAllPortfolio = async (req, res) => {
  try {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      published = '', 
      featured = '',
      category = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } },
        { technologies: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (published !== '') {
      query.published = published === 'true';
    } else {
      // Default: only show published items
      query.published = true;
    }
    if (featured !== '') {
      query.featured = featured === 'true';
    }
    if (category) {
      query.category = category;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const portfolio = await db.collection('portfolio')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('portfolio').countDocuments(query);

    res.json({
      success: true,
      data: {
        portfolios: portfolio,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getPortfolioById = async (req, res) => {
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
        message: 'Invalid portfolio ID format'
      });
    }
    
    const portfolio = await db.collection('portfolio').findOne({ _id: objectId });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    res.json({
      success: true,
      data: { portfolio }
    });

  } catch (error) {
    console.error('Get portfolio by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getPortfolioBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const db = getDatabase();
    
    const portfolio = await db.collection('portfolio').findOne({ slug });

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    res.json({
      success: true,
      data: { portfolio }
    });

  } catch (error) {
    console.error('Get portfolio by slug error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createPortfolio = async (req, res) => {
  try {
    const { title, category, description, image, client, timeline, teamSize, technologies, metrics, testimonial, process, mockups, results, featured, published } = req.body;
    const db = getDatabase();

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const portfolioData = {
      title,
      category,
      description,
      image,
      client,
      timeline,
      teamSize,
      technologies: technologies || [],
      metrics: metrics || {},
      testimonial: testimonial || {},
      process: process || [],
      mockups: mockups || [],
      results: results || [],
      featured: featured || false,
      published: published || false,
      slug,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('portfolio').insertOne(portfolioData);
    const portfolio = await db.collection('portfolio').findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'Portfolio item created successfully',
      data: { portfolio }
    });

  } catch (error) {
    console.error('Create portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create portfolio item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updatePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getDatabase();

    console.log('Update portfolio request:', { id, idType: typeof id, idLength: id?.length });
    console.log('Updates:', updates);

    // Convert string ID to ObjectId or use as string
    let objectId;
    let queryId;
    
    try {
      // Try to create ObjectId first
      objectId = new ObjectId(id);
      queryId = objectId;
      console.log('ObjectId created successfully:', objectId);
    } catch (error) {
      console.log('ObjectId creation failed, using string ID:', id);
      // If ObjectId creation fails, use the string ID directly
      queryId = id;
    }

    // Check if portfolio exists
    const existingPortfolio = await db.collection('portfolio').findOne({ _id: queryId });
    if (!existingPortfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    // Update slug if title changed
    if (updates.title && updates.title !== existingPortfolio.title) {
      updates.slug = updates.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    await db.collection('portfolio').updateOne(
      { _id: queryId },
      { $set: updateData }
    );

    const updatedPortfolio = await db.collection('portfolio').findOne({ _id: queryId });

    res.json({
      success: true,
      message: 'Portfolio item updated successfully',
      data: { portfolio: updatedPortfolio }
    });

  } catch (error) {
    console.error('Update portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deletePortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Convert string ID to ObjectId or use as string
    let objectId;
    let queryId;
    
    try {
      // Try to create ObjectId first
      objectId = new ObjectId(id);
      queryId = objectId;
    } catch (error) {
      // If ObjectId creation fails, use the string ID directly
      queryId = id;
    }

    // Check if portfolio exists
    const portfolio = await db.collection('portfolio').findOne({ _id: queryId });
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio item not found'
      });
    }

    await db.collection('portfolio').deleteOne({ _id: queryId });

    res.json({
      success: true,
      message: 'Portfolio item deleted successfully'
    });

  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio item',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};