import Joi from 'joi';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Common validation schemas
export const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),

  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(50).required(),
    displayName: Joi.string().min(2).max(50),
    role: Joi.string().valid('user', 'admin')
  }),

  userUpdate: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    displayName: Joi.string().min(2).max(100),
    bio: Joi.string().max(500),
    photoURL: Joi.string().uri().allow(''),
    linkedin: Joi.string().allow(''),
    website: Joi.string().allow(''),
    emailNotifications: Joi.boolean(),
    marketingEmails: Joi.boolean(),
    projectUpdates: Joi.boolean(),
    securityAlerts: Joi.boolean(),
    darkMode: Joi.boolean(),
    role: Joi.string().valid('user', 'admin'),
    isActive: Joi.boolean()
  }),

  blog: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    content: Joi.string().min(100).required(),
    excerpt: Joi.string().max(500).allow(''),
    author: Joi.string().allow(''),
    category: Joi.string().valid('All', 'Web App', 'Mobile App', 'SaaS Platform').allow(''),
    slug: Joi.string().allow(''),
    image: Joi.string().allow(''),
    tags: Joi.array().items(Joi.string()),
    published: Joi.boolean(),
    featured: Joi.boolean()
  }),

  portfolio: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(50).required(),
    imageUrl: Joi.string().uri(),
    projectUrl: Joi.string().uri(),
    technologies: Joi.array().items(Joi.string()),
    published: Joi.boolean(),
    featured: Joi.boolean()
  }),

  service: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(50).required(),
    price: Joi.number().min(0).required(),
    duration: Joi.string().required(),
    features: Joi.array().items(Joi.string()),
    isActive: Joi.boolean()
  }),

  contact: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    subject: Joi.string().min(5).max(200).optional().allow(''),
    message: Joi.string().min(20).required(),
    type: Joi.string().valid('general', 'support', 'sales', 'partnership').optional(),
    selectedService: Joi.string().optional().allow(''),
    services: Joi.array().optional().allow(null),
    source: Joi.string().optional()
  }),

  portfolio: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    category: Joi.string().valid('Web App', 'Mobile App', 'SaaS Platform').required(),
    description: Joi.string().min(50).required(),
    image: Joi.string().uri().allow(''),
    client: Joi.string().min(2).max(100).allow(''),
    timeline: Joi.string().max(50).allow(''),
    teamSize: Joi.string().max(50).allow(''),
    technologies: Joi.array().items(Joi.string()),
    published: Joi.boolean(),
    featured: Joi.boolean()
  }),

  service: Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(50).required(),
    icon: Joi.string().required(),
    category: Joi.string().min(2).max(50).required(),
    order: Joi.number().integer().min(0),
    isActive: Joi.boolean(),
    serviceDetails: Joi.object({
      title: Joi.string(),
      leftSection: Joi.object({
        title: Joi.string(),
        services: Joi.array().items(Joi.object({
          icon: Joi.string(),
          title: Joi.string(),
          description: Joi.string(),
          price: Joi.string().allow(''),
          amount: Joi.string().allow(''),
          paymentLink: Joi.string().allow('')
        }))
      }),
      rightSection: Joi.object({
        services: Joi.array().items(Joi.object({
          icon: Joi.string(),
          title: Joi.string(),
          description: Joi.string(),
          price: Joi.string().allow(''),
          amount: Joi.string().allow(''),
          paymentLink: Joi.string().allow('')
        }))
      }),
      features: Joi.array().items(Joi.string()),
      pricing: Joi.string().allow(''),
      duration: Joi.string().allow(''),
      deliverables: Joi.array().items(Joi.string()),
      technologies: Joi.array().items(Joi.string())
    }).optional()
  }),

  serviceUpdate: Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string().min(50),
    icon: Joi.string(),
    category: Joi.string().min(2).max(50),
    order: Joi.number().integer().min(0),
    isActive: Joi.boolean(),
    serviceDetails: Joi.object({
      title: Joi.string(),
      leftSection: Joi.object({
        title: Joi.string(),
        services: Joi.array().items(Joi.object({
          icon: Joi.string(),
          title: Joi.string(),
          description: Joi.string(),
          price: Joi.string().allow(''),
          amount: Joi.string().allow(''),
          paymentLink: Joi.string().allow('')
        }))
      }),
      rightSection: Joi.object({
        services: Joi.array().items(Joi.object({
          icon: Joi.string(),
          title: Joi.string(),
          description: Joi.string(),
          price: Joi.string().allow(''),
          amount: Joi.string().allow(''),
          paymentLink: Joi.string().allow('')
        }))
      }),
      features: Joi.array().items(Joi.string()),
      pricing: Joi.string().allow(''),
      duration: Joi.string().allow(''),
      deliverables: Joi.array().items(Joi.string()),
      technologies: Joi.array().items(Joi.string())
    }).optional()
  }),

  project: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().min(10).max(2000).required(),
    type: Joi.string().min(2).max(100).required(),
    category: Joi.string().min(2).max(100),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    startDate: Joi.date(),
    targetDate: Joi.date(),
    budget: Joi.number().min(0),
    currency: Joi.string().length(3),
    tags: Joi.array().items(Joi.string()),
    technologies: Joi.array().items(Joi.string()),
    services: Joi.array().items(Joi.string()),
    settings: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean(),
        push: Joi.boolean(),
        milestoneUpdates: Joi.boolean(),
        teamUpdates: Joi.boolean()
      }),
      visibility: Joi.string().valid('private', 'team', 'public'),
      allowTeamInvites: Joi.boolean(),
      autoArchive: Joi.boolean()
    })
  }),

  milestone: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().min(5).max(1000).required(),
    dueDate: Joi.date(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent'),
    assignedTo: Joi.string(),
    tags: Joi.array().items(Joi.string())
  })
};

