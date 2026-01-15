
import mongoose from 'mongoose';

import Appointment from "../models/appointment.js";
import Pet from "../models/pet.model.js";
import User from "../models/user.model.js";
import BookedSlot from "../models/timeslot.model.js";
import nodemailer from 'nodemailer';


export const addAppointment = async (req, res) => {
  try {
    const { petId, userId, serviceType, details, date, time, status, amount } = req.body;

    const newAppointment = new Appointment({
      petId,
      userId,
      serviceType,
      details,
      date,
      time,
      status: status || "Booked",
      amount: amount || 0
    });

    await newAppointment.save();

    // Get user's email from userId
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return res.status(400).json({ error: "User not found or email missing" });
    }

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Petopia: Appointment Confirmation',
      text: `Hi ${user.name || 'User'},\n\nYour appointment for ${serviceType} on ${date} at ${time} has been booked.\n\nThank you for choosing Petopia!`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Appointment Confirmation</h2>
          <p>Hi ${user.name || 'User'},</p>
          <p>Your appointment for <strong>${serviceType}</strong> has been successfully booked.</p>
          <p><strong>Date:</strong> ${new Date(date).toDateString()}<br/>
          <strong>Time:</strong> ${time}</p>
          <p>Thank you for choosing <strong>Petopia</strong>!</p>
        </div>
      `
    };
    

    await transporter.sendMail(mailOptions);

    res.json({ message: "Appointment Added and Email Sent" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const addNewAppointment = async (req, res) => {
    try {
        let { petId, userId, serviceType, details, date, time, status } = req.body;

        if (date) {
            date = new Date(`${date}T00:00:00Z`);
        }

        if (time) {
            time = new Date(`1970-01-01T${time}:00Z`); 
        }

        if (serviceType === "Boarding" && details?.boardingDetails) {
            details.boardingDetails.startDate = new Date(`${details.boardingDetails.startDate}T00:00:00Z`);
            details.boardingDetails.endDate = new Date(`${details.boardingDetails.endDate}T00:00:00Z`);
        }

        const newAppointment = new Appointment({
            petId,
            userId,
            serviceType,
            details,
            date,
            time,
            status: status || "Booked"
        });

        await newAppointment.save();
        res.json({ message: "Appointment Added", appointment: newAppointment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const updateAppointment = async (req, res) => {
    let id = req.params.id;
    const {petId, userId, serviceType, details, date, time, status} = req.body;

    const updateAppointment = {
        petId,
        userId,
        serviceType,
        details, 
        date,
        time,
        status
    }

    const update = await Appointment.findByIdAndUpdate(id, updateAppointment).then(() => {
        res.status(200).send({status: "Appointment updated"})
    }).catch((err) => {
        console.log(err);
        res.status(500).send({status: "Error with updating data"});
    })


};


export const getPetsByUser = async (req, res) => {
    try {
      const { userId } = req.params;


  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const pets = await Pet.find({ owner: userId });
      return res.status(200).json(pets);
    } catch (error) {
      
      res.status(500).json({ error: "Server error. Please try again later." });
    }
  };


export const getPetById = async (req, res) => {
    const { id } = req.params;

    try {
        const pet = await Pet.findById(id);
        if (!pet) {
            return res.status(404).json({ message: "Pet not found" });
        }
        res.status(200).json({ petName: pet.name });  
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error", error: err });
    }
};


export const getAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate("petId", "name")  
            .populate("userId", "name");  

        res.status(200).json(appointments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const filterAppointments = async (req, res) => {
    try {
        const { status, serviceType, startDate, endDate } = req.body;

        let query = {};

        if (status) {
            query.status = status;
        }

        if (serviceType) {
            query.serviceType = serviceType;
        }

        if (serviceType === "Boarding" && startDate && endDate) {
            query["details.boardingDetails.startDate"] = { $gte: new Date(startDate) };
            query["details.boardingDetails.endDate"] = { $lte: new Date(endDate) };
        }

        const appointments = await Appointment.find(query)
            .populate("petId", "name")
            .populate("userId", "name");

        res.status(200).json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    // Update appointment status
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId'); // to get user info

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const user = updatedAppointment.userId;

    if (user && user.email) {
      // Setup Nodemailer
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Appointment Status Update',
        text: `Hi ${user.name || 'User'},\n\nThe status of your appointment has been updated to: ${status}.\n\nThank you,\nPetopia`
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({ status: "Appointment updated and email sent" });

  } catch (error) {
    console.error("Error updating appointment and sending email:", error);
    res.status(500).json({ message: "Error updating appointment", error });
  }
};

  export const getUserAppointments = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentDate = new Date();

    const appointments = await Appointment.find({ userId });

    const upcomingAppointments = appointments.filter(
      (appt) => new Date(appt.date) >= currentDate
    );

    const pastAppointments = appointments.filter(
      (appt) => new Date(appt.date) < currentDate
    );

    res.json({ upcomingAppointments, pastAppointments });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getPetNameForAppointment = async (req, res) => {
    try {
    
      const appointment = await Appointment.findById(req.params.id);
  
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }
  
      // get pet name using the petId 
      const pet = await Pet.findById(appointment.petId, 'name'); 
  
      if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
      }

      res.json({ petName: pet.name });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };


  export const cancelAppointment = async (req, res) => {
    req.body.status = 'Cancelled';  
    return await updateAppointmentStatus(req, res);  
  };


export const deleteTimeSlot = async (req, res) => {
    const { date, time, serviceType } = req.body;

    try {
        // Find and delete the time slot 
        const deletedTimeSlot = await BookedSlot.findOneAndDelete({ serviceType, date, slot: time });

        if (!deletedTimeSlot) {
            return res.status(404).json({ message: "Time slot not found" });
        }

        res.status(200).json({ message: "Time slot removed successfully" });
    } catch (error) {
        console.error("Error deleting time slot:", error);
        res.status(500).json({ message: "Error deleting time slot", error: error.message || error });
    }
};

//staff
export const getAppointmentsByServiceType = async (req, res) => {
    try {
      const { serviceType } = req.params;
      const appointments = await Appointment.find({ serviceType });
  
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Server error fetching appointments" });
    }
  };
  


//staff complete appointment
  export const completeAppointment = async (req, res) => {
    try {
      const { id } = req.params;
  
      const appointment = await Appointment.findById(id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
  
      if (appointment.status !== "Confirmed") {
        return res.status(400).json({ error: "Only confirmed appointments can be marked as completed" });
      }
  
      appointment.status = "Completed";
      await appointment.save();
  
      res.json({ message: "Appointment marked as completed", appointment });
    } catch (error) {
      res.status(500).json({ error: "Error updating appointment status" });
    }
  };


  
