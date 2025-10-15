import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mvp:mvp@idea2mvp.htev3lk.mongodb.net/?retryWrites=true&w=majority&appName=idea2mvp';
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function makeAdmin2() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const usersCollection = db.collection('users');
    
    // Find the user to make admin
    const user = await usersCollection.findOne({ email: 'admin2@example.com' });
    
    if (user) {
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { role: 'admin' } }
      );
      console.log('✅ Made admin2@example.com an admin');
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Error making user admin:', error);
  } finally {
    await client.close();
  }
}

makeAdmin2();
