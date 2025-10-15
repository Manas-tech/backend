import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mvp:mvp@idea2mvp.htev3lk.mongodb.net/?retryWrites=true&w=majority&appName=idea2mvp';
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function debugPortfolio() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const portfolioCollection = db.collection('portfolio');
    
    console.log('🔍 Debugging Portfolio Collection:');
    
    // Get all portfolio items
    const allPortfolio = await portfolioCollection.find({}).toArray();
    console.log(`\n📊 Total portfolio items: ${allPortfolio.length}`);
    
    allPortfolio.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.title}`);
      console.log(`   Published: ${item.published}`);
      console.log(`   Featured: ${item.featured}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   Created: ${item.createdAt}`);
      console.log(`   Fields: ${Object.keys(item).join(', ')}`);
    });
    
    // Test different queries
    console.log('\n🔍 Testing Queries:');
    
    // Query with published = true
    const publishedTrue = await portfolioCollection.find({ published: true }).toArray();
    console.log(`Published = true: ${publishedTrue.length} items`);
    
    // Query with published = false
    const publishedFalse = await portfolioCollection.find({ published: false }).toArray();
    console.log(`Published = false: ${publishedFalse.length} items`);
    
    // Query with no published filter
    const noPublishedFilter = await portfolioCollection.find({}).toArray();
    console.log(`No published filter: ${noPublishedFilter.length} items`);
    
    // Query with published field exists
    const publishedExists = await portfolioCollection.find({ published: { $exists: true } }).toArray();
    console.log(`Published field exists: ${publishedExists.length} items`);
    
  } catch (error) {
    console.error('❌ Error debugging portfolio:', error);
  } finally {
    await client.close();
  }
}

debugPortfolio();
