// AppointmentReport.jsx
import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function AppointmentReport({ appointments }) {
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text("Appointments Report", 10, 10);

    const tableData = appointments.map((appointment) => [
      appointment.petId?.name || "Unknown Pet",
      appointment.userId?.name || "Unknown Owner",
      appointment.serviceType || "Unknown Service",
      appointment.date ? appointment.date.split("T")[0] : "N/A",
      appointment.time || "N/A",
      appointment.status || "N/A",
    ]);

    autoTable(doc, {
      head: [
        [
          "Pet Name",
          "Owner",
          "Service",
          "Date",
          "Time",
          "Status",
        ],
      ],
      body: tableData,
    });

    doc.save("appointments_report.pdf");
  };

  return (
    <div className="flex justify-end mt-4">
      <button
        onClick={generatePDF}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Download PDF
      </button>
    </div>
  );
}

export default AppointmentReport;
