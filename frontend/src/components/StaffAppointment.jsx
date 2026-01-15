import React, { useEffect, useState } from "react";
import axios from "axios";

function StaffAppointmentList({ serviceType }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/appointments/${serviceType}`
        );
        // Filter only Confirmed or Completed appointments
        const filteredAppointments = response.data.filter(
          (appt) => appt.status === "Confirmed" || appt.status === "Completed"
        );
        setAppointments(filteredAppointments);
      } catch (error) {
        console.error("Error fetching appointments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [serviceType]);

  const markAsCompleted = async (id) => {
    try {
      await axios.put(`http://localhost:5000/appointments/complete/${id}`, {
        status: "Completed",
      });
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === id ? { ...appt, status: "Completed" } : appt
        )
      );
    } catch (error) {
      console.error("Error updating appointment status", error);
    }
  };

  return (
    <div className="p-6 bg-[#ffffff] rounded-lg shadow-md max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-[#3d1e24]">
        {serviceType} Appointments
      </h2>

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-pulse text-[#3d1e24]">Loading...</div>
        </div>
      ) : appointments.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-[#ccc4ba]">
          <table className="w-full border-collapse bg-[#ffffff]">
            <thead>
              <tr className="bg-[#f8cd9a] text-[#3d1e24]">
                {serviceType === "Boarding" ? (
                  <>
                    <th className="px-4 py-3 text-left font-semibold">Start Date</th>
                    <th className="px-4 py-3 text-left font-semibold">End Date</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left font-semibold">Date</th>
                    <th className="px-4 py-3 text-left font-semibold">Time</th>
                  </>
                )}
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id} className="border-t border-[#ccc4ba] hover:bg-[#fef9ea]">
                  {serviceType === "Boarding" && appointment.details?.boardingDetails ? (
                    <>
                      <td className="px-4 py-3 text-[#3d1e24]">
                        {appointment.details.boardingDetails.startDate?.split("T")[0] || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-[#3d1e24]">
                        {appointment.details.boardingDetails.endDate?.split("T")[0] || "N/A"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-[#3d1e24]">
                        {appointment.date?.split("T")[0] || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-[#3d1e24]">
                        {appointment.time || "N/A"}
                      </td>
                    </>
                  )}
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        appointment.status === "Confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {appointment.status === "Confirmed" ? (
                      <button
                        onClick={() => markAsCompleted(appointment._id)}
                        className="bg-[#faab54] text-[#ffffff] px-4 py-2 rounded text-sm font-medium hover:bg-[#da828f] transition-colors duration-200"
                      >
                        Complete
                      </button>
                    ) : (
                      <span className="text-green-800 text-sm">✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-[#3d1e24] bg-[#fef9ea] rounded-lg border border-[#ccc4ba]">
          No appointments found.
        </div>
      )}
    </div>
  );
}

export default StaffAppointmentList;
