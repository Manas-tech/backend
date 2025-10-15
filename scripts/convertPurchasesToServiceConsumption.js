import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function convertPurchasesToServiceConsumption() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DATABASE_NAME);
    
    // Get all purchases
    const purchases = await db.collection('purchases').find({}).toArray();
    console.log(`Found ${purchases.length} purchases to convert`);
    
    if (purchases.length === 0) {
      console.log('No purchases found to convert');
      return;
    }
    
    // Clear existing service consumption data
    await db.collection('serviceConsumption').deleteMany({});
    console.log('Cleared existing service consumption data');
    
    // Convert purchases to service consumption records
    const serviceConsumptions = purchases.map((purchase, index) => {
      // Determine consumption type based on purchase data
      let consumptionType = 'one-time';
      if (purchase.productName && purchase.productName.toLowerCase().includes('subscription')) {
        consumptionType = 'subscription';
      } else if (purchase.productName && purchase.productName.toLowerCase().includes('trial')) {
        consumptionType = 'trial';
      }
      
      // Determine status based on purchase status
      let status = 'completed';
      if (purchase.status === 'pending') {
        status = 'active';
      } else if (purchase.status === 'failed') {
        status = 'cancelled';
      }
      
      // Estimate duration based on product type
      let duration = 60; // Default 1 hour
      if (purchase.productName && purchase.productName.toLowerCase().includes('development')) {
        duration = 480; // 8 hours for development
      } else if (purchase.productName && purchase.productName.toLowerCase().includes('design')) {
        duration = 180; // 3 hours for design
      } else if (purchase.productName && purchase.productName.toLowerCase().includes('marketing')) {
        duration = 120; // 2 hours for marketing
      }
      
      return {
        userId: purchase.userId || `user_${index}`,
        userEmail: purchase.userEmail,
        userName: purchase.userName || purchase.userEmail?.split('@')[0] || 'Unknown User',
        serviceId: purchase.productId || `service_${index}`,
        serviceName: purchase.productName || 'Unknown Service',
        serviceCategory: purchase.category || 'General',
        consumptionType: consumptionType,
        quantity: purchase.quantity || 1,
        duration: duration,
        status: status,
        startDate: purchase.purchasedAt || new Date(),
        endDate: status === 'completed' ? new Date(purchase.purchasedAt?.getTime() + (duration * 60 * 1000)) : null,
        notes: `Converted from purchase record. Original amount: ${purchase.totalAmount || 'N/A'}`,
        metadata: {
          originalPurchaseId: purchase._id,
          originalAmount: purchase.totalAmount,
          paymentStatus: purchase.paymentStatus,
          originalStatus: purchase.status
        },
        createdAt: purchase.purchasedAt || new Date(),
        updatedAt: new Date()
      };
    });
    
    // Insert converted records
    const result = await db.collection('serviceConsumption').insertMany(serviceConsumptions);
    console.log(`Successfully converted ${result.insertedCount} purchases to service consumption records`);
    
    // Verify the conversion
    const count = await db.collection('serviceConsumption').countDocuments();
    console.log(`Total service consumption records: ${count}`);
    
    // Show sample of converted data
    console.log('\nSample converted records:');
    const samples = await db.collection('serviceConsumption').find({}).limit(3).toArray();
    samples.forEach((record, index) => {
      console.log(`\nRecord ${index + 1}:`);
      console.log(`- User: ${record.userName} (${record.userEmail})`);
      console.log(`- Service: ${record.serviceName}`);
      console.log(`- Type: ${record.consumptionType}`);
      console.log(`- Status: ${record.status}`);
      console.log(`- Duration: ${record.duration} minutes`);
      console.log(`- Original Amount: ${record.metadata.originalAmount}`);
    });
    
  } catch (error) {
    console.error('Error converting purchases to service consumption:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

convertPurchasesToServiceConsumption();
