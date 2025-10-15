import { getDatabase } from '../config/database.js';

export const getAllPurchases = async (req, res) => {
  try {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = '',
      paymentStatus = '',
      userId = '',
      sortBy = 'purchasedAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    if (userId) {
      query.userId = userId;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const purchases = await db.collection('purchases')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('purchases').countDocuments(query);

    res.json({
      success: true,
      data: {
        purchases,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchases',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const purchase = await db.collection('purchases').findOne({ _id: id });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      data: { purchase }
    });

  } catch (error) {
    console.error('Get purchase by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get purchase',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getUserPurchases = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();
    
    const purchases = await db.collection('purchases')
      .find({ userId })
      .sort({ purchasedAt: -1 })
      .toArray();

    res.json({
      success: true,
      data: { purchases }
    });

  } catch (error) {
    console.error('Get user purchases error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user purchases',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      stripeSessionId,
      stripeCustomerId,
      stripeProductId,
      stripePriceId,
      stripePaymentIntentId,
      productName,
      productDescription,
      category,
      serviceType,
      serviceId,
      quantity,
      unitPrice,
      totalAmount,
      currency,
      status,
      paymentStatus,
      metadata
    } = req.body;
    
    const db = getDatabase();

    const purchaseData = {
      userId,
      userEmail,
      userName,
      stripeSessionId,
      stripeCustomerId,
      stripeProductId,
      stripePriceId,
      stripePaymentIntentId,
      productName,
      productDescription,
      category,
      serviceType,
      serviceId,
      quantity: quantity || 1,
      unitPrice,
      totalAmount,
      currency: currency || 'USD',
      status: status || 'pending',
      paymentStatus: paymentStatus || 'pending',
      purchasedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: metadata || {}
    };

    const result = await db.collection('purchases').insertOne(purchaseData);
    const purchase = await db.collection('purchases').findOne({ _id: result.insertedId });

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: { purchase }
    });

  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create purchase',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getDatabase();

    // Check if purchase exists
    const existingPurchase = await db.collection('purchases').findOne({ _id: id });
    if (!existingPurchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // If payment status is being updated to 'paid', set paidAt
    if (updates.paymentStatus === 'paid' && existingPurchase.paymentStatus !== 'paid') {
      updateData.paidAt = new Date();
    }

    await db.collection('purchases').updateOne(
      { _id: id },
      { $set: updateData }
    );

    const updatedPurchase = await db.collection('purchases').findOne({ _id: id });

    res.json({
      success: true,
      message: 'Purchase updated successfully',
      data: { purchase: updatedPurchase }
    });

  } catch (error) {
    console.error('Update purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update purchase',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if purchase exists
    const purchase = await db.collection('purchases').findOne({ _id: id });
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    await db.collection('purchases').deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Purchase deleted successfully'
    });

  } catch (error) {
    console.error('Delete purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete purchase',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};