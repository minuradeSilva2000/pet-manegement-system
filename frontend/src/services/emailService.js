// services/emailService.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/email";

// Create axios instance
const emailApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Send a generic email
export const sendEmail = async (emailData) => {
  try {
    const response = await emailApi.post("/send", emailData);
    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

// Send adoption request email
export const sendAdoptionRequestEmail = async (petDetails, userDetails) => {
  try {
    const emailData = {
      to: petDetails.ownerEmail, // Pet owner's email
      subject: `Adoption Request for ${petDetails.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #f59e0b; margin-bottom: 20px;">New Adoption Request</h2>
          <p>Hello,</p>
          <p>Someone is interested in adopting <strong>${
            petDetails.name
          }</strong>!</p>
          
          <h3 style="margin-top: 20px;">Pet Details:</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li><strong>Name:</strong> ${petDetails.name}</li>
            <li><strong>Gender:</strong> ${petDetails.gender}</li>
            <li><strong>Date of Birth:</strong> ${new Date(
              petDetails.dob
            ).toLocaleDateString()}</li>
          </ul>
          
          <h3 style="margin-top: 20px;">Prospective Adopter Details:</h3>
          <ul style="list-style-type: none; padding-left: 0;">
            <li><strong>Name:</strong> ${userDetails.name}</li>
            <li><strong>Email:</strong> ${userDetails.email}</li>
            <li><strong>Phone:</strong> ${
              userDetails.phone || "Not provided"
            }</li>
          </ul>
          
          <p style="margin-top: 20px;">Please contact the potential adopter to discuss the next steps.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
            <p>This is an automated message from the Pet Adoption Platform.</p>
          </div>
        </div>
      `,
      text: `
        New Adoption Request
        
        Hello,
        
        Someone is interested in adopting ${petDetails.name}!
        
        Pet Details:
        Name: ${petDetails.name}
        Gender: ${petDetails.gender}
        Date of Birth: ${new Date(petDetails.dob).toLocaleDateString()}
        
        Prospective Adopter Details:
        Name: ${userDetails.name}
        Email: ${userDetails.email}
        Phone: ${userDetails.phone || "Not provided"}
        
        Please contact the potential adopter to discuss the next steps.
        
        This is an automated message from the Pet Adoption Platform.
      `,
    };

    const response = await emailApi.post("/send", emailData);
    return response.data;
  } catch (error) {
    console.error("Error sending adoption request email:", error);
    throw error;
  }
};

export default { sendEmail, sendAdoptionRequestEmail };
