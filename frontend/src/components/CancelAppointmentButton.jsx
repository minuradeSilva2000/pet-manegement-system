import React from "react";
import axios from "axios";

function CancelAppointmentButton({ appointmentId, date, time, serviceType, status, onCancelSuccess, disabled }) {
  const handleCancel = async () => {
    
    if(status === "Cancelled"){
      alert("This appointment has already been cancelled.")
      return;
    }
    const isConfirmed = window.confirm("Are you sure you want to cancel this appointment?");

    if (isConfirmed) {
        
      if(serviceType === "Boarding") {
          const cancelResponse = await axios.put(`http://localhost:5000/appointments/cancel/${appointmentId}`);

          if (cancelResponse.status === 200) {
            alert("Appointment cancelled successfully.");
            onCancelSuccess();
          }
      }

      try {
        //  Update appointment status to "Cancelled"
        const cancelResponse = await axios.put(`http://localhost:5000/appointments/cancel/${appointmentId}`);

        if (cancelResponse.status === 200) {
          //  Delete the associated time slot
          const deleteResponse = await axios.post(`http://localhost:5000/appointments/timeslots/delete`, {
            date,
            time,
            serviceType,
          });

          if (deleteResponse.status === 200) {
            alert("Appointment canceled and time slot removed successfully!");
            onCancelSuccess(); 
          } else {
            alert("Appointment canceled, but time slot removal failed.");
          }
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  return (
    <button
      onClick={handleCancel}
      className="mt-4 px-6 py-2 bg-red-500 text-white rounded-md text-lg"
      disabled={disabled}
    >
      Cancel Appointment
    </button>
  );
}

export default CancelAppointmentButton;
