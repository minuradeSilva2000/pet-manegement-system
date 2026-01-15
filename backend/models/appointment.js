import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  petId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Pet",
    required: true
 },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
 },
  serviceType: { 
    type: String, 
    enum: ["Grooming", "Training", "Medical", "Boarding"], 
    required: true 
 },
  details: {
    groomingType: { 
        type: String 
    }, 
    trainingType: { 
        type: String 
    }, 
    medicalType: { 
        type: String 
    }, 
    boardingDetails: {             
      startDate: { 
        type: Date 
      },
      endDate: { 
        type: Date 
      }
    }
  },
  date: { 
    type: Date 
  },  
  time: { 
    type: String 
  }, 
  status: { 
    type: String, 
    enum: ["Booked", "Confirmed", "Completed", "Cancelled"], 
    default: "Booked" 
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

export default Appointment;
