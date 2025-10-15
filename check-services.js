import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mvp:mvp@idea2mvp.htev3lk.mongodb.net/?retryWrites=true&w=majority&appName=idea2mvp';

async function checkServices() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db('idea2mvp');
    const servicesCollection = db.collection('services');
    
    const services = await servicesCollection.find({}).toArray();
    console.log(`📊 Found ${services.length} services:`);
    
    services.forEach((service, index) => {
      console.log(`${index + 1}. Title: ${service.title}, Category: ${service.category}, Active: ${service.isActive}`);
    });
    
    if (services.length === 0) {
      console.log('⚠️  No services found in database');
      console.log('🔍 Checking if collection exists...');
      const collections = await db.listCollections().toArray();
      const serviceCollectionExists = collections.some(col => col.name === 'services');
      console.log(`📁 Services collection exists: ${serviceCollectionExists}`);
    }
    
  } catch (error) {
    console.error('❌ Error checking services:', error);
  } finally {
    await client.close();
  }
}

checkServices();
