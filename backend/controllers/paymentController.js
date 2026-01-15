import paymentService from "../services/payment.service.js";
import * as paymentEmailService from "../utils/emailService.js";
import { generatePaymentReceipt } from "../utils/pdfService.js"; 

// Centralized error handler
const handleError = (res, error, defaultCode = "PROCESSING_ERROR", status = 400) => {
  console.error("Payment Error:", error);
  console.error("Stack:", error.stack);
  res.status(status).json({
    message: error?.message || "An unexpected error occurred during payment processing.",
    status: "Failed",
    errorCode: error?.errorCode || defaultCode
  });
};

// Create a new payment
const createPayment = async (req, res) => {
  try {
    console.log("Payment request received:", JSON.stringify(req.body, null, 2));

    const { cardNumber, expiryDate, cvv, cardHolderName, ...paymentData } = req.body;

    if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
      console.log("Missing card details");
      return res.status(400).json({
        message: "Payment failed. Missing card details.",
        status: "Failed",
        errorCode: "INVALID_CARD_DETAILS"
      });
    }

    if (!paymentData.name || !paymentData.email || !paymentData.amount) {
      console.log("Missing required payment data");
      return res.status(400).json({
        message: "Payment failed. Missing required payment information.",
        status: "Failed",
        errorCode: "INVALID_PAYMENT_DATA"
      });
    }

    paymentData.amount = Number(paymentData.amount);
    paymentData.status = "Completed";

    let payment;
    let pdfBuffer;
    let emailSent = false;
    let emailError = null;
    let isDevelopmentMode = false;

    try {
      // Create payment record
      payment = await paymentService.createPayment(paymentData);
      console.log("Payment saved:", payment._id);

      try {
        // Generate PDF receipt
        pdfBuffer = await generatePaymentReceipt(payment); 
        console.log("PDF generated successfully");

        try {
          // Send confirmation email with PDF attachment - updated to handle enhanced response
          const emailResult = await paymentEmailService.sendPaymentConfirmation(payment, pdfBuffer);
          
          if (emailResult.success) {
            console.log("Email sent successfully with ID:", emailResult.messageId);
            emailSent = true;
          } else if (emailResult.devMode) {
            // In development mode, we may want to consider this "partially" successful
            console.log("Development mode email handling:", emailResult.message);
            emailSent = false;
            isDevelopmentMode = true;
            emailError = emailResult.message || "Development mode: Email not sent";
          } else {
            emailError = "Failed to send email";
            console.error("Email sending failed with result:", emailResult);
          }
        } catch (emailErr) {
          emailError = emailErr.message || "Could not send confirmation email";
          console.error("Email sending failed:", emailErr);
        }
      } catch (pdfError) {
        console.error("PDF generation failed:", pdfError);
      }

      // Return response with PDF buffer for immediate download
      const response = {
        payment,
        status: "Completed",
        message: "Payment processed successfully.",
        pdfBuffer: pdfBuffer ? pdfBuffer.toString('base64') : null,
        receiptUrl: `/api/payments/${payment._id}/receipt`
      };

      if (emailSent) {
        response.message += " A confirmation email has been sent with your receipt.";
      } else {
        response.emailStatus = "failed";
        response.emailError = emailError || "Could not send confirmation email. Please download your receipt directly.";
        
        if (isDevelopmentMode) {
          response.devMode = true;
          response.message += " (Development mode: Email would be sent in production)";
        }
        
        await paymentService.updatePayment(payment._id, { 
          emailSent: false, 
          emailError: emailError,
          devMode: isDevelopmentMode
        });
      }

      return res.status(201).json(response);

    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      throw new Error("Failed to save payment information");
    }
  } catch (error) {
    handleError(res, error, "PROCESSING_ERROR");
  }
};

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.status(200).json(payments);
  } catch (error) {
    handleError(res, error, "FETCH_ALL_FAILED", 500);
  }
};

// Get a single payment by ID
const getPaymentById = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
        status: "Failed",
        errorCode: "PAYMENT_NOT_FOUND"
      });
    }
    res.status(200).json(payment);
  } catch (error) {
    handleError(res, error, "FETCH_BY_ID_FAILED", 500);
  }
};

// Update payment
const updatePayment = async (req, res) => {
  try {
    const payment = await paymentService.updatePayment(req.params.id, req.body);
    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
        status: "Failed",
        errorCode: "PAYMENT_NOT_FOUND"
      });
    }
    res.status(200).json(payment);
  } catch (error) {
    handleError(res, error, "UPDATE_FAILED");
  }
};

// Download payment receipt
const getPaymentReceipt = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
        status: "Failed",
        errorCode: "PAYMENT_NOT_FOUND"
      });
    }

    const pdfBuffer = await generatePaymentReceipt(payment);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payment-receipt-${payment.paymentId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    handleError(res, error, "RECEIPT_GENERATION_FAILED", 500);
  }
};

// Resend payment email
const resendPaymentEmail = async (req, res) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
        status: "Failed",
        errorCode: "PAYMENT_NOT_FOUND"
      });
    }

    const pdfBuffer = await generatePaymentReceipt(payment);
    
    // Use the enhanced email service response
    const emailResult = await paymentEmailService.sendPaymentConfirmation(payment, pdfBuffer);
    
    let status = "Success";
    let message = `Payment confirmation email resent to ${payment.email} successfully.`;
    let emailSent = true;
    let emailError = null;
    
    if (!emailResult.success) {
      status = emailResult.devMode ? "Partial" : "Failed";
      message = emailResult.message || "Could not send confirmation email.";
      emailSent = false;
      emailError = emailResult.devMode ? 
        `Development mode: ${emailResult.message}` : 
        (emailResult.error || "Unknown error");
        
      if (emailResult.devMode) {
        message += " (Development mode: Email would be sent in production)";
      }
    }

    // Update the payment record to reflect email status
    await paymentService.updatePayment(payment._id, { 
      emailSent: emailSent, 
      emailError: emailError,
      devMode: emailResult.devMode || false
    });

    res.status(200).json({
      message: message,
      status: status,
      devMode: emailResult.devMode || false
    });
  } catch (error) {
    handleError(res, error, "EMAIL_RESEND_FAILED", 500);
  }
};

// Export all controller functions
export default {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  getPaymentReceipt,
  resendPaymentEmail
};