import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/idea2mvp';
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function updateProjectWorkflow() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const projectWorkflowCollection = db.collection('projectWorkflow');
    
    // Get the first project workflow
    const workflow = await projectWorkflowCollection.findOne({});
    
    if (!workflow) {
      console.log('No project workflows found. Create a project first.');
      return;
    }
    
    console.log(`\nUpdating project: ${workflow.projectName}`);
    console.log(`Current status: ${workflow.status}`);
    console.log(`Current phase: ${workflow.currentPhase}`);
    console.log(`Current progress: ${workflow.progress?.overall || 0}%`);
    
    // Update the project workflow
    const updateData = {
      status: 'active',
      currentPhase: 'discovery',
      currentSubstep: 'Market Research',
      progress: {
        overall: 25,
        phases: {
          discovery: 25,
          design: 0,
          development: 0,
          testing: 0,
          launch: 0,
          support: 0
        }
      },
      milestones: [
        {
          _id: new ObjectId().toString(),
          title: 'Market Research Complete',
          description: 'Complete market research and competitor analysis',
          phase: 'discovery',
          status: 'completed',
          weight: 1,
          dueDate: new Date(),
          completedDate: new Date(),
          dependencies: []
        },
        {
          _id: new ObjectId().toString(),
          title: 'User Personas Defined',
          description: 'Define target user personas and user stories',
          phase: 'discovery',
          status: 'in-progress',
          weight: 1,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          dependencies: []
        }
      ],
      deliverables: [
        {
          _id: new ObjectId().toString(),
          name: 'Market Research Report',
          description: 'Comprehensive market research and competitor analysis',
          phase: 'discovery',
          status: 'completed',
          url: 'https://example.com/market-research.pdf',
          dueDate: new Date(),
          completedDate: new Date()
        }
      ],
      substeps: {
        discovery: [
          {
            name: 'Market Research',
            completed: true,
            completedDate: new Date(),
            notes: 'Completed comprehensive market research'
          },
          {
            name: 'User Personas',
            completed: false,
            completedDate: null,
            notes: 'In progress - defining target users'
          },
          {
            name: 'Competitor Analysis',
            completed: false,
            completedDate: null,
            notes: 'Next step'
          }
        ],
        design: [],
        development: [],
        testing: [],
        launch: [],
        support: []
      },
      updatedAt: new Date()
    };
    
    const result = await projectWorkflowCollection.updateOne(
      { _id: workflow._id },
      { $set: updateData }
    );
    
    if (result.modifiedCount > 0) {
      console.log('\n✅ Project workflow updated successfully!');
      console.log('Updated fields:');
      console.log('- Status: active');
      console.log('- Current Phase: discovery');
      console.log('- Progress: 25%');
      console.log('- Added 2 milestones');
      console.log('- Added 1 deliverable');
      console.log('- Updated substeps');
    } else {
      console.log('\n❌ Failed to update project workflow');
    }
    
  } catch (error) {
    console.error('Error updating project workflow:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

updateProjectWorkflow();
