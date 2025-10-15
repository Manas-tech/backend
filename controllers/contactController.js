import { getDatabase } from '../config/database.js';
import { sendContactEmail, sendAutoReplyEmail } from '../services/emailService.js';

export const getAllContactSubmissions = async (req, res) => {
  try {
    const db = getDatabase();
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      type = '',
      status = '',
      priority = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }
    if (type) {
      query.type = type;
    }
    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const submissions = await db.collection('contactSubmissions')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('contactSubmissions').countDocuments(query);

    res.json({
      success: true,
      data: {
        submissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get all contact submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact submissions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getContactSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    const submission = await db.collection('contactSubmissions').findOne({ _id: id });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      data: { submission }
    });

  } catch (error) {
    console.error('Get contact submission by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const createContactSubmission = async (req, res) => {
  try {
    const {
      name,
      email,
      company,
      phone,
      subject,
      message,
      type,
      priority,
      status,
      userId,
      source,
      selectedService,
      services
    } = req.body;
    
    const db = getDatabase();

    const submissionData = {
      name,
      email,
      company,
      phone,
      subject,
      message,
      type: type || 'general',
      priority: priority || 'medium',
      status: status || 'new',
      userId,
      source: source || 'contact-form',
      selectedService,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('contactSubmissions').insertOne(submissionData);
    const submission = await db.collection('contactSubmissions').findOne({ _id: result.insertedId });

    // Send email notification to admin
    const emailData = {
      name,
      email,
      message,
      selectedService,
      services
    };
    
    const emailResult = await sendContactEmail(emailData);
    
    // Send auto-reply to user
    const autoReplyResult = await sendAutoReplyEmail(email, name);

    res.status(201).json({
      success: true,
      message: 'Contact submission created successfully',
      data: { 
        submission,
        emailSent: emailResult.success,
        autoReplySent: autoReplyResult.success
      }
    });

  } catch (error) {
    console.error('Create contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create contact submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateContactSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const db = getDatabase();

    // Check if submission exists
    const existingSubmission = await db.collection('contactSubmissions').findOne({ _id: id });
    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    // If status is being updated to 'resolved', set respondedAt
    if (updates.status === 'resolved' && existingSubmission.status !== 'resolved') {
      updateData.respondedAt = new Date();
    }

    await db.collection('contactSubmissions').updateOne(
      { _id: id },
      { $set: updateData }
    );

    const updatedSubmission = await db.collection('contactSubmissions').findOne({ _id: id });

    res.json({
      success: true,
      message: 'Contact submission updated successfully',
      data: { submission: updatedSubmission }
    });

  } catch (error) {
    console.error('Update contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const deleteContactSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if submission exists
    const submission = await db.collection('contactSubmissions').findOne({ _id: id });
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    await db.collection('contactSubmissions').deleteOne({ _id: id });

    res.json({
      success: true,
      message: 'Contact submission deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact submission',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getContactStats = async (req, res) => {
  try {
    const db = getDatabase();

    const [
      totalSubmissions,
      newSubmissions,
      inProgressSubmissions,
      resolvedSubmissions,
      highPrioritySubmissions
    ] = await Promise.all([
      db.collection('contactSubmissions').countDocuments(),
      db.collection('contactSubmissions').countDocuments({ status: 'new' }),
      db.collection('contactSubmissions').countDocuments({ status: 'in-progress' }),
      db.collection('contactSubmissions').countDocuments({ status: 'resolved' }),
      db.collection('contactSubmissions').countDocuments({ priority: 'high' })
    ]);

    res.json({
      success: true,
      data: {
        totalSubmissions,
        newSubmissions,
        inProgressSubmissions,
        resolvedSubmissions,
        highPrioritySubmissions
      }
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get contact stats',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Service consumption endpoints
export const getUserServiceConsumption = async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDatabase();

    // For now, return empty array since we don't have service consumption data
    // This would typically query a serviceConsumption collection
    const consumptions = [];

    res.json({
      success: true,
      data: { consumptions }
    });

  } catch (error) {
    console.error('Get user service consumption error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service consumption',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const getServicesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const db = getDatabase();

    // For now, return empty array since we don't have service consumption data
    // This would typically query services by category
    const services = [];

    res.json({
      success: true,
      data: { services }
    });

  } catch (error) {
    console.error('Get services by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services by category',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Contact Information Management
export const getContactInfo = async (req, res) => {
  try {
    console.log('🔄 Get contact info request received');
    const db = getDatabase();
    console.log('📊 Database connection status:', db ? 'Connected' : 'Not connected');
    
    // Get contact information from database
    let contactInfo = await db.collection('contactInfo').findOne({});
    console.log('📋 Contact info from database:', contactInfo);
    
    // If no contact info exists, return default values
    if (!contactInfo) {
      console.log('📝 No contact info found, using defaults');
      contactInfo = {
        address: {
          street: '983 Corporate Way',
          city: 'Fremont',
          state: 'CA',
          zipCode: '94555',
          country: 'USA',
          location: 'Silicon Valley, California'
        },
        email: {
          primary: 'contact@idea2mvp.com',
          support: 'support@idea2mvp.com',
          sales: 'sales@idea2mvp.com'
        },
        phone: {
          primary: '+1 (585) 755-3200',
          support: '+1 (585) 755-3201',
          sales: '+1 (585) 755-3202'
        },
        officeHours: {
          weekdays: {
            start: '9:00 AM',
            end: '6:00 PM',
            timezone: 'PST'
          },
          saturday: {
            start: '10:00 AM',
            end: '2:00 PM',
            timezone: 'PST'
          },
          sunday: {
            start: 'Closed',
            end: 'Closed',
            timezone: 'PST'
          }
        },
        companyInfo: {
          name: 'Idea2MVP',
          tagline: 'Turn Your Ideas Into Reality',
          description: 'We help entrepreneurs and businesses build their MVP and bring their ideas to market faster.'
        }
      };
    }

    res.json({
      success: true,
      data: contactInfo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact information',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const updateContactInfo = async (req, res) => {
  try {
    const db = getDatabase();
    const contactInfo = req.body;

    // Validate request body exists
    if (!contactInfo || typeof contactInfo !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body'
      });
    }

    // Validate required fields
    if (!contactInfo.address || !contactInfo.email || !contactInfo.phone || !contactInfo.officeHours || !contactInfo.companyInfo) {
      return res.status(400).json({
        success: false,
        message: 'Missing required contact information fields',
        availableFields: Object.keys(contactInfo)
      });
    }

    // Add timestamp and remove immutable fields to avoid conflicts
    const now = new Date();
    contactInfo.updatedAt = now;
    
    // Remove immutable fields from update to avoid MongoDB conflicts
    if (contactInfo._id) {
      delete contactInfo._id;
    }
    if (contactInfo.createdAt) {
      delete contactInfo.createdAt;
    }

    // Test database connection first
    try {
      await db.admin().ping();
    } catch (pingError) {
      throw new Error('Database connection failed');
    }

    // Upsert contact information (update if exists, insert if not)
    const result = await db.collection('contactInfo').updateOne(
      {}, // Empty filter to match any document
      { 
        $set: contactInfo,
        $setOnInsert: { createdAt: now }
      },
      { upsert: true }
    );


    res.json({
      success: true,
      message: 'Contact information updated successfully',
      data: contactInfo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update contact information',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};