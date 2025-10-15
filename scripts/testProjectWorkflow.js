import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/idea2mvp';
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function testProjectWorkflow() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const projectWorkflowCollection = db.collection('projectWorkflow');
    
    // Get all project workflows
    const workflows = await projectWorkflowCollection.find({}).toArray();
    console.log(`\nTotal project workflows: ${workflows.length}`);
    
    if (workflows.length > 0) {
      console.log('\nProject Workflows:');
      workflows.forEach((workflow, index) => {
        console.log(`\n${index + 1}. ${workflow.projectName}`);
        console.log(`   User ID: ${workflow.userId}`);
        console.log(`   Status: ${workflow.status}`);
        console.log(`   Current Phase: ${workflow.currentPhase}`);
        console.log(`   Progress: ${workflow.progress?.overall || 0}%`);
        console.log(`   Milestones: ${workflow.milestones?.length || 0}`);
        console.log(`   Deliverables: ${workflow.deliverables?.length || 0}`);
        console.log(`   Created: ${workflow.createdAt}`);
        console.log(`   Updated: ${workflow.updatedAt}`);
      });
    } else {
      console.log('\nNo project workflows found. Create a project from the user dashboard first.');
    }
    
    // Check if there are any projects in the projects_new collection
    const projectsCollection = db.collection('projects_new');
    const projects = await projectsCollection.find({}).toArray();
    console.log(`\nTotal projects in projects_new: ${projects.length}`);
    
    if (projects.length > 0) {
      console.log('\nProjects in projects_new:');
      projects.forEach((project, index) => {
        console.log(`\n${index + 1}. ${project.name}`);
        console.log(`   User ID: ${project.userId}`);
        console.log(`   Status: ${project.status}`);
        console.log(`   Created: ${project.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('Error testing project workflow:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

testProjectWorkflow();
