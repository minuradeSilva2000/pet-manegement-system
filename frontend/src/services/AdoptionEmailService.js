import { sendEmail } from "./emailService";

export const sendAdoptionStatusEmail = (adoption) => {
  let subject, text, html;

  switch (adoption.status) {
    case "Approved":
      subject = "🎉 Your Adoption Application Has Been Approved!";
      text = `Dear ${adoption.name},\n\nWe're thrilled to inform you that your adoption application for ${adoption.pet.name} has been approved!\n\nNext Steps:\n1. Please visit our shelter within 7 days to complete the adoption process\n2. Bring a valid ID and proof of address\n3. Prepare your home for ${adoption.pet.name}'s arrival\n\nFor any questions, contact us at adoptions@petadoption.com or call (123) 456-7890.\n\nThank you for choosing to adopt!`;

      html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4CAF50;">Adoption Approved!</h1>
            <p>Dear ${adoption.name},</p>
            <p>We're thrilled to inform you that your adoption application for <strong>${adoption.pet.name}</strong> has been approved!</p>
            
            <h3 style="color: #4CAF50;">Next Steps:</h3>
            <ol>
              <li>Please visit our shelter within 7 days to complete the adoption process</li>
              <li>Bring a valid ID and proof of address</li>
              <li>Prepare your home for ${adoption.pet.name}'s arrival</li>
            </ol>
            
            <p>For any questions, contact us at <a href="mailto:adoptions@petadoption.com">adoptions@petadoption.com</a> or call (123) 456-7890.</p>
            
            <p style="margin-top: 30px;">Thank you for choosing to adopt!</p>
            <p><strong>The Pet Adoption Team</strong></p>
            <img src="https://example.com/logo.png" alt="Pet Adoption Logo" style="width: 150px; margin-top: 20px;">
          </div>
        `;
      break;

    case "Rejected":
      subject = "Regarding Your Adoption Application";
      text = `Dear ${adoption.name},\n\nAfter careful consideration, we regret to inform you that your adoption application for ${adoption.pet.name} has not been approved at this time.\n\nReason: While we appreciate your interest in adoption, we've determined that the current situation may not be the best match for ${adoption.pet.name}'s needs.\n\nWe encourage you to:\n1. Consider other pets that might be a better fit\n2. Review our adoption requirements\n3. Apply again in the future\n\nThank you for your understanding.\n\nSincerely,\nThe Pet Adoption Team`;

      html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #f44336;">Adoption Application Update</h1>
            <p>Dear ${adoption.name},</p>
            <p>After careful consideration, we regret to inform you that your adoption application for <strong>${adoption.pet.name}</strong> has not been approved at this time.</p>
            
            <h3 style="color: #f44336;">Reason:</h3>
            <p>While we appreciate your interest in adoption, we've determined that the current situation may not be the best match for ${adoption.pet.name}'s needs.</p>
            
            <h3>We encourage you to:</h3>
            <ul>
              <li>Consider other pets that might be a better fit</li>
              <li>Review our adoption requirements</li>
              <li>Apply again in the future</li>
            </ul>
            
            <p style="margin-top: 30px;">Thank you for your understanding.</p>
            <p><strong>Sincerely,</strong></p>
            <p><strong>The Pet Adoption Team</strong></p>
          </div>
        `;
      break;

    case "Completed":
      subject = "Adoption Process Completed!";
      text = `Dear ${adoption.name},\n\nCongratulations! The adoption process for ${adoption.pet.name} is now complete.\n\n${adoption.pet.name} is officially part of your family!\n\nRemember:\n1. Schedule a vet visit within 2 weeks\n2. Review the care instructions provided\n3. Join our adopter support group\n\nFor any questions or concerns, don't hesitate to contact us at support@petadoption.com\n\nWishing you and ${adoption.pet.name} many happy years together!`;

      html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
            <h1 style="color: #2196F3;">Congratulations!</h1>
            <p style="font-size: 18px;">The adoption process for <strong>${adoption.pet.name}</strong> is now complete.</p>
            <p style="font-size: 24px; color: #2196F3;">${adoption.pet.name} is officially part of your family!</p>
            
            <div style="background-color: #E3F2FD; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Remember:</h3>
              <ul style="text-align: left; padding-left: 20px;">
                <li>Schedule a vet visit within 2 weeks</li>
                <li>Review the care instructions provided</li>
                <li>Join our adopter support group</li>
              </ul>
            </div>
            
            <p>For any questions or concerns, don't hesitate to contact us at <a href="mailto:support@petadoption.com">support@petadoption.com</a></p>
            <p style="margin-top: 30px; font-size: 18px;">Wishing you and ${adoption.pet.name} many happy years together!</p>
            <img src="https://images.unsplash.com/photo-1561438774-1790fe271b8f?q=80&w=2013&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Happy Pet" style="width: 200px; margin: 20px auto;">
          </div>
        `;
      break;

    default:
      return;
  }

  sendEmail({
    to: adoption.email,
    subject,
    text,
    html,
  });
};
