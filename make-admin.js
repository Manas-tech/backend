import mongoose from 'mongoose';
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

async function makeUserAdmin() {
  try {
    console.log('🔍 Looking for test user...');
    
    const user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('❌ Test user not found!');
      return;
    }

    console.log(`👤 Found user: ${user.email}`);
    console.log(`🔑 Current role: ${user.role}`);
    
    if (user.role === 'admin') {
      console.log('✅ User is already an admin!');
      return;
    }

    console.log('🔄 Updating user role to admin...');
    user.role = 'admin';
    user.updatedAt = new Date();
    await user.save();
    
    console.log('✅ User role updated to admin successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('👤 Role: admin');
    console.log('');
    console.log('🚀 You can now use these credentials to access the admin dashboard!');
    
  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    mongoose.connection.close();
  }
}

makeUserAdmin();
