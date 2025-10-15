import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE;

let client;
let db;

export const connectToMongoDB = async () => {
  try {
    if (db) {
      return db;
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DATABASE_NAME);
    
    console.log('✅ Connected to MongoDB Atlas');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not connected. Call connectToMongoDB() first.');
  }
  return db;
};

export const closeMongoDBConnection = async () => {
  if (client) {
    await client.close();
    console.log('✅ MongoDB connection closed');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await closeMongoDBConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeMongoDBConnection();
  process.exit(0);
});

