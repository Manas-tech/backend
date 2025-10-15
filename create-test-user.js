import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mvp:mvp@idea2mvp.htev3lk.mongodb.net/?retryWrites=true&w=majority&appName=idea2mvp');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  password: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    console.log('🔍 Checking if test user already exists...');
    
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('✅ Test user already exists!');
      console.log(`📧 Email: ${existingUser.email}`);
      console.log(`👤 Name: ${existingUser.name || 'N/A'}`);
      console.log(`🔑 Role: ${existingUser.role}`);
      return;
    }

    console.log('👤 Creating test user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUser = new User({
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'user'
    });
    
    await testUser.save();
    
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('👤 Name: Test User');
    console.log('🔑 Role: user');
    console.log('');
    console.log('🚀 You can now use these credentials to test the cart functionality!');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestUser();
