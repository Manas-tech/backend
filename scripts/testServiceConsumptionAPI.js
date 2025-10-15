import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function testServiceConsumptionAPI() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Check if there are any admin users
    const adminUsers = await db.collection('users').find({ role: 'admin' }).toArray();
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.role}`);
    });
    
    // Check service consumption data
    const consumptionCount = await db.collection('serviceConsumption').countDocuments();
    console.log(`\nService consumption records: ${consumptionCount}`);
    
    if (consumptionCount > 0) {
      const sample = await db.collection('serviceConsumption').findOne({});
      console.log('\nSample service consumption record:');
      console.log(`- User: ${sample.userName} (${sample.userEmail})`);
      console.log(`- Service: ${sample.serviceName}`);
      console.log(`- Status: ${sample.status}`);
      console.log(`- Amount: ${sample.metadata.originalAmount} ${sample.metadata.currency}`);
    }
    
    // Test API endpoint with a simple request
    console.log('\nTesting API endpoint...');
    try {
      const response = await fetch('http://localhost:5000/api/service-consumption', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(`API Response Status: ${response.status}`);
      if (response.status === 401) {
        console.log('✅ API is working - requires authentication (expected)');
      } else {
        const data = await response.json();
        console.log('API Response:', data);
      }
    } catch (error) {
      console.log('API Test Error:', error.message);
    }
    
  } catch (error) {
    console.error('Error testing service consumption API:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

testServiceConsumptionAPI();
