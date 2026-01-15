import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Reusable Summary Row Component
const SummaryRow = ({ label, value }) => (
  <p>
    <strong>{label}</strong> {value}
  </p>
);

function AppointmentSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Check if state is available
  if (!state) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>No appointment data found. Please book an appointment first.</p>
        <button
          onClick={() => navigate("/customer/ServiceType")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Book an Appointment
        </button>
      </div>
    );
  }

  // Destructure appointment details
  const {
    serviceType,
    date,
    time,
    groomingType,
    trainingType,
    medicalServiceType,
    amount,
    startDate,
    endDate,
  } = state;

  // Check for missing data
  if (
    (!date || !time || amount === undefined) &&
    serviceType !== "Boarding"
  ) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>No appointment data found. Please book an appointment first.</p>
        <button
          onClick={() => navigate("/customer/ServiceType")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Book an Appointment
        </button>
      </div>
    );
  }

  // Check for missing data in Boarding type
  if (
    serviceType === "Boarding" &&
    (!startDate || !endDate || amount === undefined)
  ) {
    return (
      <div className="p-6 text-center text-red-500">
        <p>No boarding appointment data found. Please book a boarding appointment first.</p>
        <button
          onClick={() => navigate("/customer/ServiceType")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Book a Boarding Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white shadow-md rounded mt-8 text-center">
      <h2 className="text-2xl font-bold text-green-600 mb-4">Appointment Booked Successfully!</h2>
      <p className="text-gray-700 mb-4">Here is your appointment summary:</p>

      {/* Conditional Rendering for Service Type */}
      <SummaryRow
        label={
          serviceType === "Grooming"
            ? "Grooming Type:"
            : serviceType === "Training"
            ? "Training Type:"
            : serviceType === "Medical"
            ? "Medical Type:"
            : "Service Type:"
        }
        value={
          serviceType === "Grooming"
            ? groomingType
            : serviceType === "Training"
            ? trainingType
            : serviceType === "Medical"
            ? medicalServiceType
            : ""
        }
      />

      {/* Additional fields based on serviceType */}
      {serviceType === "Boarding" ? (
        <>
          <SummaryRow label="Start Date:" value={startDate} />
          <SummaryRow label="End Date:" value={endDate} />
        </>
      ) : (
        <>
          <SummaryRow label="Date:" value={date} />
          <SummaryRow label="Time:" value={time} />
        </>
      )}

      <SummaryRow label="Amount:" value={`LKR${amount?.toFixed(2)}`} />

      <button
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-medium mt-4"
        onClick={() => navigate(`/customer/payment?amount=${amount}`)}
      >
        Pay Now (LKR{amount?.toFixed(2)})
      </button>
    </div>
  );
}

export default AppointmentSuccess;
