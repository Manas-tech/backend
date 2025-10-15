import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

const sampleTestimonials = [
  {
    name: "Mark Patel",
    designation: "Co-Founder",
    company: "TechStart Inc.",
    quote: "idea2mvp transformed our vision into reality. Their lean approach saved us months of development time and helped us launch our MVP in just 2 weeks. The team's expertise in rapid prototyping is unmatched.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 5,
    projectType: "Web App",
    status: "published",
    featured: true,
    metadata: {
      projectDuration: "2 weeks",
      industry: "FinTech",
      funding: "$500K"
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    name: "Tom Davis",
    designation: "Founder",
    company: "InnovateLab",
    quote: "The team's expertise in rapid prototyping helped us validate our concept before major investment. Their lean startup methodology approach was exactly what we needed to pivot quickly and find product-market fit.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 5,
    projectType: "Mobile App",
    status: "published",
    featured: true,
    metadata: {
      projectDuration: "3 weeks",
      industry: "HealthTech",
      users: "10K+"
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    name: "Sarah Johnson",
    designation: "Founder",
    company: "GreenTech Solutions",
    quote: "Outstanding service and attention to detail. They truly understand the startup ecosystem and provided invaluable guidance throughout our development process. Highly recommended for any entrepreneur looking to build their MVP.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1061&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    rating: 5,
    projectType: "SaaS Platform",
    status: "published",
    featured: true,
    metadata: {
      projectDuration: "4 weeks",
      industry: "CleanTech",
      revenue: "$50K MRR"
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    name: "John Smith",
    designation: "Founder",
    company: "DataFlow Analytics",
    quote: "From idea to MVP in just 90 days. The process was seamless and results exceeded expectations. The team's technical expertise and business acumen made all the difference in our success.",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 5,
    projectType: "Web App",
    status: "published",
    featured: false,
    metadata: {
      projectDuration: "90 days",
      industry: "Data Analytics",
      clients: "25+"
    },
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10')
  },
  {
    name: "Emily Chen",
    designation: "CEO",
    company: "EduTech Innovations",
    quote: "Working with idea2mvp was a game-changer for our startup. Their comprehensive approach from ideation to launch helped us secure our Series A funding. The quality of work and speed of delivery is exceptional.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 5,
    projectType: "Mobile App",
    status: "published",
    featured: true,
    metadata: {
      projectDuration: "6 weeks",
      industry: "EdTech",
      funding: "$2M Series A"
    },
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    name: "Michael Rodriguez",
    designation: "Co-Founder",
    company: "RetailTech Pro",
    quote: "The team's understanding of e-commerce and retail technology is impressive. They delivered a robust MVP that our customers love. The ongoing support and maintenance has been excellent.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 4,
    projectType: "eCommerce",
    status: "published",
    featured: false,
    metadata: {
      projectDuration: "8 weeks",
      industry: "RetailTech",
      sales: "$100K+"
    },
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  },
  {
    name: "Lisa Wang",
    designation: "Founder",
    company: "HealthConnect",
    quote: "idea2mvp helped us navigate the complex healthcare compliance requirements while building our MVP. Their expertise in both technology and regulatory compliance was invaluable.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 5,
    projectType: "SaaS Platform",
    status: "draft",
    featured: false,
    metadata: {
      projectDuration: "10 weeks",
      industry: "HealthTech",
      compliance: "HIPAA"
    },
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },
  {
    name: "David Kim",
    designation: "CTO",
    company: "AI Solutions Ltd",
    quote: "The technical architecture and scalability considerations were top-notch. They built a solid foundation that we can easily scale as our user base grows. Highly professional team.",
    avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    rating: 5,
    projectType: "Web App",
    status: "published",
    featured: false,
    metadata: {
      projectDuration: "12 weeks",
      industry: "AI/ML",
      users: "5K+"
    },
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-05')
  }
];

async function seedTestimonials() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    const collection = db.collection('testimonials');
    
    // Clear existing data
    await collection.deleteMany({});
    console.log('Cleared existing testimonials data');
    
    // Insert sample data
    const result = await collection.insertMany(sampleTestimonials);
    console.log(`Inserted ${result.insertedCount} testimonial records`);
    
    // Verify the data
    const count = await collection.countDocuments();
    console.log(`Total testimonial records: ${count}`);
    
    // Show sample of inserted data
    console.log('\nSample testimonials:');
    const samples = await collection.find({}).limit(3).toArray();
    samples.forEach((testimonial, index) => {
      console.log(`\nTestimonial ${index + 1}:`);
      console.log(`- Name: ${testimonial.name} (${testimonial.designation})`);
      console.log(`- Company: ${testimonial.company}`);
      console.log(`- Rating: ${testimonial.rating}/5`);
      console.log(`- Status: ${testimonial.status}`);
      console.log(`- Featured: ${testimonial.featured}`);
      console.log(`- Project Type: ${testimonial.projectType}`);
    });
    
  } catch (error) {
    console.error('Error seeding testimonials data:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

seedTestimonials();
