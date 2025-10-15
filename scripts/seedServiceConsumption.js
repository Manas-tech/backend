import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

const sampleServiceConsumptions = [
  {
    userId: 'user1',
    userEmail: 'john.doe@example.com',
    userName: 'John Doe',
    serviceId: 'service1',
    serviceName: 'Web Development',
    serviceCategory: 'Development',
    consumptionType: 'usage',
    quantity: 1,
    duration: 120, // 2 hours
    status: 'active',
    startDate: new Date('2024-01-15'),
    endDate: null,
    notes: 'Initial consultation and project setup',
    metadata: {
      projectType: 'E-commerce',
      budget: 5000
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    userId: 'user2',
    userEmail: 'jane.smith@example.com',
    userName: 'Jane Smith',
    serviceId: 'service2',
    serviceName: 'Mobile App Development',
    serviceCategory: 'Development',
    consumptionType: 'subscription',
    quantity: 1,
    duration: 480, // 8 hours
    status: 'completed',
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-01-20'),
    notes: 'Complete mobile app development project',
    metadata: {
      platform: 'iOS',
      features: ['User Authentication', 'Payment Integration', 'Push Notifications']
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20')
  },
  {
    userId: 'user3',
    userEmail: 'bob.wilson@example.com',
    userName: 'Bob Wilson',
    serviceId: 'service3',
    serviceName: 'UI/UX Design',
    serviceCategory: 'Design',
    consumptionType: 'one-time',
    quantity: 1,
    duration: 180, // 3 hours
    status: 'active',
    startDate: new Date('2024-01-20'),
    endDate: null,
    notes: 'Website redesign consultation',
    metadata: {
      currentWebsite: 'legacy-site.com',
      targetAudience: 'B2B'
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    userId: 'user4',
    userEmail: 'alice.brown@example.com',
    userName: 'Alice Brown',
    serviceId: 'service4',
    serviceName: 'Digital Marketing',
    serviceCategory: 'Marketing',
    consumptionType: 'trial',
    quantity: 1,
    duration: 60, // 1 hour
    status: 'paused',
    startDate: new Date('2024-01-18'),
    endDate: null,
    notes: 'Trial consultation for marketing strategy',
    metadata: {
      industry: 'Healthcare',
      currentChannels: ['Google Ads', 'Social Media']
    },
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-22')
  },
  {
    userId: 'user5',
    userEmail: 'charlie.davis@example.com',
    userName: 'Charlie Davis',
    serviceId: 'service5',
    serviceName: 'Cloud Infrastructure',
    serviceCategory: 'Infrastructure',
    consumptionType: 'usage',
    quantity: 2,
    duration: 240, // 4 hours
    status: 'completed',
    startDate: new Date('2024-01-12'),
    endDate: new Date('2024-01-16'),
    notes: 'AWS setup and configuration',
    metadata: {
      cloudProvider: 'AWS',
      services: ['EC2', 'RDS', 'S3', 'CloudFront']
    },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-16')
  },
  {
    userId: 'user1',
    userEmail: 'john.doe@example.com',
    userName: 'John Doe',
    serviceId: 'service6',
    serviceName: 'SEO Optimization',
    serviceCategory: 'Marketing',
    consumptionType: 'subscription',
    quantity: 1,
    duration: 90, // 1.5 hours
    status: 'active',
    startDate: new Date('2024-01-25'),
    endDate: null,
    notes: 'Ongoing SEO optimization service',
    metadata: {
      targetKeywords: ['web development', 'mobile apps'],
      currentRanking: 15
    },
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  }
];

async function seedServiceConsumption() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('serviceConsumption');
    
    // Clear existing data
    await collection.deleteMany({});
    console.log('Cleared existing service consumption data');
    
    // Insert sample data
    const result = await collection.insertMany(sampleServiceConsumptions);
    console.log(`Inserted ${result.insertedCount} service consumption records`);
    
    // Verify the data
    const count = await collection.countDocuments();
    console.log(`Total service consumption records: ${count}`);
    
  } catch (error) {
    console.error('Error seeding service consumption data:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seedServiceConsumption();
