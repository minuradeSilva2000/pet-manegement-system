import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Flag to determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Create transporter with better error handling
const createTransporter = async () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    // In development, create a test account if no credentials
    if (isDevelopment) {
      console.log("📧 No email credentials found. Creating test account for development...");
      const testAccount = await nodemailer.createTestAccount();
      
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } else {
      throw new Error('Email credentials not configured properly in .env file!');
    }
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

/**
 * Verifies the transporter connection
 * @returns {Promise<boolean>}
 */
const verifyEmailConnection = async () => {
  try {
    const transporter = await createTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("📧 Email service verification failed:", error);
    return false;
  }
};

// Main email sending function
export const sendPaymentConfirmation = async (paymentDetails, pdfBuffer) => {
  try {
    // First verify connection
    const isConnectionValid = await verifyEmailConnection();
    
    if (!isConnectionValid) {
      if (isDevelopment) {
        console.warn('📧 Email service not available, but continuing in development mode.');
        // Return a mock success in development to not break the flow
        return { 
          success: false, 
          devMode: true,
          message: "Email not sent: Email service not configured, but continuing in development mode."
        };
      } else {
        throw new Error('Could not establish connection to email server. Please check your credentials.');
      }
    }
    
    const transporter = await createTransporter();
    const { name, email, serviceType, amount, paymentId } = paymentDetails;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <div style="background-color: #da828f; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
          <h2 style="color: white; margin: 0;">Payment Confirmation</h2>
        </div>
        <div style="padding: 20px;">
          <p>Dear ${name},</p>
          <p>Thank you for your payment. Below is a summary of your transaction:</p>
          <div style="background-color: #f8f4e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Payment ID</strong>: ${paymentId}</p>
            <p><strong>Service</strong>: ${serviceType}</p>
            <p><strong>Amount</strong>: LKR${amount}</p>
            <p><strong>Date</strong>: ${new Date().toLocaleDateString()}</p>
          </div>
          <p>A detailed receipt is attached to this email as a PDF file.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Thank you for your business!</p>
        </div>
        <div style="background-color: #3d1e24; color: white; text-align: center; padding: 15px; border-radius: 0 0 5px 5px;">
          <p style="margin: 0;">&copy; 2025 Petopia. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"Petopia Payment System" <${process.env.EMAIL_USER || 'noreply@petopia.com'}>`,
      to: email,
      subject: `Petopia Payment Confirmation - ${paymentId}`,
      html: emailContent,
      attachments: [
        {
          filename: `payment-receipt-${paymentId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent:", info.messageId);
    
    // For ethereal test accounts, log the preview URL
    if (isDevelopment && info.messageId && info.messageId.includes('ethereal')) {
      console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
    }
    
    return { 
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error("Error sending payment confirmation email:", error);
    
    // Don't break the payment flow in development mode
    if (isDevelopment) {
      console.warn('📧 Failed to send email, but continuing in development mode.');
      return { 
        success: false, 
        devMode: true,
        error: error.message,
        message: "Email not sent, but continuing in development mode."
      };
    }
    
    throw error;
  }
};

// Also keep the original function name for backward compatibility
export const sendPaymentConfirmationEmail = sendPaymentConfirmation;