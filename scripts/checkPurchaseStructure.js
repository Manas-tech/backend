import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function checkPurchaseStructure() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Get one purchase record to see the exact structure
    const purchase = await db.collection('purchases').findOne({});
    
    if (purchase) {
      console.log('Purchase record structure:');
      console.log(JSON.stringify(purchase, null, 2));
    } else {
      console.log('No purchase records found');
    }
    
  } catch (error) {
    console.error('Error checking purchase structure:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkPurchaseStructure();
