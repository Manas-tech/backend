import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DATABASE || 'idea2mvp';

async function convertCorrectPurchasesToServiceConsumption() {
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
    
    // Convert purchases to service consumption records with correct field mapping
    const serviceConsumptions = purchases.map((purchase, index) => {
      // Determine consumption type based on serviceType
      let consumptionType = 'one-time';
      if (purchase.serviceType === 'subscription') {
        consumptionType = 'subscription';
      } else if (purchase.serviceType === 'trial') {
        consumptionType = 'trial';
      } else if (purchase.serviceType === 'service') {
        consumptionType = 'usage';
      } else if (purchase.serviceType === 'unknown') {
        consumptionType = 'one-time';
      }
      
      // Determine status based on purchase status
      let status = 'completed';
      if (purchase.status === 'pending') {
        status = 'active';
      } else if (purchase.status === 'failed') {
        status = 'cancelled';
      } else if (purchase.status === 'purchased') {
        status = 'completed';
      }
      
      // Estimate duration based on product name and amount
      let duration = 60; // Default 1 hour
      const productName = (purchase.productName || '').toLowerCase();
      const category = (purchase.category || '').toLowerCase();
      
      if (productName.includes('social media') || category.includes('social')) {
        duration = 120; // 2 hours for social media
      } else if (productName.includes('development') || category.includes('development')) {
        duration = 480; // 8 hours for development
      } else if (productName.includes('design') || category.includes('design')) {
        duration = 180; // 3 hours for design
      } else if (productName.includes('marketing') || category.includes('marketing')) {
        duration = 120; // 2 hours for marketing
      }
      
      // If amount is high, increase duration proportionally
      if (purchase.totalAmount > 20000) {
        duration = duration * 2; // Double duration for high-value services
      }
      
      return {
        userId: purchase.userId || `user_${index}`,
        userEmail: purchase.userEmail,
        userName: purchase.userName || purchase.userEmail?.split('@')[0] || 'Unknown User',
        serviceId: purchase.stripeProductId || `service_${index}`,
        serviceName: purchase.productName || 'Unknown Service',
        serviceCategory: purchase.category || 'General',
        consumptionType: consumptionType,
        quantity: purchase.quantity || 1,
        duration: duration,
        status: status,
        startDate: purchase.purchasedAt || purchase.createdAt || new Date(),
        endDate: status === 'completed' ? new Date((purchase.purchasedAt || purchase.createdAt || new Date()).getTime() + (duration * 60 * 1000)) : null,
        notes: purchase.productDescription || `Converted from purchase record. Original amount: ${purchase.totalAmount || 'N/A'} ${purchase.currency || 'USD'}`,
        metadata: {
          originalPurchaseId: purchase._id,
          stripeSessionId: purchase.stripeSessionId,
          stripeCustomerId: purchase.stripeCustomerId,
          stripeProductId: purchase.stripeProductId,
          stripePriceId: purchase.stripePriceId,
          stripePaymentIntentId: purchase.stripePaymentIntentId,
          productDescription: purchase.productDescription,
          originalAmount: purchase.totalAmount,
          unitPrice: purchase.unitPrice,
          currency: purchase.currency,
          serviceType: purchase.serviceType,
          paymentStatus: purchase.paymentStatus,
          originalStatus: purchase.status,
          createdAt: purchase.createdAt,
          updatedAt: purchase.updatedAt,
          publishedAt: purchase.publishedAt,
          completedAt: purchase.completedAt,
          startedAt: purchase.startedAt,
          onboardingCompletedAt: purchase.onboardingCompletedAt,
          lastUpdated: purchase.lastUpdated
        },
        createdAt: purchase.createdAt || purchase.purchasedAt || new Date(),
        updatedAt: purchase.updatedAt || new Date()
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
      console.log(`- Category: ${record.serviceCategory}`);
      console.log(`- Type: ${record.consumptionType}`);
      console.log(`- Status: ${record.status}`);
      console.log(`- Duration: ${record.duration} minutes`);
      console.log(`- Amount: ${record.metadata.originalAmount} ${record.metadata.currency}`);
      console.log(`- Service ID: ${record.serviceId}`);
      console.log(`- Stripe Product ID: ${record.metadata.stripeProductId}`);
    });
    
  } catch (error) {
    console.error('Error converting purchases to service consumption:', error);
  } finally {
    await client.close();
    console.log('\nDisconnected from MongoDB');
  }
}

convertCorrectPurchasesToServiceConsumption();
