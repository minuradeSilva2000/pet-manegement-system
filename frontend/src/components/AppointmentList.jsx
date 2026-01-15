import React, { useState, useEffect } from "react";
import axios from "axios";
import AppointmentFilter from "./FilterAppointment";
import AppointmentActions from "./AppointmentAction";
import AppointmentReport from "./AppointmentReport";

function AppointmentList() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [filter, setFilter] = useState({
        status: "",
        serviceType: "",
    });
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        axios.get("http://localhost:5000/appointments/")
            .then((response) => {
                console.log("API Response:", response.data);
                setAppointments(response.data);
                setFilteredAppointments(response.data);
            })
            .catch((error) => {
                console.error("Error fetching appointments:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []); 

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        applyFilter(filter, e.target.value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter((prevFilter) => {
            const newFilter = { ...prevFilter, [name]: value };
            applyFilter(newFilter, searchTerm);
            return newFilter;
        });
    };

    const applyFilter = (newFilter, searchTerm = "") => {
        let filtered = appointments;

        // Apply status filter
        if (newFilter.status) {
            filtered = filtered.filter(
                (appointment) => appointment.status === newFilter.status
            );
        }

        // Apply service type filter
        if (newFilter.serviceType) {
            filtered = filtered.filter(
                (appointment) => appointment.serviceType === newFilter.serviceType
            );
        }

        // Apply search term filter (only Pet name and Owner name)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((appointment) => {
                const petName = appointment.petId?.name?.toLowerCase() || "";
                const ownerName = appointment.userId?.name?.toLowerCase() || "";
                return petName.includes(term) || ownerName.includes(term);
            });
        }

        setFilteredAppointments(filtered);
    };

    const updateStatusInState = (id, newStatus) => {
        setAppointments((prev) =>
            prev.map((appointment) =>
                appointment._id === id ? { ...appointment, status: newStatus } : appointment
            )
        );
        setFilteredAppointments((prev) =>
            prev.map((appointment) =>
                appointment._id === id ? { ...appointment, status: newStatus } : appointment
            )
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#fef9ea]">
            <div className="text-center py-10 font-bold text-[#3d1e24] text-xl">
                Loading<span className="animate-pulse">...</span>
            </div>
        </div>
    );

    return (
        <div className="bg-[#fef9ea] min-h-screen p-4 md:p-6">
            <div className="max-w-6xl mx-auto bg-[#ffffff] shadow-md rounded-lg overflow-hidden">
                <div className="bg-[#f8cd9a] bg-opacity-70 px-4 py-3 border-b border-[#ccc4ba]">
                    <h2 className="text-xl md:text-2xl font-semibold text-[#3d1e24] text-center">
                        Appointments List
                    </h2>
                </div>

                <div className="p-3 md:p-4">
                    {/* Search Input (Pet name and Owner name) */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search by Pet name or Owner name..."
                            className="w-full p-2 border border-[#ccc4ba] rounded-md focus:outline-none focus:ring-2 focus:ring-[#faab54]"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <AppointmentFilter filter={filter} onFilterChange={handleFilterChange} />

                    {/* Table */}
                    <div className="mt-4 border border-[#ccc4ba] rounded-md shadow-sm">
                        <div className="overflow-x-auto">
                            <div className="overflow-y-auto max-h-110 scrollbar-thin scrollbar-thumb-[#ccc4ba] scrollbar-track-transparent">
                                <table className="w-full border-collapse table-auto">
                                    <thead className="sticky top-0 z-10">
                                        <tr className="bg-[#faab54] bg-opacity-40 text-[#3d1e24] text-xs md:text-sm">
                                            <th className="px-3 py-2 text-left font-medium">Pet Name</th>
                                            <th className="px-3 py-2 text-left font-medium">Owner</th>
                                            <th className="px-3 py-2 text-left font-medium">Service</th>
                                            <th className="px-3 py-2 text-left font-medium">Details</th>
                                            <th className="px-3 py-2 text-left font-medium">Date</th>
                                            <th className="px-3 py-2 text-left font-medium">Time</th>
                                            <th className="px-3 py-2 text-left font-medium">Status</th>
                                            <th className="px-3 py-2 text-left font-medium">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredAppointments.map((appointment, index) => (
                                            <tr
                                                key={appointment._id}
                                                className={`border-b border-[#ccc4ba] duration-200 hover:bg-[#fef9ea] ${
                                                    index % 2 === 0 ? "bg-[#e6ded4] bg-opacity-30" : "bg-white"
                                                }`}
                                            >
                                                <td className="px-3 py-2 text-[#3d1e24] font-medium">
                                                    {appointment.petId?.name || "Unknown Pet"}
                                                </td>
                                                <td className="px-3 py-2 text-[#3d1e24]">
                                                    {appointment.userId?.name || "Unknown User"}
                                                </td>
                                                <td className="px-3 py-2 text-[#3d1e24]">{appointment.serviceType}</td>
                                                <td className="px-3 py-2 text-[#3d1e24] max-w-xs truncate">
                                                    {appointment.details ? (
                                                        appointment.serviceType === "Grooming" ? (
                                                            appointment.details.groomingType
                                                        ) : appointment.serviceType === "Training" ? (
                                                            appointment.details.trainingType
                                                        ) : appointment.serviceType === "Medical" ? (
                                                            appointment.details.medicalType
                                                        ) : appointment.serviceType === "Boarding" &&
                                                          appointment.details.boardingDetails ? (
                                                            <span className="whitespace-nowrap">
                                                                {new Date(appointment.details.boardingDetails.startDate)
                                                                    .toISOString()
                                                                    .split("T")[0]} to {" "}
                                                                {new Date(appointment.details.boardingDetails.endDate)
                                                                    .toISOString()
                                                                    .split("T")[0]}
                                                            </span>
                                                        ) : (
                                                            "No details available"
                                                        )
                                                    ) : (
                                                        "No details available"
                                                    )}
                                                </td>

                                                <td className="px-3 py-2 text-[#3d1e24] whitespace-nowrap">
                                                    {appointment.date ? appointment.date.split("T")[0] : "N/A"}
                                                </td>
                                                <td className="px-3 py-2 text-[#3d1e24]">{appointment.time}</td>
                                                <td className="px-3 py-2">
                                                    <span
                                                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                                            appointment.status === "Booked"
                                                                ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                                                                : appointment.status === "Confirmed"
                                                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                                : appointment.status === "Completed"
                                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                                : appointment.status === "Cancelled"
                                                                ? "bg-red-50 text-red-700 border border-red-200"
                                                                : "bg-gray-50 text-gray-700 border border-gray-200"
                                                        }`}
                                                    >
                                                        {appointment.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <AppointmentActions
                                                        appointmentId={appointment._id}
                                                        currentStatus={appointment.status}
                                                        date={appointment.date}
                                                        time={appointment.time}
                                                        serviceType={appointment.serviceType}
                                                        onStatusUpdate={updateStatusInState}
                                                    />
                                                </td>
                                            </tr>
                                        ))}

                                        {filteredAppointments.length === 0 && (
                                            <tr>
                                                <td colSpan="8" className="px-3 py-6 text-center text-[#3d1e24]">
                                                    No appointments found matching your criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 text-xs text-[#3d1e24] text-right">
                        Showing {filteredAppointments.length} of {appointments.length} appointments
                    </div>
                </div>
            </div>

            <AppointmentReport appointments={filteredAppointments} />
        </div>
    );
}

export default AppointmentList;
