import nodemailer from "nodemailer";

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email service (e.g., Gmail, Outlook, etc.)
  auth: {
    user: "indikatransport8@gmail.com",
    pass: "itvn bgkz avxp imgl",
  },
});

// Send email function
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: "indikatransport8@gmail.com", // Sender address
      to: options.to, // Recipient address
      subject: options.subject, // Email subject
      text: options.text, // Plain text body
      html: options.html, // HTML body
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
