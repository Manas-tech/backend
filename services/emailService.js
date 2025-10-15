import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send contact form email
export const sendContactEmail = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const { name, email, message, selectedService, services } = contactData;
    
    // Get service name if selected
    let serviceName = 'No specific service';
    if (selectedService && selectedService !== 'none' && services) {
      const service = services.find(s => s.id === selectedService);
      if (service) {
        serviceName = service.title;
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'manasparwani397@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Details</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service of Interest:</strong> ${serviceName}</p>
            <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
          </div>
          
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #0066cc;">
              <strong>Action Required:</strong> Please respond to this inquiry within 24 hours.
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            This email was sent from the Idea2MVP contact form.
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Contact email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending contact email:', error);
    return { success: false, error: error.message };
  }
};

// Send auto-reply email to user
export const sendAutoReplyEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: 'Thank you for contacting Idea2MVP - We\'ll be in touch soon!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            Thank You for Contacting Us!
          </h2>
          
          <p>Dear ${userName},</p>
          
          <p>Thank you for reaching out to Idea2MVP! We've received your message and our team will review it carefully.</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">What happens next?</h3>
            <ul style="color: #666;">
              <li>Our team will review your inquiry within 24 hours</li>
              <li>We'll respond with detailed information about your project</li>
              <li>If needed, we'll schedule a consultation call</li>
            </ul>
          </div>
          
          <p>In the meantime, feel free to explore our <a href="${process.env.CLIENT_URL}/services" style="color: #f59e0b;">services</a> and <a href="${process.env.CLIENT_URL}/portfolio" style="color: #f59e0b;">portfolio</a> to learn more about what we can do for you.</p>
          
          <p>Best regards,<br>
          <strong>The Idea2MVP Team</strong></p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px; text-align: center;">
            Idea2MVP - Turning Ideas into MVPs<br>
            Email: manasparwani397@gmail.com
          </p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Auto-reply email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending auto-reply email:', error);
    return { success: false, error: error.message };
  }
};
