import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mvp:mvp@idea2mvp.htev3lk.mongodb.net/?retryWrites=true&w=majority&appName=idea2mvp';
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function scanAllData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    console.log(`📊 Scanning database: ${DATABASE_NAME}`);
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`\n📁 Found ${collections.length} collections:`);
    
    for (const collection of collections) {
      const collectionName = collection.name;
      const collectionObj = db.collection(collectionName);
      const count = await collectionObj.countDocuments();
      
      console.log(`\n📋 Collection: ${collectionName}`);
      console.log(`   Count: ${count} documents`);
      
      if (count > 0) {
        // Get a sample document to see structure
        const sample = await collectionObj.findOne();
        if (sample) {
          console.log(`   Sample fields: ${Object.keys(sample).join(', ')}`);
          if (sample.title) console.log(`   Sample title: ${sample.title}`);
          if (sample.email) console.log(`   Sample email: ${sample.email}`);
          if (sample.name) console.log(`   Sample name: ${sample.name}`);
        }
      }
    }
    
    // Check specific collections we care about
    console.log('\n🔍 Detailed Analysis:');
    
    // Users
    const users = await db.collection('users').find({}).toArray();
    console.log(`\n👥 Users (${users.length}):`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} - ${user.name || 'No name'} - Role: ${user.role || 'No role'}`);
    });
    
    // Services
    const services = await db.collection('services').find({}).toArray();
    console.log(`\n🛠️ Services (${services.length}):`);
    services.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.title} - Category: ${service.category || 'No category'}`);
    });
    
    // Blogs
    const blogs = await db.collection('blogs').find({}).toArray();
    console.log(`\n📝 Blogs (${blogs.length}):`);
    blogs.forEach((blog, index) => {
      console.log(`   ${index + 1}. ${blog.title} - Published: ${blog.published || false}`);
    });
    
    // Portfolio
    const portfolio = await db.collection('portfolio').find({}).toArray();
    console.log(`\n🎨 Portfolio (${portfolio.length}):`);
    portfolio.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.title || 'No title'} - Category: ${item.category || 'No category'}`);
    });
    
    // Projects
    const projects = await db.collection('projects').find({}).toArray();
    console.log(`\n🚀 Projects (${projects.length}):`);
    projects.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name || project.title || 'No name'} - Status: ${project.status || 'No status'}`);
    });
    
    // Project Workflow
    const projectWorkflow = await db.collection('project_workflow').find({}).toArray();
    console.log(`\n📊 Project Workflow (${projectWorkflow.length}):`);
    projectWorkflow.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name || project.title || 'No name'} - Phase: ${project.currentPhase || 'No phase'}`);
    });
    
    // Projects New
    const projectsNew = await db.collection('projects_new').find({}).toArray();
    console.log(`\n🆕 Projects New (${projectsNew.length}):`);
    projectsNew.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name || project.title || 'No name'} - Status: ${project.status || 'No status'}`);
    });
    
    // Purchases
    const purchases = await db.collection('purchases').find({}).toArray();
    console.log(`\n💳 Purchases (${purchases.length}):`);
    purchases.forEach((purchase, index) => {
      console.log(`   ${index + 1}. User: ${purchase.userId} - Amount: ${purchase.totalAmount || 'No amount'}`);
    });
    
    // Cart
    const cart = await db.collection('cart').find({}).toArray();
    console.log(`\n🛒 Cart (${cart.length}):`);
    cart.forEach((cartItem, index) => {
      console.log(`   ${index + 1}. User: ${cartItem.userId} - Items: ${cartItem.items?.length || 0}`);
    });
    
  } catch (error) {
    console.error('❌ Error scanning data:', error);
  } finally {
    await client.close();
  }
}

scanAllData();
