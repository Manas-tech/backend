import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';

// Helper function to safely convert string to ObjectId
const toObjectId = (id) => {
  try {
    if (!id) {
      throw new Error('Service ID is required');
    }
    if (typeof id !== 'string') {
      throw new Error('Service ID must be a string');
    }
    
    // Try to convert to ObjectId first
    try {
      return new ObjectId(id);
    } catch (objectIdError) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', id);
      return id; // Return the string ID as-is for now
    }
  } catch (error) {
    console.error('ObjectId conversion error:', error.message, 'for ID:', id);
    throw new Error(`Invalid service ID format: ${error.message}`);
  }
};

export const getAllServices = async (req, res) => {
  try {
    const db = getDatabase();
    console.log('Database connection:', db ? 'Connected' : 'Not connected');
    
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      category = '',
      isActive = '',
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const services = await db.collection('services')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    console.log('Found services:', services.length);
    if (services.length > 0) {
      console.log('First service ID:', services[0]._id, 'Type:', typeof services[0]._id);
    }

    const total = await db.collection('services').countDocuments(query);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const service = await db.collection('services').findOne({ _id: toObjectId(id) });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.json({
      success: true,
      data: { service }
    });

  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createService = async (req, res) => {
  try {
    const { title, description, icon, category, order, serviceDetails, isActive } = req.body;
    console.log('Create service request:', { title, description, icon, category, order, serviceDetails, isActive });
    
    const db = getDatabase();
    console.log('Database instance for create:', db ? 'Available' : 'Not available');

    const serviceData = {
      title,
      description,
      icon,
      category,
      order: order || 0,
      serviceDetails: serviceDetails || {},
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Service data to insert:', serviceData);

    const result = await db.collection('services').insertOne(serviceData);
    console.log('Insert result:', result);

    const service = await db.collection('services').findOne({ _id: result.insertedId });
    console.log('Created service:', service);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });

  } catch (error) {
    console.error('Create service error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('Update service request:', { id, updates });
    console.log('ID type:', typeof id, 'ID length:', id?.length);
    
    const db = getDatabase();
    console.log('Database instance:', db ? 'Available' : 'Not available');

    // Check if service exists
    const existingService = await db.collection('services').findOne({ _id: toObjectId(id) });
    if (!existingService) {
      console.log('Service not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    console.log('Existing service found:', existingService._id);

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    console.log('Update data:', updateData);

    const updateResult = await db.collection('services').updateOne(
      { _id: toObjectId(id) },
      { $set: updateData }
    );

    console.log('Update result:', updateResult);

    const updatedService = await db.collection('services').findOne({ _id: toObjectId(id) });

    console.log('Updated service:', updatedService);

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service: updatedService }
    });

  } catch (error) {
    console.error('Update service error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if service exists
    const service = await db.collection('services').findOne({ _id: toObjectId(id) });
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await db.collection('services').deleteOne({ _id: toObjectId(id) });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};