import mongoose from 'mongoose';

const financeSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    default: () => `FIN-${Date.now()}`
  },
  type: {
    type: String,
    enum: ['Income', 'Expense', 'Sale'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Other']
  },
  reference: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Finance = mongoose.model('Finance', financeSchema);

export default Finance;