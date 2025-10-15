import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function checkServiceConsumption() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nAvailable collections:');
    collections.forEach(col => console.log('- ' + col.name));
    
    // Check serviceConsumption collection
    const count = await db.collection('serviceConsumption').countDocuments();
    console.log(`\nCurrent serviceConsumption records: ${count}`);
    
    if (count > 0) {
      console.log('\nSample records:');
      const samples = await db.collection('serviceConsumption').find({}).limit(3).toArray();
      samples.forEach((record, index) => {
        console.log(`\nRecord ${index + 1}:`);
        console.log(`- User: ${record.userName} (${record.userEmail})`);
        console.log(`- Service: ${record.serviceName}`);
        console.log(`- Type: ${record.consumptionType}`);
        console.log(`- Status: ${record.status}`);
        console.log(`- Created: ${record.createdAt}`);
      });
    }
    
    // Check if there are any other collections that might contain service consumption data
    const possibleCollections = ['service_consumption', 'serviceconsumption', 'consumptions', 'usage'];
    for (const colName of possibleCollections) {
      try {
        const colCount = await db.collection(colName).countDocuments();
        if (colCount > 0) {
          console.log(`\nFound ${colCount} records in collection: ${colName}`);
        }
      } catch (error) {
        // Collection doesn't exist, ignore
      }
    }
    
  } catch (error) {
    console.error('Error checking service consumption data:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkServiceConsumption();
