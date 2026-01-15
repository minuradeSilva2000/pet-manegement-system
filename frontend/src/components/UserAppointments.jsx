import React, { useEffect, useState } from "react";
import axios from "axios";
import AppointmentDetails from "./AppointmentDetails";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function UserAppointments() {
  const [appointments, setAppointments] = useState({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const { session } = useOutletContext();
  const navigate = useNavigate();


  useEffect(() => {
    if (!session?._id) return;
    const userId = session._id;

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/appointments/user/${userId}`);
        setAppointments({
          upcoming: response.data.upcomingAppointments,
          past: response.data.pastAppointments,
        });
      } catch (error) {
        console.error("Error fetching appointments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [session?._id]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-[var(--background-light)]">
      <div className="animate-pulse text-[var(--dark-brown)]">Loading appointments...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background-light)] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--dark-brown)] mb-2">My Appointments</h1>
          <div className="w-20 h-1 bg-[var(--main-color)] mx-auto"></div>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming Appointments Card */}
          <div className="bg-[var(--white)] rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[var(--light-brown)] p-4">
              <h2 className="text-xl font-semibold text-[var(--dark-brown)]">
                Upcoming Appointments
                <span className="ml-2 bg-[var(--dark-brown)] text-[var(--white)] px-2 py-1 rounded-full text-sm">
                  {appointments.upcoming.length}
                </span>
              </h2>
            </div>

            <div className="p-4">
              {appointments.upcoming.length > 0 ? (
                <ul className="space-y-3">
                  {appointments.upcoming.map((appointment) => (
                    <li
                      key={appointment.appointmentId}
                      className="p-4 bg-[var(--background-light)] rounded-lg border border-[var(--grey)] hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-[var(--dark-brown)]">
                            {appointment.serviceType}
                          </h3>
                          <p className="text-sm text-[var(--dark-brown)] mt-1">
                            {new Date(appointment.date).toLocaleDateString()} • {appointment.time}
                          </p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold 
                            ${appointment.status === "Booked" ? "bg-[var(--puppy-brown)] text-[var(--dark-brown)]" :
                              appointment.status === "Confirmed" ? "bg-[var(--light-purple)] text-[var(--dark-brown)]" :
                              appointment.status === "Completed" ? "bg-[var(--main-color)] text-white" :
                              "bg-gray-200 text-gray-800"}`}>
                            {appointment.status}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 items-end">
                          <button
                            onClick={() => setSelectedAppointment(appointment)}
                            className="px-3 py-1 bg-[var(--dark-brown)] text-[var(--white)] rounded-md hover:bg-[var(--puppy-brown)] transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[var(--grey)]">No upcoming appointments scheduled</p>
                </div>
              )}
            </div>
          </div>

          {/* Past Appointments Card */}
          <div className="bg-[var(--white)] rounded-lg shadow-lg overflow-hidden">
            <div className="bg-[var(--light-purple)] p-4">
              <h2 className="text-xl font-semibold text-[var(--dark-brown)]">
                Past Appointments
                <span className="ml-2 bg-[var(--dark-brown)] text-[var(--white)] px-2 py-1 rounded-full text-sm">
                  {appointments.past.length}
                </span>
              </h2>
            </div>

            <div className="p-4">
              {appointments.past.length > 0 ? (
                <ul className="space-y-3">
                  {appointments.past.map((appointment) => (
                    <li
                      key={appointment.appointmentId}
                      className="p-4 bg-[var(--background-light)] rounded-lg border border-[var(--grey)] hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-[var(--dark-brown)]">
                            {appointment.serviceType}
                          </h3>
                          <p className="text-sm text-[var(--dark-brown)] mt-1">
                            {new Date(appointment.date).toLocaleDateString()} • {appointment.time}
                          </p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border
                            ${appointment.status === "Completed" ? "border-[var(--main-color)] text-[var(--main-color)]" :
                              "border-gray-300 text-gray-500"}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedAppointment(appointment)}
                          className="px-3 py-1 bg-[var(--dark-brown)] text-[var(--white)] rounded-md hover:bg-[var(--puppy-brown)] transition-colors"
                        >
                          Details
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <p className="text-[var(--grey)]">No past appointments found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}

export default UserAppointments;
