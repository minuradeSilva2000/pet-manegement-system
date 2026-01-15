import Payment from "../models/Payment.js";
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

const createPayment = async (paymentData) => {
  try {
    // Validate required fields
    if (!paymentData.name || !paymentData.email || !paymentData.amount || !paymentData.serviceType) {
      throw new Error("Missing required payment information");
    }

    // Validate amount
    if (isNaN(paymentData.amount) || paymentData.amount <= 0) {
      throw new Error("Invalid payment amount");
    }

    // Create payment record with Completed status
    const payment = new Payment({
      ...paymentData,
      status: "Completed",
      paymentId: `p${nanoid()}`,  // e.g. "p4F7A1ZQ8"
      createdAt: new Date()
    });

    // Save payment
    const savedPayment = await payment.save();
    
    // Return the saved payment
    return savedPayment;
  } catch (error) {
    console.error("Error in createPayment:", error);
    throw error;
  }
};

const getAllPayments = async () => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    return payments;
  } catch (error) {
    console.error("Error in getAllPayments:", error);
    throw error;
  }
};

const getPaymentById = async (id) => {
  try {
    const payment = await Payment.findById(id);
    return payment;
  } catch (error) {
    console.error("Error in getPaymentById:", error);
    throw error;
  }
};

const updatePayment = async (id, updateData) => {
  try {
    // Ensure status is always Completed when updating
    if (updateData.status) {
      updateData.status = "Completed";
    }
    
    const payment = await Payment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    return payment;
  } catch (error) {
    console.error("Error in updatePayment:", error);
    throw error;
  }
};

const deletePayment = async (id) => {
  try {
    const payment = await Payment.findByIdAndDelete(id);
    return payment;
  } catch (error) {
    console.error("Error in deletePayment:", error);
    throw error;
  }
};

export default {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment
};
