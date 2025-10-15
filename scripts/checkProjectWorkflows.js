import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/idea2mvp';
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function checkProjectWorkflows() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const projectWorkflowCollection = db.collection('projectWorkflow');
    
    const totalCount = await projectWorkflowCollection.countDocuments();
    console.log(`\nTotal project workflows: ${totalCount}`);
    
    if (totalCount > 0) {
      const workflows = await projectWorkflowCollection.find({}).limit(3).toArray();
      console.log('\nSample project workflows:');
      workflows.forEach((workflow, index) => {
        console.log(`\n${index + 1}. ${workflow.projectName}`);
        console.log(`   User ID: ${workflow.userId}`);
        console.log(`   Status: ${workflow.status}`);
        console.log(`   Current Phase: ${workflow.currentPhase}`);
        console.log(`   Progress: ${workflow.progress?.overall || 0}%`);
        console.log(`   Milestones: ${workflow.milestones?.length || 0}`);
        console.log(`   Deliverables: ${workflow.deliverables?.length || 0}`);
      });
    } else {
      console.log('\nNo project workflows found in database.');
      console.log('You may need to create some project workflows from the admin dashboard.');
    }
    
  } catch (error) {
    console.error('Error checking project workflows:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkProjectWorkflows();
