import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

export const generatePaymentReceipt = async (paymentDetails) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF with specific options to prevent extra pages
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: false, // Disable buffer pages to prevent extra pages
        autoFirstPage: true
      });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Colors
      const primaryColor = '#da828f';  // Pink header color
      const secondaryColor = '#3d1e24'; // Dark brown footer color
      const bgColor = '#f8f4e6';  // Light beige background
      const textColor = '#333333'; // Dark gray text

      // Format amount to LKR
      const formatAmount = (amount) => {
        return `LKR ${Number(amount).toLocaleString('en-LK')}`;
      };

      // Add background image
      try {
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const backgroundImagePath = path.join(__dirname, '../assets/images/background.png');
        doc.image(backgroundImagePath, 0, 0, { width: doc.page.width, height: doc.page.height });
      } catch (error) {
        console.error('Error loading background image:', error);
      }

      // Header with semi-transparent overlay
      doc.rect(0, 0, doc.page.width, 100)
         .fillOpacity(0.9)
         .fill(primaryColor);
      
      doc.fontSize(24)
         .fillColor('white')
         .text('Payment Receipt', 50, 40, { align: 'center' });

      // Payment Details Box with semi-transparent overlay
      doc.rect(50, 120, doc.page.width - 100, 200)
         .fillOpacity(0.95)
         .fill(bgColor);

      // Payment Details Content
      doc.fontSize(12)
         .fillColor(textColor);

      const details = [
        ['Payment ID:', paymentDetails.paymentId],
        ['Date:', new Date().toLocaleDateString()],
        ['Customer Name:', paymentDetails.name],
        ['Email:', paymentDetails.email],
        ['Service Type:', paymentDetails.serviceType],
        ['Amount:', formatAmount(paymentDetails.amount)],
        ['Payment Method:', paymentDetails.paymentMethod],
        ['Status:', paymentDetails.status]
      ];

      let y = 140;
      details.forEach(([label, value]) => {
        doc.text(label, 70, y, { width: 150 })
           .text(value, 220, y, { width: 300 });
        y += 25;
      });

      // Enhanced Thank You Section
      const thankYouY = doc.page.height - 150;
      
      // Decorative line above thank you message
      doc.moveTo(50, thankYouY)
         .lineTo(doc.page.width - 50, thankYouY)
         .strokeColor(primaryColor)
         .stroke();

      // Thank you message with enhanced styling
      doc.fontSize(20)
         .fillColor(secondaryColor)
         .text('Thank you for your payment!', 50, thankYouY + 20, { 
           align: 'center',
           width: doc.page.width - 100
         });

      // Footer with semi-transparent overlay
      doc.rect(0, doc.page.height - 80, doc.page.width, 80)
         .fillOpacity(0.9)
         .fill(secondaryColor);

      doc.fontSize(10)
         .fillColor('white')
         .text('© 2025 Petopia. All rights reserved.', 50, doc.page.height - 50, { align: 'center' });

      // Add a border around the entire page
      doc.rect(0, 0, doc.page.width, doc.page.height)
         .stroke();

      // End the document - this will ensure only one page is created
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}; 