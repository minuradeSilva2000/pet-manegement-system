import React, { useEffect, useState } from "react";
import axios from "axios";
import CancelAppointmentButton from "./CancelAppointmentButton";

function AppointmentDetails({ appointment, onClose }) {
  const [petName, setPetName] = useState(null);
  const [isCanceled, setIsCanceled] = useState(false);
  const [status, setStatus] = useState(appointment.status);
  const [loadingPet, setLoadingPet] = useState(true);

  useEffect(() => {
    const fetchPetName = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/appointments/petname/${appointment._id}`
        );
        setPetName(response.data.petName);
      } catch (error) {
        console.error("Error fetching pet name", error);
      } finally {
        setLoadingPet(false);
      }
    };

    if (appointment && appointment.petId) {
      fetchPetName();
    }
  }, [appointment]);

  const formattedDate = appointment.date ? new Date(appointment.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  }) : "N/A";

  const handleCancelSuccess = () => {
    setIsCanceled(true);
    setStatus("Cancelled");
  };

  const getStatusColor = () => {
    switch(status) {
      case 'Booked': return 'bg-[var(--puppy-brown)] text-[var(--dark-brown)]';
      case 'Confirmed': return 'bg-[var(--light-purple)] text-[var(--dark-brown)]';
      case 'Completed': return 'bg-[var(--main-color)] text-white';
      case 'Cancelled': return 'bg-gray-300 text-gray-700';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-[rgba(61,30,36,0.8)] z-50 p-4">
      <div className="bg-[var(--background-light)] rounded-lg shadow-xl max-w-2xl w-full border border-[var(--grey)]">
        {/* Header */}
        <div className="bg-[var(--light-brown)] p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[var(--dark-brown)]">
              Appointment Details
            </h2>
            <button 
              onClick={onClose}
              className="text-[var(--dark-brown)] hover:text-[var(--main-color)] text-2xl"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {loadingPet ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--main-color)]"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--grey)]">PET NAME</h3>
                  <p className="text-lg font-medium text-[var(--dark-brown)]">
                    {petName || "Not specified"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--grey)]">SERVICE</h3>
                  <p className="text-lg font-medium text-[var(--dark-brown)]">
                    {appointment.serviceType || "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--grey)]">DATE & TIME</h3>
                  <p className="text-lg font-medium text-[var(--dark-brown)]">
                    {formattedDate} at {appointment.time || "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[var(--grey)]">STATUS</h3>
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${getStatusColor()}`}>
                    {status}
                  </span>
                </div>
              </div>

              {/* Right Column - Service Details */}
              <div className="space-y-4">
                {appointment.serviceType === 'Grooming' && appointment.details?.groomingType && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--grey)]">GROOMING TYPE</h3>
                    <p className="text-lg text-[var(--dark-brown)]">
                      {appointment.details.groomingType}
                    </p>
                  </div>
                )}

                {appointment.serviceType === 'Training' && appointment.details?.trainingType && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--grey)]">TRAINING TYPE</h3>
                    <p className="text-lg text-[var(--dark-brown)]">
                      {appointment.details.trainingType}
                    </p>
                  </div>
                )}

                {appointment.serviceType === 'Medical' && appointment.details?.medicalType && (
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--grey)]">MEDICAL TYPE</h3>
                    <p className="text-lg text-[var(--dark-brown)]">
                      {appointment.details.medicalType}
                    </p>
                  </div>
                )}

                {appointment.serviceType === 'Boarding' && appointment.details?.boardingdetails && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--grey)]">BOARDING PERIOD</h3>
                      <p className="text-lg text-[var(--dark-brown)]">
                        {new Date(appointment.details.boardingdetails.startdate).toLocaleDateString()} to {' '}
                        {new Date(appointment.details.boardingdetails.enddate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--grey)]">SPECIAL INSTRUCTIONS</h3>
                      <p className="text-lg text-[var(--dark-brown)]">
                        {appointment.details.boardingdetails.specialInstructions || "None"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex justify-end space-x-4">

          {appointment.serviceType === 'Boarding' && appointment.details?.boardingdetails && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--grey)]">BOARDING PERIOD</h3>
                      <p className="text-lg text-[var(--dark-brown)]">
                        {new Date(appointment.details.boardingdetails.startdate).toLocaleDateString()} to {' '}
                        {new Date(appointment.details.boardingdetails.enddate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--grey)]">SPECIAL INSTRUCTIONS</h3>
                      <p className="text-lg text-[var(--dark-brown)]">
                        {appointment.details.boardingdetails.specialInstructions || "None"}
                      </p>
                    </div>
                  </>
                )}
                
                {(status === 'Booked') && (
                    <CancelAppointmentButton
                      appointmentId={appointment._id}
                      date={appointment.date}
                      time={appointment.time}
                      serviceType={appointment.serviceType}
                      status={status}
                      onCancelSuccess={handleCancelSuccess}
                      disabled={isCanceled}
                      className="px-6 py-2 bg-[var(--dark-brown)] hover:bg-[var(--puppy-brown)] text-white rounded-lg transition-colors disabled:opacity-50"
                    />
                 )}

          
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentDetails;
