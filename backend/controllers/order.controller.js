import PDFDocument from 'pdfkit';
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer'; 
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,       
  port: Number(process.env.EMAIL_PORT),
  secure: false,                       
  auth: {
    user: process.env.EMAIL_USER,     
    pass: process.env.EMAIL_PASS      
  }
});

// for debugging
console.log('SMTP config:', {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  user: process.env.EMAIL_USER ? 'loaded' : 'missing',
});

// Send cancellation email
const sendOrderCancellationEmail = async (order, user) => {
  try {
    // Generate order ID (to display)
    const displayOrderId = order._id.toString().substring(order._id.toString().length - 8);
    
    // Format date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Your Petopia Order #${displayOrderId} Has Been Cancelled`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Cancellation</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <tr>
              <td style="background-color: #7b4397; background-image: linear-gradient(to right, #7b4397, #dc2430); padding: 30px 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 600;">Petopia</h1>
                <p style="color: #ffffff; margin: 5px 0 0; font-size: 16px;">We Love Your Pets As Much As You Do</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 40px 30px; background-color: #ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 0 0 20px 0;">
                      <h2 style="margin: 0 0 10px 0; font-size: 22px; color: #dc2430;">Order Cancellation Notice</h2>
                      <p style="margin: 0; font-size: 16px;">Dear ${user.name},</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 20px 0;">
                      <p style="margin: 0; font-size: 16px;">We're writing to inform you that your order <strong>#${displayOrderId}</strong> has been cancelled as requested.</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 20px 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8f8f8; border-radius: 6px; padding: 20px; border-left: 4px solid #dc2430;">
                        <tr>
                          <td>
                            <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #333;">Order Summary</h3>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td width="40%" style="padding: 5px 0; font-size: 15px; color: #666;">Order ID:</td>
                                <td style="padding: 5px 0; font-size: 15px;"><strong>#${displayOrderId}</strong></td>
                              </tr>
                              <tr>
                                <td width="40%" style="padding: 5px 0; font-size: 15px; color: #666;">Order Date:</td>
                                <td style="padding: 5px 0; font-size: 15px;">${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'}) : currentDate}</td>
                              </tr>
                              <tr>
                                <td width="40%" style="padding: 5px 0; font-size: 15px; color: #666;">Total Amount:</td>
                                <td style="padding: 5px 0; font-size: 15px;"><strong>LKR ${order.totalAmount.toFixed(2)}</strong></td>
                              </tr>
                              <tr>
                                <td width="40%" style="padding: 5px 0; font-size: 15px; color: #666;">Payment Method:</td>
                                <td style="padding: 5px 0; font-size: 15px;">${order.paymentMethod}</td>
                              </tr>
                              <tr>
                                <td width="40%" style="padding: 5px 0; font-size: 15px; color: #666;">Cancellation Date:</td>
                                <td style="padding: 5px 0; font-size: 15px;">${currentDate}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 20px 0;">
                      <p style="margin: 0 0 15px 0; font-size: 16px;">If you have any questions or concerns regarding this cancellation, please don't hesitate to reach out to our customer service team:</p>
                      <div style="background-color: #f8f8f8; border-radius: 6px; padding: 12px; text-align: center; margin-bottom: 15px;">
                        <a href="mailto:support@petopia.com" style="color: #7b4397; text-decoration: none; font-weight: bold;">support@petopia.com</a> | <a href="tel:+94123456789" style="color: #7b4397; text-decoration: none; font-weight: bold;">+94 123 456 789</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 0 0 0; border-top: 1px solid #f0f0f0;">
                      <p style="margin: 0 0 5px 0; font-size: 16px;">Thank you for your understanding.</p>
                      <p style="margin: 0; font-size: 16px;">Best regards,</p>
                      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #7b4397;">The Petopia Team</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            
            <tr>
              <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">© ${new Date().getFullYear()} Petopia. All rights reserved.</p>
                <p style="margin: 0; font-size: 14px; color: #666;">
                  <a href="https://petopia.com/privacy" style="color: #7b4397; text-decoration: underline;">Privacy Policy</a> | 
                  <a href="https://petopia.com/terms" style="color: #7b4397; text-decoration: underline;">Terms of Service</a>
                </p>
                <p style="margin: 15px 0 0; font-size: 13px; color: #999; font-style: italic;">This email was sent regarding an order from Petopia. Please do not reply to this email.</p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Cancellation email sent to ${user.email} for Order #${displayOrderId}`);
    return true;
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    return false;
  }
};
// Reference: https://github.com/nodemailer/nodemailer/tree/12b792fb91045660ad1a4308e4dbcf4ec7d3c66c
//            https://nodemailer.com/usage/using-gmail/

// Placing an order
export const placeOrder = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "User not logged in" });
    }

    const cart = await Cart.findOne({ user: req.session.user._id }).populate("items.product", "name price quantity");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    if (!req.body.paymentMethod || !req.body.deliveryDetails) {
      return res.status(400).json({ success: false, message: "Missing payment method or delivery details" });
    }

    let totalAmount = 0;
    for (let item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      totalAmount += parseFloat((item.quantity * product.price).toFixed(2));
      product.quantity -= item.quantity; // Deduct quantity
      await product.save();
    }
    totalAmount = parseFloat(totalAmount.toFixed(2));

    // Set paymentStatus
    const paymentStatus = req.body.paymentMethod === 'Card' ? 'Paid' : 'Pending';

    const newOrder = new Order({
      user: req.session.user._id,
      products: cart.items.map((item) => ({ product: item.product._id, quantity: item.quantity })),
      totalAmount,
      paymentMethod: req.body.paymentMethod,
      paymentStatus, 
      deliveryDetails: req.body.deliveryDetails,
    });

    await newOrder.save();
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, message: "Order placed successfully!", data: newOrder });
  } catch (error) {
    console.error("Error placing order:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
      
    if (!deletedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
      
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Failed to delete order' });
  }
};

// Get order details
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate("products.product").populate("user", "name email");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json(order);
  } catch (error) {
    console.error("Error fetching order details:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const getEnhancedOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find the basic order
    const order = await Order.findById(orderId).populate("user", "name email");
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    const enhancedOrder = order.toObject();
    
    // Get all product IDs from the order
    const productIds = order.products.map(item => item.product);
    
    // Fetch all the products
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Create a map for quick lookup
    const productMap = {};
    products.forEach(product => {
      productMap[product._id.toString()] = product;
    });
  
    enhancedOrder.products = order.products.map(item => {
      const productId = item.product.toString();
      const product = productMap[productId] || null;
      
      return {
        product: product ? {
          _id: productId,
          name: product.name,
          price: product.price,
        } : productId,
        quantity: item.quantity,
        _id: item._id
      };
    });
    
    res.json(enhancedOrder);
  } catch (error) {
    console.error("Error fetching enhanced order details:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Cancel order
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("products.product");
      
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    
    if (order.status !== "Pending") {
      return res.status(400).json({ success: false, message: "Order cannot be canceled at this stage" });
    }
    
    // Restock products
    for (const item of order.products) {
      const product = item.product;
      if (product) {
        product.quantity += item.quantity;
        await product.save();
        console.log(`Restocked ${item.quantity} units of product ${product._id}`);
      }
    }
    
    // Update status
    order.status = "Cancelled";
    await order.save();
    
    // Send cancellation email
    if (order.user && order.user.email) {
      await sendOrderCancellationEmail(order, order.user);
    }
    
    res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Error cancelling order:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get all user orders
export const getUserOrders = async (req, res) => {
  try {
    // is authenticated ?
    if (!req.user || !req.user._id) {
      const userId = req.user?._id ? req.user._id.toString() : 'not available';
      console.log(`Debug: User ID in session - ${userId}`); // for debugging
      return res.status(401).json({ 
        error: `Unauthorized: User not found. User ID: ${userId}` 
      });
    }

    // Fetch user orders
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("products.product", "name price imageUrl");

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    console.log("Updating Payment Status - Order ID:", orderId); // Debug
    console.log("New Payment Status:", paymentStatus); // Debug

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.paymentStatus = paymentStatus;
    await order.save();

    console.log("Updated Order:", order); // Debug
    res.json({ message: "Payment status updated", order });
  } catch (error) {
    console.error("Error updating payment status:", error.message); // Debug
    res.status(500).json({ error: "Server error" });
  }
};

// Order status progression
const ORDER_STATUS_FLOW = {
  "Pending": ["Processing", "Cancelled"],
  "Processing": ["Shipped", "Cancelled"],
  "Shipped": ["Delivered", "Cancelled"],
  "Delivered": [],
  "Cancelled": []
};

// Validate status transition
const isValidStatusTransition = (currentStatus, newStatus) => {
  if (!ORDER_STATUS_FLOW[currentStatus]) {
    return false;
  }
  
  return ORDER_STATUS_FLOW[currentStatus].includes(newStatus);
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    console.log("Updating Order Status - Order ID:", orderId);
    console.log("New Status:", status);

    // Validate 
    if (!ORDER_STATUS_FLOW.hasOwnProperty(status)) {
      return res.status(400).json({ 
        error: "Invalid order status. Valid statuses are: " + 
          Object.keys(ORDER_STATUS_FLOW).join(", ") 
      });
    }

    const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("products.product");
      
    if (!order) return res.status(404).json({ error: "Order not found" });

    const previousStatus = order.status;
    
    // status transition valid?
    if (!isValidStatusTransition(previousStatus, status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from '${previousStatus}' to '${status}'.`,
        allowedTransitions: ORDER_STATUS_FLOW[previousStatus]
      });
    }

    // for cancelled orders
    if (status === "Cancelled" && previousStatus !== "Cancelled") {
      // Restock products
      for (const item of order.products) {
        const product = item.product;
        if (product) {
          product.quantity += item.quantity;
          await product.save();
          console.log(`Restocked ${item.quantity} units of product ${product._id}`);
        }
      }
    }

    order.status = status;
    await order.save();
    
    // cancellation email 
    if (status === "Cancelled" && previousStatus !== "Cancelled") {
      if (order.user && order.user.email) {
        await sendOrderCancellationEmail(order, order.user);
      }
    }

    console.log("Updated Order:", order);
    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log("Updating Order:", id);
    console.log("Update Data:", updateData);
    
    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }
    
    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("products.product");
      
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    const previousStatus = order.status;
    
    // Validate status transition
    if (updateData.status) {
      // status valid?
      if (!ORDER_STATUS_FLOW.hasOwnProperty(updateData.status)) {
        return res.status(400).json({ 
          error: "Invalid order status. Valid statuses are: " + 
            Object.keys(ORDER_STATUS_FLOW).join(", ") 
        });
      }
      
      // status transition valid?
      if (!isValidStatusTransition(previousStatus, updateData.status)) {
        return res.status(400).json({ 
          error: `Invalid status transition from '${previousStatus}' to '${updateData.status}'.`,
          allowedTransitions: ORDER_STATUS_FLOW[previousStatus]
        });
      }
      
      // for cancelled orders
      if (updateData.status === "Cancelled" && previousStatus !== "Cancelled") {
        // Restock products
        for (const item of order.products) {
          const product = item.product;
          if (product) {
            product.quantity += item.quantity;
            await product.save();
            console.log(`Restocked ${item.quantity} units of product ${product._id}`);
          }
        }
      }
      
      order.status = updateData.status;
      console.log("Updated order status to:", updateData.status);
    }
    
    if (updateData.paymentStatus) {
      order.paymentStatus = updateData.paymentStatus;
      console.log("Updated payment status to:", updateData.paymentStatus);
    }
    
    await order.save();
    
    // Handle cancellation email
    if (updateData.status === "Cancelled" && previousStatus !== "Cancelled") {
      if (order.user && order.user.email) {
        const emailSent = await sendOrderCancellationEmail(order, order.user);
        console.log("Cancellation email status:", emailSent ? "Sent" : "Failed");
      } else {
        console.log("Could not send email: User or email not found");
      }
    }
    
    res.json({
      message: "Order updated successfully",
      order
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ 
      error: "Server error", 
      details: error.message,
      stack: error.stack 
    });
  }
};

// Download invoice 
// Reference: PDFKit documentation - https://pdfkit.org/
export async function downloadInvoice(req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('products.product', 'name price')
      .lean();
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    // Prepare PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${orderId}.pdf`
    );
    doc.pipe(res);
    
    // Theme colors
    const colors = {
      primary: '#F5C3C2',  
      accent: '#D3A4A4',  
      text: '#333333',  
      border: '#CCCCCC'
    };
    
    // Header
    doc.rect(0, 0, doc.page.width, 170).fill(colors.primary);
    
    // Logo placement
    const logoPath = path.join(__dirname, '../assets/logo1.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 120 });
    }
    
    // Invoice title
    doc.fillColor(colors.text).font('Courier-Bold').fontSize(28).text('INVOICE', 350, 85);
    
    // Order and Customer Information
    const infoY = 200;
    
    // Invoice number and date
    doc.font('Courier').fontSize(12).fillColor(colors.text).text(`Invoice #: ${orderId}`, 50, infoY);
    
    doc.fontSize(12).text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 420, infoY);
    
    // Bill to section
    doc.font('Courier-Bold').text('Bill To:', 50, infoY + 30).font('Courier')
      .text(order.user?.name || 'N/A', 50, infoY + 50)
      .text(order.user?.email || 'N/A', 50, infoY + 70);
    
    // table header
    const tableTop = infoY + 110;
    const cols = { item: 50, qty: 300, unit: 370, line: 460 };
    doc.font('Courier-Bold').fontSize(12)
      .text('Item', cols.item, tableTop)
      .text('Qty', cols.qty, tableTop)
      .text('Unit Price', cols.unit, tableTop)
      .text('Line Total', cols.line, tableTop)
      .moveDown(0.5);

    // table rows
    let y = tableTop + 20;
    doc.font('Courier').fontSize(10);
    order.products.forEach(({ product, quantity }) => {
      const name      = product?.name || 'Unknown';
      const unitPrice = product?.price?.toFixed(2) || '0.00';
      const lineTotal = (product?.price * quantity).toFixed(2);

      doc
        .text(name, cols.item, y)
        .text(quantity, cols.qty,  y)
        .text(`LKR ${unitPrice}`, cols.unit, y)
        .text(`LKR ${lineTotal}`, cols.line, y);

      y += 20;
     
      doc.strokeColor(colors.border).lineWidth(0.3).moveTo(cols.item, y - 5).lineTo(cols.line + 60, y - 5).stroke();
    });
    
    // total box
    y += 20;
    
    doc.font('Courier-Bold').fontSize(12).text('Grand', 370, y).text(`Total: LKR`, 370, y + 20).fontSize(14)
      .text(`${order.totalAmount.toFixed(2)}`, 400, y + 20, {
        align: 'right'
      });
    
    // Thank you msg
    doc.font('Courier-Oblique').fontSize(14).fillColor(colors.accent)
      .text('Thank you for shopping with Petopia Pet Store!', 20, y + 80, { align: 'right' })
    
    doc.end();
  } catch (err) {
    console.error('Error generating invoice:', err);
    res.status(500).json({ message: 'Could not generate invoice' });
  }
}

// is mongoose connected ? for debugging
// Reference: https://mongoosejs.com/docs/connections.html#connection-states
const checkMongooseConnection = () => {
  if (mongoose.connection.readyState !== 1) {
    console.warn('Warning: Mongoose connection is not ready. Current state:', mongoose.connection.readyState);
  }
};

// Direct buy 
export const directBuy = async (req, res) => {
  try {
    checkMongooseConnection();
    
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: "User not logged in" });
    }

    const { productId, quantity } = req.body;
    
    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Product ID and quantity are required" 
      });
    }

    // Find the product
    const Product = mongoose.model('Product'); 
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    // stock enough?
    if (product.quantity < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Only ${product.quantity} available.` 
      });
    }

    // total amount
    const totalAmount = parseFloat((quantity * product.price).toFixed(2));
    
    // Create temp cart data
    const directBuyData = {
      items: [{
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl
        },
        quantity: parseInt(quantity)
      }],
      totalAmount: totalAmount
    };

    // session?
    if (!req.session) {
      console.error("Session object is undefined");
      return res.status(500).json({ success: false, message: "Session not initialized" });
    }
    
    // Store in session
    req.session.directBuyData = directBuyData;
    
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
        return res.status(500).json({ success: false, message: "Error saving to session" });
      }
      
      res.status(200).json({ 
        success: true, 
        message: "Product ready for checkout", 
        directBuyData 
      });
    });
  } catch (error) {
    console.error("Error in direct buy:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

// Get direct buy data from session
export const getDirectBuyData = async (req, res) => {
  try {
    checkMongooseConnection();
    
    // for debugging
    console.log("Session object in getDirectBuyData:", req.session ? "exists" : "undefined");
    
    if (!req.session) {
      return res.status(500).json({ success: false, message: "Session not initialized" });
    }
    
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: "User not logged in" });
    }
    
    console.log("Direct buy data in session:", req.session.directBuyData ? "exists" : "undefined");
    
    if (!req.session.directBuyData) {
      return res.status(404).json({ success: false, message: "No direct buy data found" });
    }

    res.status(200).json({ 
      success: true, 
      directBuyData: req.session.directBuyData 
    });
  } catch (error) {
    console.error("Error fetching direct buy data:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

// Process direct buy order
export const processDirectBuyOrder = async (req, res) => {
  try {
    checkMongooseConnection();
    
    if (!req.session || !req.session.user) {
      return res.status(401).json({ success: false, message: "User not logged in" });
    }

    if (!req.session.directBuyData) {
      return res.status(400).json({ success: false, message: "No direct buy data found" });
    }

    if (!req.body.paymentMethod || !req.body.deliveryDetails) {
      return res.status(400).json({ success: false, message: "Missing payment method or delivery details" });
    }

    const { directBuyData } = req.session;
    const Product = mongoose.model('Product');
    const product = await Product.findById(directBuyData.items[0].product._id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    
    if (product.quantity < directBuyData.items[0].quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock for ${product.name}` 
      });
    }
    
    // Set paymentStatus
    const paymentMethod = req.body.paymentMethod;
    const paymentStatus = paymentMethod === 'Card' ? 'Pending' : 'Pending';

    // Create new order
    const newOrder = new Order({
      user: req.session.user._id,
      products: [{
        product: product._id,
        quantity: directBuyData.items[0].quantity
      }],
      totalAmount: directBuyData.totalAmount,
      paymentMethod: paymentMethod,
      paymentStatus: paymentStatus,
      status: 'Pending',
      deliveryDetails: req.body.deliveryDetails,
    });

    await newOrder.save();
    
    // Update product quantity
    product.quantity -= directBuyData.items[0].quantity;
    await product.save();
    
    // Only clear direct buy data if not using card payment
    // For card payment, keep it until payment is confirmed
    if (paymentMethod !== 'Card') {
      delete req.session.directBuyData;
      
      // Save session changes
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session after clearing directBuyData:", err); //debug
        }
      });
    }

    res.status(201).json({ 
      success: true, 
      message: "Order placed successfully!", 
      data: newOrder 
    });
  } catch (error) {
    console.error("Error processing direct buy order:", error.message, error.stack);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};