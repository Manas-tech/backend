# idea2mvp Backend API Documentation

Complete REST API documentation for the MongoDB-powered backend.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📊 Health Check

### GET /health
Check server status

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-10T12:00:00.000Z",
  "environment": "development"
}
```

---

## 🔐 Authentication

### POST /api/auth/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user123",
      "email": "user@example.com",
      "displayName": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /api/auth/login
Login user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

---

## 👥 Users

### GET /api/users
Get all users (Admin only)

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or email
- `role` (string): Filter by role (user/admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### GET /api/users/:id
Get user by ID

### PUT /api/users/:id
Update user

### DELETE /api/users/:id
Delete user (soft delete)

### GET /api/users/stats
Get user statistics

---

## 📝 Blogs

### GET /api/blogs
Get all blogs

**Query Parameters:**
- `page`, `limit`, `category`, `published`, `featured`

### GET /api/blogs/:id
Get blog by ID

### GET /api/blogs/slug/:slug
Get blog by slug

### POST /api/blogs
Create new blog (Admin only)

**Request Body:**
```json
{
  "title": "Blog Title",
  "excerpt": "Short description",
  "content": "Full blog content in markdown",
  "author": "Author Name",
  "category": "Web App",
  "slug": "blog-title",
  "image": "https://example.com/image.jpg",
  "featured": false,
  "published": true
}
```

### PUT /api/blogs/:id
Update blog

### DELETE /api/blogs/:id
Delete blog

---

## 🎨 Portfolio

### GET /api/portfolio
Get all portfolio items

**Query Parameters:**
- `page`, `limit`, `category`, `published`, `featured`

### GET /api/portfolio/:id
Get portfolio item by ID

### GET /api/portfolio/slug/:slug
Get portfolio item by slug

### POST /api/portfolio
Create portfolio item (Admin only)

**Request Body:**
```json
{
  "title": "Project Name",
  "category": "Web App",
  "description": "Project description",
  "image": "https://example.com/image.jpg",
  "client": "Client Name",
  "timeline": "3 months",
  "teamSize": "5 developers",
  "technologies": ["React", "Node.js", "MongoDB"],
  "metrics": {
    "userGrowth": "10,000+ users",
    "funding": "$1M raised"
  },
  "testimonial": {
    "quote": "Amazing work!",
    "author": "John Doe",
    "position": "CEO",
    "company": "ABC Corp",
    "avatar": "https://example.com/avatar.jpg"
  },
  "process": [
    {
      "phase": "Discovery",
      "description": "Requirements gathering",
      "duration": "2 weeks"
    }
  ],
  "mockups": [
    {
      "device": "laptop",
      "image": "https://example.com/mockup.jpg",
      "alt": "Laptop mockup"
    }
  ],
  "results": ["Increased user engagement by 50%"],
  "featured": false,
  "published": true,
  "slug": "project-name"
}
```

### PUT /api/portfolio/:id
Update portfolio item

### DELETE /api/portfolio/:id
Delete portfolio item

---

## 🛠️ Services

### GET /api/services
Get all services

**Query Parameters:**
- `page`, `limit`, `category`

### GET /api/services/:id
Get service by ID

### POST /api/services
Create service (Admin only)

**Request Body:**
```json
{
  "title": "Web Development",
  "description": "Build modern web applications",
  "icon": "code",
  "category": "development",
  "order": 1,
  "serviceDetails": {
    "title": "Web Development Services",
    "leftSection": {
      "title": "Frontend Development",
      "services": [
        {
          "icon": "react",
          "title": "React Development",
          "description": "Build scalable React apps",
          "price": "price_123",
          "amount": "$2,999",
          "paymentLink": "https://stripe.com/..."
        }
      ]
    },
    "rightSection": {
      "services": [...]
    }
  }
}
```

### PUT /api/services/:id
Update service

### DELETE /api/services/:id
Delete service

---

## 💳 Purchases

### GET /api/purchases
Get all purchases (Admin only)

**Query Parameters:**
- `page`, `limit`, `userId`, `paymentStatus`, `category`

### GET /api/purchases/user/:userId
Get purchases by user ID

### GET /api/purchases/:id
Get purchase by ID

### POST /api/purchases
Create purchase record

**Request Body:**
```json
{
  "userId": "user123",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "stripeSessionId": "cs_test_123",
  "stripeCustomerId": "cus_123",
  "stripeProductId": "prod_123",
  "stripePriceId": "price_123",
  "stripePaymentIntentId": "pi_123",
  "productName": "MVP Development Package",
  "productDescription": "Complete MVP development",
  "category": "development",
  "serviceType": "one-time",
  "serviceId": "service123",
  "quantity": 1,
  "unitPrice": 299900,
  "totalAmount": 299900,
  "currency": "usd",
  "status": "completed",
  "paymentStatus": "paid",
  "purchasedAt": "2025-01-10T12:00:00.000Z",
  "metadata": {}
}
```

### PUT /api/purchases/:id
Update purchase

### GET /api/purchases/stats
Get purchase statistics

---

## 📋 Onboarding

### GET /api/onboarding/:userId
Get user onboarding data

### POST /api/onboarding/:userId
Create onboarding data

**Request Body:**
```json
{
  "userType": "startup",
  "projectName": "My Startup",
  "projectDescription": "Building a SaaS platform",
  "industry": "Technology",
  "timeline": "3-6 months",
  "budget": 50000,
  "services": ["Web Development", "Mobile App"],
  "primaryGoal": "Launch MVP",
  "contactPreference": "email",
  "isComplete": false
}
```

### PUT /api/onboarding/:userId
Update onboarding data

### POST /api/onboarding/:userId/complete
Mark onboarding as complete

### DELETE /api/onboarding/:userId
Delete onboarding data

---

## 📈 Progress

### GET /api/progress/:userId
Get user progress

### POST /api/progress/:userId
Create progress data

**Request Body:**
```json
{
  "userId": "user123",
  "overall": 25,
  "phases": {
    "discovery": 100,
    "design": 50,
    "development": 0,
    "testing": 0,
    "launch": 0,
    "support": 0
  },
  "milestonesCompleted": 3,
  "totalMilestones": 12,
  "currentStatus": {
    "currentPhase": "design",
    "currentSubstep": "UI/UX Design",
    "phaseProgress": 50,
    "substepProgress": 75,
    "updatedAt": "2025-01-10T12:00:00.000Z",
    "updatedBy": "admin123",
    "notes": "Making good progress"
  }
}
```

### PUT /api/progress/:userId
Update progress data

### PUT /api/progress/:userId/status
Update current status only

### GET /api/progress/:userId/projects
Get project tracking for user

### POST /api/progress/projects
Create/update project tracking

**Request Body:**
```json
{
  "projectId": "project123",
  "userId": "user123",
  "projectName": "My Startup MVP",
  "status": "active",
  "progress": 45,
  "milestones": [
    {
      "id": "milestone1",
      "title": "Requirements Complete",
      "description": "All requirements gathered",
      "phase": "discovery",
      "status": "completed",
      "assignedTo": "team@example.com",
      "dueDate": "2025-01-15T00:00:00.000Z",
      "completedDate": "2025-01-10T00:00:00.000Z"
    }
  ],
  "adminNotes": "Project progressing well"
}
```

---

## 📧 Contact & Service Consumption

### Contact Submissions

#### GET /api/contact/submissions
Get all contact submissions (Admin only)

**Query Parameters:**
- `page`, `limit`, `status`, `type`, `priority`

#### GET /api/contact/submissions/:id
Get contact submission by ID

#### POST /api/contact/submissions
Create contact submission

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "ABC Corp",
  "phone": "+1234567890",
  "subject": "Project Inquiry",
  "message": "I'm interested in building an MVP",
  "type": "consultation",
  "priority": "high",
  "source": "contact-form",
  "userId": "user123"
}
```

#### PUT /api/contact/submissions/:id
Update contact submission

#### DELETE /api/contact/submissions/:id
Delete contact submission

### Service Consumption

#### GET /api/contact/consumption
Get all service consumption records

**Query Parameters:**
- `page`, `limit`, `userId`, `status`

#### GET /api/contact/consumption/user/:userId
Get service consumption by user ID

#### POST /api/contact/consumption
Create service consumption record

**Request Body:**
```json
{
  "userId": "user123",
  "userEmail": "user@example.com",
  "userName": "John Doe",
  "serviceId": "service123",
  "serviceName": "MVP Development",
  "serviceCategory": "development",
  "serviceType": "one-time",
  "purchaseId": "purchase123",
  "stripeProductId": "prod_123",
  "totalAmount": 299900,
  "currency": "usd",
  "status": "active",
  "startDate": "2025-01-10T00:00:00.000Z",
  "purchasedAt": "2025-01-10T00:00:00.000Z",
  "notes": "Project kickoff scheduled"
}
```

#### PUT /api/contact/consumption/:id
Update service consumption

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Data Validation

All POST and PUT requests are validated against MongoDB schemas. Required fields must be provided, and data types must match the schema definitions.

### Common Validations
- Email must be valid format
- Dates must be ISO 8601 format
- Enums must match allowed values
- Numbers must be within specified ranges
- Arrays must contain valid items

---

## Rate Limiting

API is rate limited to **100 requests per 15 minutes** per IP address.

When rate limit is exceeded:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

---

## Pagination

All list endpoints support pagination with the following query parameters:
- `page` (default: 1)
- `limit` (default: 10-50 depending on endpoint)

Pagination info is returned in the response:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

## Testing

### Using cURL

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","displayName":"Test User"}'

# Get all services
curl http://localhost:5000/api/services
```

### Using Postman

Import the API endpoints and create collections for each resource. Set the base URL as an environment variable.

---

## Notes

1. All timestamps are in UTC ISO 8601 format
2. Currency amounts are in cents (e.g., $29.99 = 2999)
3. Authentication token expires after 7 days
4. Soft deletes are used for users (sets `isActive: false`)
5. All collections support full CRUD operations
6. MongoDB ObjectIds are automatically converted to strings in responses

---

For support or questions, please contact the development team.
