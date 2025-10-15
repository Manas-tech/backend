import { getDatabase } from '../config/database.js';
import { ObjectId } from 'mongodb';

export const getAllServiceConsumption = async (req, res) => {
  try {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      userId = '',
      serviceId = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { serviceName: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } }
      ];
    }
    if (userId) {
      query.userId = userId;
    }
    if (serviceId) {
      query.serviceId = serviceId;
    }
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const consumptions = await db.collection('serviceConsumption')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('serviceConsumption').countDocuments(query);

    res.json({
      success: true,
      data: {
        consumptions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all service consumption error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service consumption data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getServiceConsumptionById = async (req, res) => {
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
    
    const consumption = await db.collection('serviceConsumption').findOne({ _id: queryId });

    if (!consumption) {
      return res.status(404).json({
        success: false,
        message: 'Service consumption record not found'
      });
    }

    res.json({
      success: true,
      data: { consumption }
    });

  } catch (error) {
    console.error('Get service consumption by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service consumption',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getUserServiceConsumption = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    const consumptions = await db.collection('serviceConsumption')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: { consumptions }
    });

  } catch (error) {
    console.error('Get user service consumption error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user service consumption',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createServiceConsumption = async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      serviceId,
      serviceName,
      serviceCategory,
      consumptionType,
      quantity,
      duration,
      status,
      startDate,
      endDate,
      notes,
      metadata
    } = req.body;
    
    const db = getDatabase();

    const consumptionData = {
      userId,
      userEmail,
      userName,
      serviceId,
      serviceName,
      serviceCategory,
      consumptionType: consumptionType || 'usage',
      quantity: quantity || 1,
      duration: duration || 0,
      status: status || 'active',
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      notes: notes || '',
      metadata: metadata || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('serviceConsumption').insertOne(consumptionData);
    const consumption = await db.collection('serviceConsumption').findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'Service consumption record created successfully',
      data: { consumption }
    });

  } catch (error) {
    console.error('Create service consumption error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service consumption record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateServiceConsumption = async (req, res) => {
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

    // Check if consumption exists
    const existingConsumption = await db.collection('serviceConsumption').findOne({ _id: queryId });
    if (!existingConsumption) {
      return res.status(404).json({
        success: false,
        message: 'Service consumption record not found'
      });
    }

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // Convert date strings to Date objects if present
    if (updates.startDate) {
      updateData.startDate = new Date(updates.startDate);
    }
    if (updates.endDate) {
      updateData.endDate = new Date(updates.endDate);
    }

    await db.collection('serviceConsumption').updateOne(
      { _id: queryId },
      { $set: updateData }
    );

    const updatedConsumption = await db.collection('serviceConsumption').findOne({ _id: queryId });

    res.json({
      success: true,
      message: 'Service consumption record updated successfully',
      data: { consumption: updatedConsumption }
    });

  } catch (error) {
    console.error('Update service consumption error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service consumption record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deleteServiceConsumption = async (req, res) => {
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

    // Check if consumption exists
    const consumption = await db.collection('serviceConsumption').findOne({ _id: queryId });
    if (!consumption) {
      return res.status(404).json({
        success: false,
        message: 'Service consumption record not found'
      });
    }

    await db.collection('serviceConsumption').deleteOne({ _id: queryId });

    res.json({
      success: true,
      message: 'Service consumption record deleted successfully'
    });

  } catch (error) {
    console.error('Delete service consumption error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service consumption record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getServiceConsumptionStats = async (req, res) => {
  try {
    const db = getDatabase();

    // Get total consumption records
    const totalConsumptions = await db.collection('serviceConsumption').countDocuments();

    // Get active consumptions
    const activeConsumptions = await db.collection('serviceConsumption').countDocuments({ status: 'active' });

    // Get completed consumptions
    const completedConsumptions = await db.collection('serviceConsumption').countDocuments({ status: 'completed' });

    // Get paused consumptions
    const pausedConsumptions = await db.collection('serviceConsumption').countDocuments({ status: 'paused' });

    // Get consumption by service category
    const consumptionByCategory = await db.collection('serviceConsumption').aggregate([
      {
        $group: {
          _id: '$serviceCategory',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    // Get recent consumptions
    const recentConsumptions = await db.collection('serviceConsumption')
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    res.json({
      success: true,
      data: {
        totalConsumptions,
        activeConsumptions,
        completedConsumptions,
        pausedConsumptions,
        consumptionByCategory,
        recentConsumptions
      }
    });

  } catch (error) {
    console.error('Get service consumption stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service consumption statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
