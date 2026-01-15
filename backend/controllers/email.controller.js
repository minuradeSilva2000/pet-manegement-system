import { sendEmail } from "../services/email.service.js";

// Controller to handle sending emails
export const sendEmailController = async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    // Validate required fields
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({
        success: false,
        message: "Please provide recipient email, subject, and message content",
      });
    }

    // Send the email
    await sendEmail({
      to,
      subject,
      text,
      html,
    });

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Email controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
};
