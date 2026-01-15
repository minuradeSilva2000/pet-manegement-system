import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
    slot: { 
      type: String, 
      required: true 
    }, 
    serviceType: { 
        type: String,
        enum: ["Grooming", "Training", "Medical", "Boarding"], 
        required: true 
    }, 
    date: { 
        type: Date,
        required: true 
    }
});

const BookedSlot = mongoose.model('BookedSlot', timeSlotSchema);

export default BookedSlot;