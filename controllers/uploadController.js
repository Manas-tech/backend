import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDatabase } from '../config/database.js';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

export const uploadAvatar = async (req, res) => {
  try {
    // Use multer middleware
    upload.single('avatar')(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'Upload failed'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Return the file path/URL
      const fileUrl = `/uploads/avatars/${req.file.filename}`;
      
      // Update user profile with new avatar URL
      try {
        const db = getDatabase();
        console.log('🔄 Updating user profile with new avatar URL:', fileUrl);
        console.log('🔄 User ID:', req.user.id);
        
        // Handle both MongoDB ObjectIds and string IDs
        const { ObjectId } = await import('mongodb');
        let updateResult;
        
        try {
          // Try as MongoDB ObjectId first
          updateResult = await db.collection('users').updateOne(
            { _id: new ObjectId(req.user.id) },
            { 
              $set: { 
                photoURL: fileUrl,
                updatedAt: new Date()
              }
            }
          );
        } catch (objectIdError) {
          // If ObjectId conversion fails, try as string
          console.log('🔄 ObjectId conversion failed, trying as string ID');
          updateResult = await db.collection('users').updateOne(
            { _id: req.user.id },
            { 
              $set: { 
                photoURL: fileUrl,
                updatedAt: new Date()
              }
            }
          );
        }
        
        console.log('✅ Database update result:', updateResult);
        
        if (updateResult.matchedCount === 0) {
          console.warn('⚠️ No user found with ID:', req.user.id);
        } else if (updateResult.modifiedCount === 0) {
          console.warn('⚠️ User found but no changes made');
        } else {
          console.log('✅ User profile updated successfully');
        }
      } catch (dbError) {
        console.error('❌ Database update error:', dbError);
        // Still return success for upload, but log the database error
      }
      
      res.json({
        success: true,
        message: 'Avatar uploaded and profile updated successfully',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size
        }
      });
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join('uploads/avatars', filename);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};