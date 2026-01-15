import React from "react";
import axios from "axios";

function AppointmentActions({ appointmentId, currentStatus, date, time, serviceType, onStatusUpdate }) {
  // Function to update appointment status
  const handleStatusChange = (newStatus) => {
    axios
      .put(`http://localhost:5000/appointments/${appointmentId}`, { status: newStatus })
      .then(() => {
        onStatusUpdate(appointmentId, newStatus);
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };


  const handleCancel = async () => {

    const isConfirmed = window.confirm("Are you sure you want to cancel this appointment?");

    if (isConfirmed) {
      if (serviceType === "Boarding") {
        const cancelResponse = await axios.put(`http://localhost:5000/appointments/cancel/${appointmentId}`);

        if (cancelResponse.status === 200) {
          alert("Appointment cancelled successfully.");
          onStatusUpdate(appointmentId, "Cancelled");
        }
      }

      try {
        //  Update appointment status to "Cancelled"
        const cancelResponse = await axios.put(`http://localhost:5000/appointments/cancel/${appointmentId}`);

        if (cancelResponse.status === 200) {
          //Delete the associated time slot
          const deleteResponse = await axios.post(`http://localhost:5000/appointments/timeslots/delete`, {
            date,
            time,
            serviceType,
          });

          if (deleteResponse.status === 200) {
            alert("Appointment canceled and time slot removed successfully!");
            onStatusUpdate(appointmentId, "Cancelled");
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
    <div className="flex space-x-2">
  {currentStatus !== "Completed" && currentStatus !== "Confirmed" && currentStatus !== "Cancelled" && (
    <button
      onClick={() => handleStatusChange("Confirmed")}
      className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded shadow-sm transition-all duration-200 hover:bg-blue-300 focus:outline-none focus:ring-1 focus:ring-[#f8cd9a]"
    >
      Confirm
    </button>
  )}
  {currentStatus !== "Completed" && currentStatus !== "Cancelled" && (
    <button
      onClick={() => handleCancel()}
      className="px-2 py-1 text-xs font-medium text-white bg-red-500 rounded shadow-sm transition-all duration-200 hover:bg-red-300 focus:outline-none focus:ring-1 focus:ring-[#f8cd9a]"
    >
      Cancel
    </button>
  )}
</div>
  );
}

export default AppointmentActions;

