import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function checkRelatedData() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Check purchases collection for service-related data
    console.log('\n=== PURCHASES COLLECTION ===');
    const purchaseCount = await db.collection('purchases').countDocuments();
    console.log(`Total purchases: ${purchaseCount}`);
    
    if (purchaseCount > 0) {
      const samplePurchases = await db.collection('purchases').find({}).limit(3).toArray();
      samplePurchases.forEach((purchase, index) => {
        console.log(`\nPurchase ${index + 1}:`);
        console.log(`- User: ${purchase.userName || 'N/A'} (${purchase.userEmail || 'N/A'})`);
        console.log(`- Product: ${purchase.productName || 'N/A'}`);
        console.log(`- Category: ${purchase.category || 'N/A'}`);
        console.log(`- Amount: ${purchase.totalAmount || 'N/A'}`);
        console.log(`- Status: ${purchase.status || 'N/A'}`);
        console.log(`- Created: ${purchase.purchasedAt || 'N/A'}`);
      });
    }
    
    // Check contactSubmissions for service-related inquiries
    console.log('\n=== CONTACT SUBMISSIONS ===');
    const contactCount = await db.collection('contactSubmissions').countDocuments();
    console.log(`Total contact submissions: ${contactCount}`);
    
    if (contactCount > 0) {
      const sampleContacts = await db.collection('contactSubmissions').find({}).limit(3).toArray();
      sampleContacts.forEach((contact, index) => {
        console.log(`\nContact ${index + 1}:`);
        console.log(`- Name: ${contact.name || 'N/A'}`);
        console.log(`- Email: ${contact.email || 'N/A'}`);
        console.log(`- Subject: ${contact.subject || 'N/A'}`);
        console.log(`- Selected Service: ${contact.selectedService || 'N/A'}`);
        console.log(`- Type: ${contact.type || 'N/A'}`);
        console.log(`- Created: ${contact.createdAt || 'N/A'}`);
      });
    }
    
    // Check projects collection
    console.log('\n=== PROJECTS COLLECTION ===');
    const projectCount = await db.collection('projects').countDocuments();
    console.log(`Total projects: ${projectCount}`);
    
    if (projectCount > 0) {
      const sampleProjects = await db.collection('projects').find({}).limit(3).toArray();
      sampleProjects.forEach((project, index) => {
        console.log(`\nProject ${index + 1}:`);
        console.log(`- Title: ${project.title || 'N/A'}`);
        console.log(`- Client: ${project.client || 'N/A'}`);
        console.log(`- Status: ${project.status || 'N/A'}`);
        console.log(`- Created: ${project.createdAt || 'N/A'}`);
      });
    }
    
    // Check projectWorkflow collection
    console.log('\n=== PROJECT WORKFLOW COLLECTION ===');
    const workflowCount = await db.collection('projectWorkflow').countDocuments();
    console.log(`Total workflow records: ${workflowCount}`);
    
    if (workflowCount > 0) {
      const sampleWorkflows = await db.collection('projectWorkflow').find({}).limit(3).toArray();
      sampleWorkflows.forEach((workflow, index) => {
        console.log(`\nWorkflow ${index + 1}:`);
        console.log(`- Project: ${workflow.projectName || 'N/A'}`);
        console.log(`- Stage: ${workflow.stage || 'N/A'}`);
        console.log(`- Status: ${workflow.status || 'N/A'}`);
        console.log(`- Created: ${workflow.createdAt || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking related data:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkRelatedData();
