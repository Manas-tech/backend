import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';

export const getAllTestimonials = async (req, res) => {
  try {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = '',
      featured = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { quote: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }
    if (featured !== '') {
      query.featured = featured === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const testimonials = await db.collection('testimonials')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('testimonials').countDocuments(query);

    res.json({
      success: true,
      data: {
        testimonials,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get testimonials',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    // Try ObjectId first, then string
    let queryId;
    try {
      queryId = new ObjectId(id);
    } catch (error) {
      queryId = id;
    }
    
    const testimonial = await db.collection('testimonials').findOne({ _id: queryId });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      data: { testimonial }
    });

  } catch (error) {
    console.error('Get testimonial by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get testimonial',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getFeaturedTestimonials = async (req, res) => {
  try {
    const db = getDatabase();
    const { limit = 10 } = req.query;
    
    const testimonials = await db.collection('testimonials')
      .find({ 
        status: 'published',
        featured: true 
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json({
      success: true,
      data: { testimonials }
    });

  } catch (error) {
    console.error('Get featured testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured testimonials',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const {
      name,
      designation,
      company,
      quote,
      avatar,
      rating,
      projectType,
      status,
      featured,
      metadata
    } = req.body;
    
    const db = getDatabase();

    const testimonialData = {
      name,
      designation: designation || '',
      company: company || '',
      quote,
      avatar: avatar || '',
      rating: rating || 5,
      projectType: projectType || 'General',
      status: status || 'draft',
      featured: featured || false,
      metadata: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('testimonials').insertOne(testimonialData);
    const testimonial = await db.collection('testimonials').findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: { testimonial }
    });

  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create testimonial',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getDatabase();

    // Try ObjectId first, then string
    let queryId;
    try {
      queryId = new ObjectId(id);
    } catch (error) {
      queryId = id;
    }

    // Check if testimonial exists
    const existingTestimonial = await db.collection('testimonials').findOne({ _id: queryId });
    if (!existingTestimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    await db.collection('testimonials').updateOne(
      { _id: queryId },
      { $set: updateData }
    );

    const updatedTestimonial = await db.collection('testimonials').findOne({ _id: queryId });

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: { testimonial: updatedTestimonial }
    });

  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Try ObjectId first, then string
    let queryId;
    try {
      queryId = new ObjectId(id);
    } catch (error) {
      queryId = id;
    }

    // Check if testimonial exists
    const testimonial = await db.collection('testimonials').findOne({ _id: queryId });
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    await db.collection('testimonials').deleteOne({ _id: queryId });

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });

  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getTestimonialStats = async (req, res) => {
  try {
    const db = getDatabase();

    // Get total testimonials
    const totalTestimonials = await db.collection('testimonials').countDocuments();

    // Get published testimonials
    const publishedTestimonials = await db.collection('testimonials').countDocuments({ status: 'published' });

    // Get draft testimonials
    const draftTestimonials = await db.collection('testimonials').countDocuments({ status: 'draft' });

    // Get featured testimonials
    const featuredTestimonials = await db.collection('testimonials').countDocuments({ featured: true });

    // Get testimonials by project type
    const testimonialsByProjectType = await db.collection('testimonials').aggregate([
      {
        $group: {
          _id: '$projectType',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    // Get recent testimonials
    const recentTestimonials = await db.collection('testimonials')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    res.json({
      success: true,
      data: {
        totalTestimonials,
        publishedTestimonials,
        draftTestimonials,
        featuredTestimonials,
        testimonialsByProjectType,
        recentTestimonials
      }
    });

  } catch (error) {
    console.error('Get testimonial stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get testimonial statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
