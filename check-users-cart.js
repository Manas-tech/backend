import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mvp:mvp@idea2mvp.htev3lk.mongodb.net/?retryWrites=true&w=majority&appName=idea2mvp');

const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String,
  role: String,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Name: ${user.name || 'N/A'}, Role: ${user.role || 'user'}`);
    });
    
    if (users.length === 0) {
      console.log('❌ No users found. You need to create a user first.');
      console.log('💡 Try registering a new user through the frontend or create a test user.');
    } else {
      console.log('✅ Users found. You can use any of these to test the cart functionality.');
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers();
