import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/idea2mvp';
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function checkTestimonials() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const testimonialsCollection = db.collection('testimonials');
    
    // Count total testimonials
    const totalCount = await testimonialsCollection.countDocuments();
    console.log(`\nTotal testimonials: ${totalCount}`);
    
    if (totalCount > 0) {
      // Get all testimonials
      const testimonials = await testimonialsCollection.find({}).toArray();
      console.log('\nAll testimonials:');
      testimonials.forEach((testimonial, index) => {
        console.log(`\n${index + 1}. ${testimonial.name} (${testimonial.designation})`);
        console.log(`   Quote: ${testimonial.quote.substring(0, 100)}...`);
        console.log(`   Featured: ${testimonial.featured}`);
        console.log(`   Status: ${testimonial.status}`);
        console.log(`   Created: ${testimonial.createdAt}`);
      });
      
      // Get featured testimonials
      const featuredCount = await testimonialsCollection.countDocuments({ featured: true, status: 'published' });
      console.log(`\nFeatured testimonials: ${featuredCount}`);
      
      const featuredTestimonials = await testimonialsCollection.find({ featured: true, status: 'published' }).toArray();
      console.log('\nFeatured testimonials:');
      featuredTestimonials.forEach((testimonial, index) => {
        console.log(`${index + 1}. ${testimonial.name} - ${testimonial.designation}`);
      });
    } else {
      console.log('\nNo testimonials found in database.');
    }
    
  } catch (error) {
    console.error('Error checking testimonials:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

checkTestimonials();
